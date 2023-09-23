import { useRef, useEffect } from 'react';

import { Game } from '../game/Game';
import { useParams } from 'react-router-dom';

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
            gameRef.current.onButton(() => handleButton());
        });

        return () => {
            socket.off("gameStateResponse");
        };
    }, [socket]);

    const handleButton = () => {
        const selectedCards = {
            hand: gameRef.current.players["P1"].hand.filter(card => card.selected).map(card => card.name),
            shield: gameRef.current.players["P1"].shield.filter(card => card.selected).map(card => card.name)
        }
        gameRef.current.players["P1"].discardShield(selectedCards.shield);
        gameRef.current.players["P1"].discardHand(selectedCards.hand.length, selectedCards.hand);
        // // gameRef.player.attack(selectedCards.hand);
        // gameRef.player.phase = "player attack";

        // gameRef.player.revive(2);
        // gameRef.player.buildShield(["tile027.jpg"]);
        // gameRef.player.drawTavern(1, ["tile027.jpg"]);
        // gameRef.player.drawCastle("tile027.jpg");
        // gameRef.player.attack(["tile003.jpg"]);
        // gameRef.player.discardShield(["tile016.jpg"]);
        // gameRef.player.discardHand(2, ["tile037.jpg", "tile038.jpg"]);
    }

    return (
        <div ref={canvasRef} />
    );
}

export default RoomGame;
