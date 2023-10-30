const { initGameState, handleActionRequest } = require("./game/game.js");
const { processGameState, processGameAction } = require("./game/utils.js");

const express = require("express");
const http = require("http");
const cors = require("cors");
const { Server } = require("socket.io");
const ShortUniqueId = require('short-unique-id');

const port = process.env.PORT || 3001;
const app = express();
app.use(cors());

const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: "http://0.0.0.0:3000",
        // origin: "http://localhost:5173",
        methods: ["GET", "POST"],
    }
});

const rooms = {};
const users = {};

io.on("connection", (socket) => {
    const playerID = socket.handshake.query.playerID;
    const clientRoomID = socket.handshake.query.roomID;
    console.log("Player connected:", playerID);
    
    if (!users.hasOwnProperty(playerID)) {
        users[playerID] = {
            room: clientRoomID,
            sockets: [socket.id]
        }
    } else {
        users[playerID].sockets.push(socket.id);
    }


    socket.on("createRoom", () => {
        // if user already present in an existing room we return error
        const hasRoom = clientRoomID !== null;
        const clientRoomExists = rooms.hasOwnProperty(clientRoomID);
        const isPresent = clientRoomExists? rooms[clientRoomID].players[playerID].isPresent : false;
        if (hasRoom && clientRoomExists && isPresent) {
            socket.emit("createRoomResponse", { error: "Can't be in multiple rooms" });
            return;
        }
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

        // if room is full and no seat belongs to user we return error
        if (Object.keys(room.players).length >= 2 && !room.players.hasOwnProperty(playerID)) {
            socket.emit("joinRoomResponse", { error: "Room is full." });
            return;
        }

        // if user already present in an existing room we return error
        const hasRoom = clientRoomID !== null;
        const clientRoomExists = rooms.hasOwnProperty(clientRoomID);
        const isPresent = clientRoomExists? rooms[clientRoomID].players[playerID].isPresent : false;
        if (hasRoom && clientRoomExists && isPresent) {
            socket.emit("joinRoomResponse", { error: "Can't be in multiple rooms" });
            return;
        }

        // update user
        users[playerID].room = roomID;
        // update room
        if (room.players.hasOwnProperty(playerID)) {
            rooms[roomID].players[playerID].isPresent = true;
        } else {
            rooms[roomID].players[playerID] = {
                isReady: false,
                isPresent: true
            };
        }

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
        rooms[data.roomID].players[playerID].isReady = data.isReady;

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
        const gameState = processGameState(rooms[data.roomID].gameState, playerID);
        socket.emit("gameStateResponse", { gameState:gameState, success: true });
    })

    socket.on("gameActionRequest", (data) => {
        const gameState = rooms[data.roomID].gameState;
        const gameAction = handleActionRequest(playerID, data.playerSelection, gameState);
        if (gameAction.isGameOver) {
            rooms[data.roomID].gameStarted = false;
            Object.keys(rooms[data.roomID].players).forEach(playerID => {
                rooms[data.roomID].players[playerID].isReady = false;
            });
        }

        const playerGameAction = processGameAction(gameAction, playerID, true);
        const enemyGameAction = processGameAction(gameAction, playerID, false);

        socket.emit("gameActionResponse", { gameAction:playerGameAction, success: true });
        socket.to(data.roomID).emit("gameActionResponse", { gameAction:enemyGameAction, success: true });
    })

    socket.on("surrenderRequest", (data) => {
        rooms[data.roomID].gameStarted = false;
        Object.keys(rooms[data.roomID].players).forEach(playerID => {
            rooms[data.roomID].players[playerID].isReady = false;
        });

        // Get gamestate
        const gameState = rooms[data.roomID].gameState;
        // Get the players ids
        const playersIDS = Object.keys(gameState.players);
        // Get the enemy id
        const enemyID = playerID === playersIDS[0] ? playersIDS[1] : playersIDS[0];

        gameState.isGameOver = true;
        gameState.winnerID = enemyID;

        io.to(data.roomID).emit("surrenderResponse", { winnerID:enemyID, success: true });
    })

    socket.on("goBackLobbyRequest", (data) => {
        socket.emit("goBackLobbyResponse");
        socket.emit("roomUpdate", { playersNb: Object.keys(rooms[data.roomID].players).length })
    })

    socket.on("leftRoom", () => {
        // if user was in a room
        const userRoom = users[playerID].room;
        if (userRoom !== null) {
            // set room player status
            rooms[userRoom].players[playerID].isPresent = false;
            // if room empty after player leaves we delete it
            let playersPresent = 0;
            for (const key in rooms[userRoom].players) {
                const player = rooms[userRoom].players[key];
                if (player.isPresent) {
                    playersPresent++;
                }
            }
            if (playersPresent === 0) {
                delete rooms[userRoom];
            }
        }
    })

    socket.on("messageRequest", (data) => {
        io.to(data.roomID).emit("messageResponse", {message: data.message});
    })

    socket.on("disconnect", (reason) => {
        console.log("Player socket disconnected:", playerID, "- reason:", reason);

        // remove socket from player sockets
        const socketIndex = users[playerID].sockets.indexOf(socket.id);
        if (socketIndex !== -1) {
            users[playerID].sockets.splice(socketIndex, 1);
        }

        // If player has no sockets:
        if (users[playerID].sockets.length === 0) {
            // get player room
            const userRoom = users[playerID].room;

            // if user was in a room that still exists
            if (userRoom !== null && rooms.hasOwnProperty(userRoom)) {
                // set room player status
                rooms[userRoom].players[playerID].isPresent = false;
                // if room empty after player leaves we delete it
                let playersPresent = 0;
                for (const key in rooms[userRoom].players) {
                    const player = rooms[userRoom].players[key];
                    if (player.isPresent) {
                        playersPresent++;
                    }
                }
                if (playersPresent === 0) {
                    delete rooms[userRoom];
                }
            }

            // remove user from users
            delete users[playerID];
        }
    })
})


server.listen(port, () => {
    console.log("SERVER RUNNING");
});
