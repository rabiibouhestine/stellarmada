import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

import RoomGame from '../components/RoomGame';
import RoomLobby from '../components/RoomLobby';

function Room({ socket }) {
    const navigate = useNavigate();
    const params = useParams();

    const [gameStarted, setGameStarted] = useState(false);

    useEffect(() => {
        socket.emit("joinRoom", { roomID: params.roomID });
    }, []);

    useEffect(() => {
        socket.on("joinRoomResponse", (data) => {
            // if response has error we redirect user to home page
            if("error" in data) {
                navigate("/");
                return;
            }
            // if response is success we proceed
            setGameStarted(data.room.gameStarted);
        });

        socket.on("handleReadyResponse", () => {
            setGameStarted(true);
        });
    }, [socket]);

    return (
        <>
        {
            gameStarted?
            <RoomGame socket={socket} />
            :
            <RoomLobby socket={socket} />
        }
        </>
    );
}

export default Room;
