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
        "https://server.stellarmada.com",
        {
            query: {
                playerID: playerID,
                roomID: localStorage.getItem("roomID")
              }
        }    
    );
}

export const socket = socketConnection;
