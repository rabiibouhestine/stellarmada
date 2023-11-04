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
const players = {};




app.get('/api/users', (req, res) => {
    res.json({ playersOnline: Object.keys(players).length });
});

app.get('/join', (req, res) => {
    const roomID = req.query.roomID;

    // if roomID is not in query params we return error
    if (!roomID) {
        res.status(500).json({ error: 'roomID not found' });
        return;
    }

    // return room information
    let playersNb = 0;
    let gameStarted = false;
    if (rooms[roomID]) {
        playersNb = Object.keys(rooms[roomID].players).length + 1;
        gameStarted = rooms[roomID].gameStarted;
    }
    res.json({ gameStarted: gameStarted, playersNb: playersNb });
});





io.on("connection", (socket) => {
    const playerID = socket.id;
    const userID = socket.handshake.query.userID;
    console.log("Player connected:", playerID, "| userID:", userID);

    if (!players[playerID]) {
        players[playerID] = {
            room: null
        };
    } else {
        players[playerID].room = null;
    }



    socket.on("joinRoom", (data) => {
        const roomID = data.roomID;

        // if room does not exist we create it
        if (!rooms.hasOwnProperty(roomID)) {
            rooms[roomID] = {
                roomID: roomID,
                gameStarted: false,
                gameState: null,
                players: {}
            };
        }

        // if player not in room we join
        // emit.joinRoom currently runs in Lobby.svelte and Game.svelte
        // so a player going from Lobby to Game would be already in the room
        if (!rooms[roomID].players[playerID]) {
    
            // update player
            players[playerID].room = roomID;
    
            // update room
            rooms[roomID].players[playerID] = { isReady: false };
    
            // join socket to a socket.io room with same roomID
            socket.join(roomID);
    
            // emit room update event
            io.to(roomID).emit("roomUpdate", { playersNb: Object.keys(rooms[roomID].players).length });
        }

        // If room has game state we emit gameStateResponse
        if (rooms[roomID].gameState) {
            const gameState = processGameState(rooms[roomID].gameState, playerID);
            socket.emit("gameStateResponse", { gameState:gameState,  success: true });
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
        const gameState = rooms[roomID].gameState;
        const gameAction = handleActionRequest(playerID, data.playerSelection, gameState);
        if (gameAction.isGameOver) {
            rooms[roomID].gameStarted = false;
            Object.keys(rooms[roomID].players).forEach(playerID => {
                rooms[roomID].players[playerID].isReady = false;
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
        Object.keys(rooms[roomID].players).forEach(playerID => {
            rooms[roomID].players[playerID].isReady = false;
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
        socket.emit("roomUpdate", { playersNb: Object.keys(rooms[data.roomID].players).length });
    })

    socket.on("messageRequest", (data) => {
        io.to(data.roomID).emit("messageResponse", {message: data.message});
    })

    socket.on("leftRoom", () => {
        // if player was in a room
        const roomID = players[playerID].room;
        if (roomID) {
            // update room
            delete rooms[roomID].players[playerID];

            // emit room update event
            io.to(roomID).emit("roomUpdate", { playersNb: Object.keys(rooms[roomID].players).length });

            // update player
            players[playerID].room = null;

            // if room empty after player leaves we delete it
            if (Object.keys(rooms[roomID].players).length === 0) {
                delete rooms[roomID];
            }
        }
    })

    socket.on("disconnect", (reason) => {
        console.log("Player disconnected:", playerID, "| userID:", userID, "| reason:", reason);

        // get player room
        const roomID = players[playerID].room;

        // if player was in a room
        if (roomID) {            
            // remove player from room
            delete rooms[roomID].players[playerID];

            // emit room update event
            io.to(roomID).emit("roomUpdate", { playersNb: Object.keys(rooms[roomID].players).length });

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

        // delete player
        delete players[playerID];
    })
})






server.listen(port, () => {
    console.log("SERVER RUNNING");
});
