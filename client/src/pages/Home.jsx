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
        <div className="flex flex-col items-center justify-center h-screen bg-blue-300">
            <h1 className="text-8xl text-center text-slate-100 drop-shadow-md">Cowards Castle</h1>
            <button className="mt-20 px-4 py-2 rounded-lg bg-blue-500 hover:bg-blue-700 text-white" onClick={createRoom}>Create A Room</button>
        </div>
    );
}

export default Home;
