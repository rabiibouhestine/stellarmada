import { useState } from 'react';
import { useParams } from 'react-router-dom';

function RoomLobby({ socket }) {
    const params = useParams();

    const [playerReady, setPlayerReady] = useState(false);

    const handleReady = () => {
        const isPlayerReady = !playerReady;
        setPlayerReady(isPlayerReady);
        socket.emit("handleReady", { roomID: params.roomID, isReady:isPlayerReady });
    }

    return (
        <div>
            <h1>Lobby</h1>
            <h3>I am ready: {playerReady.toString()}</h3>
            <input
                type="checkbox"
                checked={playerReady}
                onChange={handleReady}
            />
        </div>
    );
}

export default RoomLobby;
