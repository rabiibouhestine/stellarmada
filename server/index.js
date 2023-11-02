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

    res.json({ gameStarted: room.gameStarted });
});





io.on("connection", (socket) => {
    const playerID = socket.handshake.query.playerID;
    console.log("Player connected:", playerID);

    
    if (users[playerID]) {
        users[playerID].sockets.push(socket.id);
    } else {
        users[playerID] = { room: null, sockets: [socket.id] };
    }



    socket.on("joinRoom", (data) => {
        const roomID = data.roomID;

        // update user
        users[playerID].room = roomID;

        // update room
        if (rooms[roomID].players[playerID]) {
            rooms[roomID].players[playerID].isPresent = true;
            rooms[roomID].players[playerID].socket = socket.id;
        } else {
            rooms[roomID].players[playerID] = { isReady: false, isPresent: true, socket: socket.id };
        }

        // join socket to a room with same roomID
        socket.join(roomID);

        // emit room update event
        io.to(roomID).emit("roomUpdate", { playersNb: Object.keys(rooms[roomID].players).length })
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

    socket.on("rematchRequest", (data) => {
        socket.emit("rematchResponse");
        socket.emit("roomUpdate", { playersNb: Object.keys(rooms[data.roomID].players).length })
    })

    socket.on("leftRoom", () => {
        // if user was in a room
        const userRoom = users[playerID].room;
        if (userRoom !== null) {
            // update room
            rooms[userRoom].players[playerID].isPresent = false;
            // update player
            users[playerID].room = null;
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

        // get player room
        const userRoom = users[playerID].room;

        // if socket was in a room 
        if (userRoom !== null) {
            if (rooms.hasOwnProperty(userRoom)) {
                if (rooms[userRoom].players[playerID].socket === socket.id) {
                    // update room
                    rooms[userRoom].players[playerID].isPresent = false;
                    // update player
                    users[playerID].room = null;
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
            }
        }

        // remove socket from player sockets
        users[playerID].sockets = users[playerID].sockets.filter(item => item !== socket.id);

        // if user has no sockets, remove user
        if (users[playerID].sockets.length === 0) {
            delete users[playerID];
        }
    })
})






server.listen(port, () => {
    console.log("SERVER RUNNING");
});
