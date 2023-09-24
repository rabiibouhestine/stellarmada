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
        <div className="flex flex-col items-center justify-center h-screen bg-blue-300">
            <h1 className="text-8xl text-center text-slate-100 drop-shadow-md">Lobby</h1>
            <h3 className="mt-10 text-4xl text-center text-slate-100 drop-shadow-md">I am ready: {playerReady.toString()}</h3>
            <input
                className='mt-10'
                type="checkbox"
                checked={playerReady}
                onChange={handleReady}
            />
        </div>
    );
}

export default RoomLobby;
