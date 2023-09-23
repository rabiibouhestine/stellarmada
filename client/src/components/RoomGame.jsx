import { useRef, useEffect } from 'react';
import { useParams } from 'react-router-dom';

import { Game } from '../game/Game';

function RoomGame({ socket }) {
    const canvasRef = useRef(null);
    const gameRef = useRef(null);
    const params = useParams();

    useEffect(() => {
        // On load
        if (!gameRef.current) {
            gameRef.current = new Game({ canvasRef:canvasRef, socket:socket });
            socket.emit("gameStateRequest", { roomID: params.roomID });
        }

        // On unload
        return () => {
            if (gameRef.current) {
                gameRef.current.end();
                gameRef.current = null;
            }
        }; 
    }, []);

    useEffect(() => {
        socket.on("gameStateResponse", (data) => {
            gameRef.current.start(data.gameState);
            gameRef.current.onConfirmButton(() => handleConfirmButton());
        });

        return () => {
            socket.off("gameStateResponse");
        };
    }, [socket]);

    const handleConfirmButton = () => {
        console.log("handleConfirmButton");
        const selectedCards = {
            hand: gameRef.current.players["P1"].hand.filter(card => card.selected).map(card => card.name),
            shield: gameRef.current.players["P1"].shield.filter(card => card.selected).map(card => card.name)
        }
        gameRef.current.players["P1"].discardShield(selectedCards.shield);
        gameRef.current.players["P1"].discardHand(selectedCards.hand.length, selectedCards.hand);

        gameRef.current.update(
            {
                isGameOver: false,
                players: {
                    P1: {
                        isWinner: false,
                        stance: "waiting",
                        attackValue: 0,
                        damageValue: 0,
                        actions: {
                            revive: {
                                x: 2
                            },
                            buildShield: {
                                units: "6S"
                            },
                            drawTavern: {
                                x: 0,
                                units: ["2H", "5D"]
                            }
                        } 
                    },
                    P2: {
                        isWinner: false,
                        stance: "discarding",
                        attackValue: 0,
                        damageValue: 0,
                        actions: {
                            revive: {
                                x: 2
                            },
                            buildShield: {
                                unit: "3H"
                            }
                        } 
                    }
                }
            }
        );
    }

    return (
        <div ref={canvasRef} />
    );
}

export default RoomGame;
