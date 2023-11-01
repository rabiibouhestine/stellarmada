import io from 'socket.io-client';

export function load({ data }) {
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
