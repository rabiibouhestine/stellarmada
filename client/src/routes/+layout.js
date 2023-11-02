import io from 'socket.io-client';
import { browser } from "$app/environment"

export function load({ data }) {
    if (browser) {
        const socket = io.connect(
            "http://localhost:3001",
            {
                query: {
                    playerID: data.playerID
                }
            }    
        );
        return {
            socket: socket
        }
    }
}
