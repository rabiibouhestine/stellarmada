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
            }
        });

        return () => {
            socket.off("gameStateResponse");
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

        const gameAction = {
            isGameOver: false,
            players: {}
        };

        gameAction.players[socket.id] = {
            isWinner: false,
            stance: "waiting",
            attackValue: 0,
            damageValue: 0,
            actions: {
                attack: {
                    units: [...selectedCards.hand, ...selectedCards.shield]
                },
                revive: {
                    x: 2
                },
                buildShield: {
                    units: "6S"
                },
                drawTavern: {
                    x: 0,
                    units: ["3H", "5D"]
                }
            } 
        }

        gameRef.current.update(gameAction);
    }

    return (
        <div ref={canvasRef} />
    );
}

export default RoomGame;
