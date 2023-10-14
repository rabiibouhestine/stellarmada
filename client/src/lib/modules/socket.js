import { browser } from "$app/environment"
import { v4 as uuidv4 } from 'uuid';
import io from 'socket.io-client';

let socketConnection;
let playerID;

if (browser) {

    playerID = localStorage.getItem("playerID");
    if (playerID === null) {
        playerID = uuidv4();
        localStorage.setItem("playerID", playerID);
    }

    socketConnection = io.connect(
        "http://localhost:3001",
        // "https://cowards-castle-server.onrender.com",
        {
            query: {
                playerID: playerID
              }
        }    
    );
}

export const socket = socketConnection;
