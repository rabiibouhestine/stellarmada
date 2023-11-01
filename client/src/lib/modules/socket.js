import { browser } from "$app/environment"
import io from 'socket.io-client';

let socketConnection;

if (browser) {
    socketConnection = io.connect("http://localhost:3001");
    console.log("cookie:", document.cookie);
}

export const socket = socketConnection;
