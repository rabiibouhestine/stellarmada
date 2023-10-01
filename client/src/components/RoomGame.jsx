import { useRef, useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Modal from 'react-modal';

import { Game } from '../game/Game';


const customStyles = {
    content: {
      top: '50%',
      left: '50%',
      right: 'auto',
      bottom: 'auto',
      marginRight: '-50%',
      transform: 'translate(-50%, -50%)',
    },
};

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
                gameRef.current.onJokerLeft(() => handleJokerLeft());
                gameRef.current.onJokerRight(() => handleJokerRight());
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

    const handleJokerLeft = () => {
        const canSelect = gameRef.current.players[socket.id].jokerLeft.isSelectable;
        if (canSelect) {
            socket.emit("jokerRequest", { roomID: params.roomID, joker: "left" });
        }
    }

    const handleJokerRight = () => {
        const canSelect = gameRef.current.players[socket.id].jokerRight.isSelectable;
        if (canSelect) {
            socket.emit("jokerRequest", { roomID: params.roomID, joker: "right" });
        }
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
                // onAfterOpen={afterOpenModal}
                // onRequestClose={closeModal}
                style={customStyles}
                contentLabel="Game Over"
            >
                {
                    winnerID === socket.id?
                    <h2>You Won !!!</h2>
                    :
                    <h2>You lost...</h2>
                }
                <button onClick={handleLeave} >
                        LEAVE
                </button>
                <button onClick={handleRematch} >
                        Rematch
                </button>
            </Modal>
        </div>
    );
}

export default RoomGame;
