const { initGameState, handleActionRequest } = require("./game/game.js");
const { processGameState, processGameAction } = require("./game/utils.js");
const ShortUniqueId = require('short-unique-id');
const Timer = require("./game/Timer.js");

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
const players = {};
const waitingPlayers = [];


app.get('/join', (req, res) => {
    const playerID = req.query.userID;
    const roomID = req.query.roomID;

    let playersNb = 0;
    let gameStarted = false;

    if (rooms[roomID]) {
        gameStarted = rooms[roomID].gameStarted;
        playersNb = Object.keys(rooms[roomID].players).length;
        // if room full we return error
        if (playersNb === 2 && !(playerID in rooms[roomID].players)) {
            res.status(500).json({ error: 'room is full' });
            return;
        }
    }

    // return room information
    res.json({ gameStarted: gameStarted, playersNb: playersNb + 1 });
});





io.on("connection", (socket) => {
    const playerID = socket.handshake.query.playerID;
    console.log("socket connected:", socket.id, "| playerID:", playerID);

    const endGame = () => {

        let winnerID;
        const roomID = players[playerID].room;

        // if isGameOver this is triggered by action request and winner is already set
        // otherwise this is triggered by timer or surrender and current playerID is loser
        if (rooms[roomID].gameState.isGameOver) {
            winnerID = rooms[roomID].gameState.winnerID;
        } else {
            // get the players ids
            const playersIDS = Object.keys(rooms[roomID].players);

            // set the winner id
            winnerID = playerID === playersIDS[0] ? playersIDS[1] : playersIDS[0];

            // update gamestate
            rooms[roomID].gameState.isGameOver = true;
            rooms[roomID].gameState.winnerID = winnerID;
        }

        // update room
        rooms[roomID].gameStarted = false;
        rooms[roomID].messages = [];

        // update players
        Object.keys(rooms[roomID].players).forEach(playerID => {
            rooms[roomID].players[playerID].isReady = false;
            rooms[roomID].players[playerID].timer.reset();
        });

        // emit game ended event
        io.to(roomID).emit("gameEnded", { winnerID:winnerID, success: true });
    }

    socket.on("findGame", () => {
        if (waitingPlayers.length) {
            const enemyID = waitingPlayers.shift();
            const roomID = new ShortUniqueId().rnd();
            rooms[roomID] = {
                roomID: roomID,
                gameStarted: false,
                gameState: null,
                players: {},
                messages: []
            };
            socket.emit("gameFound", { roomID: roomID });
            io.to(enemyID).emit("gameFound", { roomID: roomID });
        } else {
            waitingPlayers.push(socket.id);
        }
    })

    socket.on("joinRoom", (data) => {
        const roomID = data.roomID;

        // if room does not exist we create it
        if (!rooms.hasOwnProperty(roomID)) {
            rooms[roomID] = {
                roomID: roomID,
                gameStarted: false,
                gameState: null,
                players: {},
                messages: []
            };
        }

        // update players
        if (players[playerID]) {
            const oldSocket = players[playerID].socket;
            players[playerID] = {
                room: roomID,
                socket: socket.id
            };
            io.to(oldSocket).emit("roomKick");
        } else {
            players[playerID] = {
                room: roomID,
                socket: socket.id
            };
        }

        // update room
        if (rooms[roomID].players[playerID]) {
            rooms[roomID].players[playerID].isPresent = true;
        } else {
            rooms[roomID].players[playerID] = {
                isReady: false,
                isPresent: true,
                timer: new Timer(endGame, 1000 * 60 * 10)
            };
        }

        // join socket to a socket.io room with same roomID
        socket.join(roomID);

        // emit room update event
        io.to(roomID).emit("roomUpdate", { playersNb: Object.keys(rooms[roomID].players).length });
    })

    socket.on("gameStateRequest", (data) => {
        const room = rooms[data.roomID];
        if (room) {
            const processedGameState = processGameState(room.gameState, playerID);
            let timeLeft = {};
            for (const playerID in room.players) {
                if (room.players.hasOwnProperty(playerID)) {
                    timeLeft[playerID] = {
                        timeLeft: room.players[playerID].timer.timeLeft,
                        isRunning: room.players[playerID].timer.isRunning
                    };
                }
            }
            socket.emit("gameStateResponse", { gameState: processedGameState, timeLeft: timeLeft, messages: room.messages, success: true });
        }
    })

    socket.on("handleReady", (data) => {
        const roomID = data.roomID;

        // update player in rooms
        rooms[roomID].players[playerID].isReady = data.isReady;

        // count players who are ready
        let playersReadyCount = 0;
        let players = rooms[roomID].players;
        for (const playerID in players) {
            if (players[playerID].isReady) {
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

    socket.on("gameActionRequest", (data) => {
        const roomID = data.roomID;
        const room = rooms[roomID];

        const gameAction = handleActionRequest(playerID, data.playerSelection, room);

        const playerGameAction = processGameAction(gameAction, playerID, true);
        const enemyGameAction = processGameAction(gameAction, playerID, false);

        socket.emit("gameActionResponse", { gameAction:playerGameAction, success: true });
        socket.to(roomID).emit("gameActionResponse", { gameAction:enemyGameAction, success: true });

        if (room.gameState.isGameOver) {
            endGame();
        }
    })

    socket.on("surrenderRequest", () => {
        endGame();
    })

    socket.on("rematchRequest", (data) => {
        socket.emit("rematchResponse");
        socket.emit("roomUpdate", { playersNb: Object.keys(rooms[data.roomID].players).length });
    })

    socket.on("messageRequest", (data) => {
        const roomID = data.roomID;
        rooms[roomID].messages.push(data.message);
        io.to(data.roomID).emit("messageResponse", {message: data.message});
    })

    socket.on("disconnect", (reason) => {
        console.log("socket disconnected:", socket.id, "| playerID:", playerID, "| reason:", reason);

        // remove player from waiting players if they were in matchmaking
        if (waitingPlayers.includes(socket.id)) {
            const indexToRemove = waitingPlayers.indexOf(socket.id);
            waitingPlayers.splice(indexToRemove, 1); 
        }

        // if it's not a disconnect coming from a kick because of user opening multiple tabs
        if (players[playerID] && players[playerID].socket === socket.id) {
            // get room
            const roomID = players[playerID].room;
    
            // update players
            delete players[playerID];
    
            // update room
            if (rooms[roomID].gameStarted) {
                rooms[roomID].players[playerID].isPresent = false;
            } else {
                delete rooms[roomID].players[playerID];
            }
    
            // emit room update event
            io.to(roomID).emit("roomUpdate", { playersNb: Object.keys(rooms[roomID].players).length });
    
            // TODO also delete room if both players isPresent false
            // if room empty after room update
            if (Object.keys(rooms[roomID].players).length === 0) {
                // check again after 5 minutes
                setTimeout(() => {
                    // if still empty, delete room
                    if (rooms[roomID] && Object.keys(rooms[roomID].players).length === 0) {
                        delete rooms[roomID];
                    }
                }, 300000);
            }
        }
    })
})






server.listen(port, () => {
    console.log("SERVER RUNNING");
});
