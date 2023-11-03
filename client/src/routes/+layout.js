import { browser } from "$app/environment"
import io from 'socket.io-client';

export function load({ data }) {
    if (browser) {
        const socket = io.connect(
            "http://localhost:3001",
            {
                query: {
                    userID: data.userID
                }
            }    
        );
        return {
            socket: socket,
            userID: data.userID
        }
    }
}
