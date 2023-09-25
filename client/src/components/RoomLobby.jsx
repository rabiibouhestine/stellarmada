
import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

function RoomLobby({ socket }) {
    const params = useParams();
    const navigate = useNavigate();
    const [isReady, setIsReady] = useState(false);

    const handleReady = () => {
        const isCurrentReady = !isReady;
        setIsReady(isCurrentReady);
        socket.emit("handleReady", { roomID: params.roomID, isReady:isCurrentReady });
    }

    const handleLeave = () => {
        navigate("/");
    }

    return (
        <div className="flex items-center justify-center h-screen bg-blue-300">
            <div className='grid justify-items-center'>
                <div className='mb-15 p-6'>
                    <h1 className="text-2xl text-center text-slate-100 font-black drop-shadow-md">WAITING FOR EVERYONE TO BE READY</h1>
                </div>
                <div className='flex justify-between w-full'>
                    <button className="w-2/5 mt-4 px-4 py-2 rounded-lg bg-red-500 hover:bg-red-700 font-black text-lg text-white" onClick={handleLeave} >LEAVE</button>
                    <button
                        className={`w-2/5 mt-4 px-4 py-2 rounded-lg font-black text-lg text-white
                            ${
                                isReady?
                                'bg-orange-500 hover:bg-orange-700'
                                :
                                'bg-emerald-500 hover:bg-emerald-700'
                            }
                        `}
                        onClick={handleReady} >{isReady? "NOT READY": "READY"}</button>
                </div>
            </div>
        </div>
    );
}

export default RoomLobby;
