import { useRef, useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Modal from 'react-modal';

import { Game } from '../game/Game';

Modal.setAppElement('#root');

function RoomGame({ socket }) {
    const navigate = useNavigate();
    const canvasRef = useRef(null);
    const gameRef = useRef(null);
    const params = useParams();
    const [isGameOver, setIsGameOver] = useState(false);
    const [winnerID, setWinnerID] = useState("");


    useEffect(() => {
        socket.emit("gameStateRequest", { roomID: params.roomID });
    }, []);

    useEffect(() => {
        socket.on("gameStateResponse", (data) => {
            if (!gameRef.current) {
                gameRef.current = new Game({ canvasRef:canvasRef, socket:socket, gameState:data.gameState });
                gameRef.current.onConfirmButton(() => handleConfirmButton());
            }
        });

        socket.on("gameActionResponse", (data) => {
            gameRef.current.update(data.gameAction);
            setIsGameOver(data.gameAction.isGameOver);
            setWinnerID(data.gameAction.winnerID);
        });

        return () => {
            socket.off("gameStateResponse");
            socket.off("gameActionResponse");
            if (gameRef.current) {
                gameRef.current.end();
                gameRef.current = null;
            }
        };
    }, [socket]);

    const handleConfirmButton = () => {
        const selectedCards = {
            hand: gameRef.current.players[socket.id].hand.filter(card => card.selected).map(card => card.name),
            rearguard: gameRef.current.players[socket.id].rearguard.filter(card => card.selected).map(card => card.name)
        }

        socket.emit("gameActionRequest", { roomID: params.roomID, playerSelection:selectedCards });
    }

    const handleRematch = () => {
        socket.emit("goBackLobbyRequest", { roomID: params.roomID });
    }

    const handleLeave = () => {
        navigate("/");
    }

    return (
        <div ref={canvasRef} >
            <Modal
                isOpen={isGameOver}
                className={"flex items-center justify-center h-screen"}
                contentLabel="Game Over"
            >
                <div className='grid justify-items-center w-2/3'>
                    <div className='text-4xl text-center text-slate-500 font-black drop-shadow-md'>
                        {
                            winnerID === socket.id?
                            <h2>You Won !!!</h2>
                            :
                            <h2>You lost...</h2>
                        }
                    </div>
                    <div className='p-6 flex justify-center '>
                        <button
                            className="mx-2 px-4 py-2 rounded-lg bg-red-500 hover:bg-red-700 font-black text-lg text-white"
                            onClick={handleLeave}
                        >
                            LEAVE
                        </button>
                        <button
                            className="mx-2 px-4 py-2 rounded-lg font-black text-lg text-white bg-emerald-500 hover:bg-emerald-700"
                            onClick={handleRematch}
                        >
                            REMATCH
                        </button>
                    </div>
                </div>
            </Modal>
        </div>
    );
}

export default RoomGame;
