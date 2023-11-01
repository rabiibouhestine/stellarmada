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

    // if roomID is not in data we return error
    if (!roomID) {
        res.status(500).json({ error: 'An error occurred while processing the request.' });
        return;
    }

    // if room does not exist we create it
    if (!rooms.hasOwnProperty(roomID)) {
        const room = {
            roomID: roomID,
            gameStarted: false,
            players: {},
            gameState: {}
        };
        rooms[roomID] = room;
    }

    // get room
    const room = rooms[roomID];

    // if room is full we return error
    if (Object.keys(room.players).length >= 2) {
        res.status(500).json({ error: 'An error occurred while processing the request.' });
        return;
    }

    // if game started we return error
    if (room.gameStarted) {
        res.status(500).json({ error: 'An error occurred while processing the request.' });
        return;
    }

    res.json({ gameStarted: room.gameStarted });
});

io.on("connection", (socket) => {
    const playerID = socket.id;
    console.log("Player connected:", playerID);
    users[playerID] = {
        room: null
    }

    socket.on("joinRoom", (data) => {
        const roomID = data.roomID;

        // get room
        const room = rooms[roomID];

        // update user
        users[playerID].room = roomID;
        // add user to room
        rooms[roomID].players[playerID] = {
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
            // remove player from room
            delete rooms[userRoom].players[playerID];
            // update player
            users[playerID].room = null;
            // if room empty after player leaves we delete it
            if (rooms[userRoom].players.length === 0) {
                delete rooms[userRoom];
            }
        }
    })

    socket.on("messageRequest", (data) => {
        io.to(data.roomID).emit("messageResponse", {message: data.message});
    })

    socket.on("disconnect", (reason) => {
        console.log("Player socket disconnected:", playerID, "- reason:", reason);

        // get player room
        const userRoom = users[playerID].room;

        // if user was in a room that still exists
        if (userRoom !== null && rooms.hasOwnProperty(userRoom)) {
            // remove player from room
            delete rooms[userRoom].players[playerID];
            // update player
            users[playerID].room = null;
            // if room empty after player leaves we delete it
            if (rooms[userRoom].players.length === 0) {
                delete rooms[userRoom];
            }
        }

        // remove user from users
        delete users[playerID];
    })
})


server.listen(port, () => {
    console.log("SERVER RUNNING");
});
