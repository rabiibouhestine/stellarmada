
import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

import playerIcon from '../images/singleplayer.png';

function RoomLobby({ socket }) {
    const params = useParams();
    const navigate = useNavigate();
    const [isReady, setIsReady] = useState(false);
    const [playerDotClass, setplayerDotClass] = useState("");
    const [readyBtnClass, setReadyBtnClass] = useState("");

    const handleReady = () => {
        const isCurrentReady = !isReady;
        setIsReady(isCurrentReady);
        socket.emit("handleReady", { roomID: params.roomID, isReady:isCurrentReady });
    }

    const handleLeave = () => {
        navigate("/");
    }

    useEffect(() => {
        setplayerDotClass(
            isReady?
            "flex justify-center items-center rounded-full w-16 h-16 bg-emerald-500"
            :
            "flex justify-center items-center rounded-full w-16 h-16 bg-orange-500"
        );
        setReadyBtnClass(
            isReady?
            "w-2/5 mx-2 px-4 py-2 rounded-lg font-black text-lg text-white bg-orange-500 hover:bg-orange-700"
            :
            "w-2/5 mx-2 px-4 py-2 rounded-lg font-black text-lg text-white bg-emerald-500 hover:bg-emerald-700"
        );
    }, [isReady]);

    return (
        <div className="flex items-center justify-center h-screen bg-blue-300">
            <div className='grid justify-items-center'>
                <div className='flex justify-between w-1/3'>
                    <div className={playerDotClass}>
                        <img className='w-12 h-12 mx-auto' src={playerIcon}></img>
                    </div>
                    <div className={playerDotClass}>
                        <img className='w-12 h-12 mx-auto' src={playerIcon}></img>
                    </div>
                </div>
                <div className='mb-15 p-6'>
                    <h1 className="text-2xl text-center text-slate-100 font-black drop-shadow-md">WAITING FOR EVERYONE TO BE READY</h1>
                </div>
                <div className='mb-15 p-6'>
                    <h1 className="text-2xl text-center text-slate-100 font-black drop-shadow-md">Invite Link: {window.location.href}</h1>
                </div>
                <div className='flex justify-center w-full'>
                    <button className="w-1/5 mx-2 px-4 py-2 rounded-lg bg-red-500 hover:bg-red-700 font-black text-lg text-white" onClick={handleLeave} >
                        LEAVE
                    </button>
                    <button className={readyBtnClass} onClick={handleReady} >
                        {isReady? "UNREADY": "READY"}
                    </button>
                </div>
                </div>
        </div>
    );
}

export default RoomLobby;
