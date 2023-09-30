const express = require("express");
const app = express();
const http = require("http");
const cors = require("cors");
const { Server } = require("socket.io");
const ShortUniqueId = require('short-unique-id');
const port = process.env.PORT || 3001;

app.use(cors());

const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        // origin: "https://cowardscastle.netlify.app",
        origin: "http://localhost:3000",
        methods: ["GET", "POST"],
    }
});


const rooms = {};
const users = {};
const { initGameState, handleActionRequest, handleJokerRequest } = require("./game/game.js");
const { processGameState } = require("./game/utils.js");

io.on("connection", (socket) => {
    console.log("User connected", socket.id);
    users[socket.id] = {
        socketID: socket.id,
        room: null
    }

    socket.on("createRoom", () => {
        const roomID = new ShortUniqueId().rnd();
        const room = {
            roomID: roomID,
            gameStarted: false,
            players: {},
            gameState: {}
        };
        rooms[roomID] = room;
        socket.emit("createRoomResponse", { room: room, success: true });
    })

    socket.on("joinRoom", (data) => {
        const roomID = data.roomID;
        const room = rooms[roomID];
    
        // if room does not exist or roomID is not in data we return error
        if (!rooms.hasOwnProperty(roomID)) {
          socket.emit("joinRoomResponse", { error: "Room does not exist." });
          return;
        }

        // if room is full we return error
        if (Object.keys(room.players).length >= 2) {
            socket.emit("joinRoomResponse", { error: "Room is full." });
            return;
        }

        // update user
        users[socket.id].room = roomID;
        // add user to room
        rooms[roomID].players[socket.id] = {
            socketID: socket.id,
            isReady: false
        };

        // if socket is not already in room we join
        if (!socket.rooms.has(roomID)) {
            socket.join(roomID);
        }

        // emit response event
        socket.emit("joinRoomResponse", { room: room, success: true });

        // emit room update event
        io.to(roomID).emit("roomUpdate", { playersNb: Object.keys(room.players).length })
    })

    socket.on("handleReady", (data) => {
        // update player in rooms
        rooms[data.roomID].players[socket.id].isReady = data.isReady;

        // if room is not full return
        const players = rooms[data.roomID].players;
        if (Object.keys(players).length !== 2) {
            return;
        }

        // if both players in lobby are ready we emit response
        let isLobbyReady = true;
        for(const player in players) {
            isLobbyReady = isLobbyReady && players[player].isReady;
        }
        if (isLobbyReady) {
            rooms[data.roomID].gameStarted = true;
            rooms[data.roomID].gameState = initGameState(rooms[data.roomID]);
            io.to(data.roomID).emit("handleReadyResponse");
        }
    })

    socket.on("gameStateRequest", (data) => {
        const gameState = processGameState(rooms[data.roomID].gameState, socket.id);
        socket.emit("gameStateResponse", { gameState:gameState, success: true });
    })

    socket.on("gameActionRequest", (data) => {
        const gameState = rooms[data.roomID].gameState;
        const gameAction = handleActionRequest(socket.id, data.playerSelection, gameState);
        io.to(data.roomID).emit("gameActionResponse", { gameAction:gameAction, success: true });
    })

    socket.on("jokerRequest", (data) => {
        const gameState = rooms[data.roomID].gameState;
        const gameAction = handleJokerRequest(socket.id, data.joker, gameState);
        io.to(data.roomID).emit("gameActionResponse", { gameAction:gameAction, success: true });
    })

    socket.on("leftRoom", () => {
        // if user was in a room
        const userRoom = users[socket.id].room;
        if (userRoom !== null) {
            // remove user from room
            delete rooms[userRoom].players[socket.id];

            // emit room update event
            io.to(userRoom).emit("roomUpdate", { playersNb: Object.keys(rooms[userRoom].players).length })

            // delete room if empty
            if (Object.keys(rooms[userRoom].players).length == 0) {
                delete rooms[userRoom];
            }
        }
    })

    socket.on("disconnect", () => {
        console.log("User disconnected", socket.id);

        // if user was in a room
        const userRoom = users[socket.id].room;
        if (userRoom !== null) {
            // remove user from room
            delete rooms[userRoom].players[socket.id];

            // emit room update event
            io.to(userRoom).emit("roomUpdate", { playersNb: Object.keys(rooms[userRoom].players).length })

            // delete room if empty
            if (Object.keys(rooms[userRoom].players).length == 0) {
                delete rooms[userRoom];
            }
        }
        // remove user from users
        delete users[socket.id];
    })
})


server.listen(port, () => {
    console.log("SERVER RUNNING");
});
