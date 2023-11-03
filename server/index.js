const { initGameState, handleActionRequest } = require("./game/game.js");
const { processGameState, processGameAction } = require("./game/utils.js");

const express = require("express");
const http = require("http");
const cors = require("cors");
const { Server } = require("socket.io");

const port = process.env.PORT || 3001;
const app = express();
app.use(cors());

const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: "http://localhost:5173",
        methods: ["GET", "POST"],
    }
});

const rooms = {};
const users = {};




app.get('/api/users', (req, res) => {
    res.json({ playersOnline: Object.keys(users).length });
});

app.get('/join', (req, res) => {
    const roomID = req.query.roomID;

    // if roomID is not in query params we return error
    if (!roomID) {
        res.status(500).json({ error: 'roomID not found' });
        return;
    }

    // if room does not exist we create it
    if (!rooms.hasOwnProperty(roomID)) {
        rooms[roomID] = {
            roomID: roomID,
            gameStarted: false,
            sockets: {},
            gameState: {}
        };
    }

    // return room gameStarted status
    res.json({ gameStarted: rooms[roomID].gameStarted });
});





io.on("connection", (socket) => {
    const playerID = socket.handshake.query.playerID;
    console.log("Player connected:", playerID);

    if (!users[playerID]) {
        users[playerID] = {
            sockets: {
                [socket.id]: {
                    room: null
                }
            }
        };
    } else {
        users[playerID].sockets[socket.id] = {
            room: null
        };
    }



    socket.on("joinRoom", (data) => {
        const roomID = data.roomID;

        // update user
        users[playerID].sockets[socket.id].room = roomID;

        // update room:
        // if less than 2 sockets are players we add a player socket otherwise add a spectator socket
        let playersCount = 0;
        let roomSockets = rooms[roomID].sockets;
        for (const socketId in roomSockets) {
            if (roomSockets[socketId].isPlayer) {
                playersCount++;
            }
        }
        roomSockets[socket.id] = {
            playerID: playerID,
            isPlayer: playersCount < 2,
            isReady: false
        }

        // join socket to a socket.io room with same roomID
        socket.join(roomID);

        // emit room update event
        io.to(roomID).emit("roomUpdate", { playersNb: Object.keys(rooms[roomID].sockets).length })
    })

    socket.on("handleReady", (data) => {
        const roomID = data.roomID;

        // update player in rooms
        rooms[roomID].sockets[socket.id].isReady = data.isReady;

        // count players who are ready
        let playersReadyCount = 0;
        let roomSockets = rooms[roomID].sockets;
        for (const socketId in roomSockets) {
            if (roomSockets[socketId].isPlayer && roomSockets[socketId].isReady) {
                playersReadyCount++;
            }
        }

        // if 2 players ready we emit room ready response
        if (playersReadyCount === 2) {
            rooms[roomID].gameStarted = true;
            rooms[roomID].gameState = initGameState(rooms[roomID]);
            io.to(roomID).emit("handleReadyResponse");
        }
    })

    socket.on("gameStateRequest", (data) => {
        const gameState = processGameState(rooms[data.roomID].gameState, playerID);
        socket.emit("gameStateResponse", { gameState:gameState, success: true });
    })

    socket.on("gameActionRequest", (data) => {
        const roomID = data.roomID;
        const gameState = rooms[roomID].gameState;
        const gameAction = handleActionRequest(playerID, data.playerSelection, gameState);
        if (gameAction.isGameOver) {
            rooms[roomID].gameStarted = false;
            Object.keys(rooms[roomID].sockets).forEach(socketID => {
                rooms[roomID].sockets[socketID].isReady = false;
            });
        }

        const playerGameAction = processGameAction(gameAction, playerID, true);
        const enemyGameAction = processGameAction(gameAction, playerID, false);

        socket.emit("gameActionResponse", { gameAction:playerGameAction, success: true });
        socket.to(roomID).emit("gameActionResponse", { gameAction:enemyGameAction, success: true });
    })

    socket.on("surrenderRequest", (data) => {
        const roomID = data.roomID;
        rooms[roomID].gameStarted = false;
        Object.keys(rooms[roomID].sockets).forEach(socketID => {
            rooms[roomID].sockets[socketID].isReady = false;
        });

        // Get gamestate
        const gameState = rooms[roomID].gameState;
        // Get the players ids
        const playersIDS = Object.keys(gameState.players);
        // Get the enemy id
        const enemyID = playerID === playersIDS[0] ? playersIDS[1] : playersIDS[0];

        gameState.isGameOver = true;
        gameState.winnerID = enemyID;

        io.to(roomID).emit("surrenderResponse", { winnerID:enemyID, success: true });
    })

    socket.on("rematchRequest", (data) => {
        socket.emit("rematchResponse");
        socket.emit("roomUpdate", { playersNb: Object.keys(rooms[data.roomID].sockets).length })
    })

    socket.on("messageRequest", (data) => {
        io.to(data.roomID).emit("messageResponse", {message: data.message});
    })

    socket.on("leftRoom", () => {
        // if user was in a room
        const userRoom = users[playerID].sockets[socket.id].room;
        if (userRoom !== null) {
            // update room
            delete rooms[userRoom].sockets[socket.id];
            // update player
            users[playerID].sockets[socket.id].room = null;
            // if room empty after player leaves we delete it
            if (Object.keys(rooms[userRoom].sockets).length === 0) {
                delete rooms[userRoom];
            }
        }
    })

    socket.on("disconnect", (reason) => {
        console.log("Player socket disconnected:", playerID, "- reason:", reason);

        // if user was in a room
        const userRoom = users[playerID].sockets[socket.id].room;

        // if socket was in a room 
        if (userRoom !== null) {
            // update room
            delete rooms[userRoom].sockets[socket.id];
            // update player
            users[playerID].sockets[socket.id].room = null;
            // if room empty after player leaves we delete it
            if (Object.keys(rooms[userRoom].sockets).length === 0) {
                delete rooms[userRoom];
            }
        }

        // remove socket from player sockets
        delete users[playerID].sockets[socket.id];

        // if user has no sockets, remove user
        if (users[playerID].sockets.length === 0) {
            delete users[playerID];
        }
    })
})






server.listen(port, () => {
    console.log("SERVER RUNNING");
});
