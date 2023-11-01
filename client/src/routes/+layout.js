import io from 'socket.io-client';

export function load({ data }) {
    console.log(data.playerID);
    return {
        socket: io.connect("http://localhost:3001")
    }
}
