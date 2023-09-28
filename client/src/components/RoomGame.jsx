import { useRef, useEffect } from 'react';
import { useParams } from 'react-router-dom';

import { Game } from '../game/Game';

function RoomGame({ socket }) {
    const canvasRef = useRef(null);
    const gameRef = useRef(null);
    const params = useParams();

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
            shield: gameRef.current.players[socket.id].shield.filter(card => card.selected).map(card => card.name)
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

    return (
        <div ref={canvasRef} />
    );
}

export default RoomGame;
