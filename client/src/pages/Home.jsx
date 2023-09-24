import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

function Home({ socket }) {
    const navigate = useNavigate();

    const createRoom = () => {
        socket.emit("createRoom");
    }

    useEffect(() => {
        socket.on("createRoomResponse", (data) => {
            navigate(`/${data.room.roomID}`);
        });
    }, [socket]);

    return (
        <div className="flex flex-col items-center justify-center h-screen">
            <h1 className="text-9xl text-center">Cowards Castle</h1>
            <button className="mt-4 px-4 py-2 bg-blue-500 text-white" onClick={createRoom}>Create A Room</button>
        </div>
    );
}

export default Home;
