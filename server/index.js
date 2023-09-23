const express = require("express");
const app = express();
const http = require("http");
const cors = require("cors");
const { Server } = require("socket.io");
const ShortUniqueId = require('short-unique-id');

app.use(cors());

const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: "http://localhost:3000",
        methods: ["GET", "POST"],
    }
});


const rooms = {};
const users = {};

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
            players: {}
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
            io.to(data.roomID).emit("handleReadyResponse");
        }
    })

    socket.on("gameStateRequest", () => {
        const gameState = {
            phase: "player discard",
            isGameOver: false,
            players: {
                "P1": {
                    isWinner: false,
                    stance: "attacking", // "discarding", "attacking" or "waiting"
                    hand: ["2D", "AS", "AD", "5C", "8H", "5S", "2H"],
                    handCount: 7,
                    field: ["AC", "6S"],
                    shield: ["4S", "7S"],
                    tavern: 25,
                    cemetry: 7,
                    castle: 4,
                    jester: 1,
                    attackValue: 0,
                    damageValue: 0
                },
                "P2": {
                    isWinner: false,
                    stance: "waiting", // "discarding", "attacking" or "waiting"
                    hand: ["2D", "3S", "TD", "5C", "8H", "5S", "9H"],
                    handCount: 7,
                    field: [],
                    shield: ["AS", "3S"],
                    tavern: 15,
                    cemetry: 11,
                    castle: 7,
                    jester: 2,
                    attackValue: 0,
                    damageValue: 0
                }
            }
        }
        socket.emit("gameStateResponse", { gameState:gameState, success: true });
    })

    socket.on("disconnect", () => {
        console.log("User disconnected", socket.id);

        // if user was in a room
        const userRoom = users[socket.id].room;
        if (userRoom !== null) {
            // remove user from room
            delete rooms[userRoom].players[socket.id];
            // delete room if empty
            if (Object.keys(rooms[userRoom].players).length == 0) {
                delete rooms[userRoom];
            }
        }
        // remove user from users
        delete users[socket.id];
    })
})


server.listen(3001, () => {
    console.log("SERVER RUNNING");
});
