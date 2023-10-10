
import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

import { ClipboardIcon } from '@heroicons/react/24/solid';
import { UserIcon } from '@heroicons/react/24/solid';

function RoomLobby({ socket }) {
    const params = useParams();
    const navigate = useNavigate();
    const [isReady, setIsReady] = useState(false);
    const [readyBtnClass, setReadyBtnClass] = useState("");
    const [playersNb, setPlayersNb] = useState(0);

    const handleReady = () => {
        const isCurrentReady = !isReady;
        setIsReady(isCurrentReady);
        socket.emit("handleReady", { roomID: params.roomID, isReady:isCurrentReady });
    }

    const handleCopy = () => {
        navigator.clipboard.writeText(window.location.href);
    };

    const handleLeave = () => {
        socket.emit("leftRoom");
        navigate("/");
    }

    useEffect(() => {
        socket.on("roomUpdate", (data) => {
            setPlayersNb(data.playersNb);
        });
    }, [socket]);

    useEffect(() => {
        setReadyBtnClass(
            isReady?
            "w-2/5 mx-2 px-4 py-2 rounded-lg font-black text-lg text-white bg-orange-600 hover:bg-orange-700"
            :
            "w-2/5 mx-2 px-4 py-2 rounded-lg font-black text-lg text-white bg-lime-600 hover:bg-lime-700"
        );
    }, [isReady]);

    return (
        <div className="flex items-center justify-center h-screen bg-stone-600">
            <div className='grid justify-items-center w-2/3'>
                <div className='flex items-center justify-between w-1/3'>
                    <div className="flex justify-center items-center rounded-full w-16 h-16 bg-sky-600">
                        <UserIcon className="h-12 w-12 text-white" />
                    </div>
                    <h1 className='text-xl text-center text-slate-100 font-black'> VS </h1>
                    {
                        playersNb === 2 ?
                        <div className="flex justify-center items-center rounded-full w-16 h-16 bg-rose-600">
                            <UserIcon className="h-12 w-12 text-white" />
                        </div>
                        :
                        <div className="flex justify-center items-center rounded-full w-16 h-16 bg-slate-400"></div>
                    }
                </div>
                <div className='p-6'>
                    <h1 className="text-2xl text-center text-slate-100 font-black drop-shadow-md">
                    {
                        playersNb === 2 ?
                        "WAITING FOR EVERYONE TO BE READY"
                        :
                        "WAITING FOR OPPONENT TO JOIN"
                    }
                    </h1>
                </div>
                <div className='my-6 flex justify-center items-center w-full'>
                    <h1 className="px-4 py-2 rounded-l-lg text-md text-center text-slate-100 font-medium bg-stone-400">
                        {window.location.href}
                    </h1>
                    <button className="px-4 py-2 inline-flex items-center justify-center rounded-r-lg bg-stone-500 hover:bg-stone-700 font-black text-md text-white" onClick={handleCopy} >
                        <ClipboardIcon className="h-6 w-6 mr-2" />
                        <span>COPY INVITE LINK</span>
                    </button>
                </div>
                <div className='p-6 flex justify-center w-2/3'>
                    <button className="w-1/5 mx-2 px-4 py-2 rounded-lg bg-red-600 hover:bg-red-700 font-black text-lg text-white" onClick={handleLeave} >
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
