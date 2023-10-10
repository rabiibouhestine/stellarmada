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
        <div className="flex items-center justify-center h-screen bg-slate-600">
            <div className='grid justify-items-center'>
                <div className='mb-15 p-6'>
                    <h1 className="text-6xl text-center text-slate-100 font-black drop-shadow-md">COWARDS CASTLE</h1>
                </div>
                <button className="w-1/2 mt-4 px-4 py-2 rounded-lg bg-cyan-600 hover:bg-cyan-500 font-black text-lg text-white" >PLAY AGAINST AI</button>
                <button className="w-1/2 mt-4 px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 font-black text-lg text-white" onClick={createRoom}>CREATE A ROOM</button>
            </div>
        </div>
    );
}

export default Home;
