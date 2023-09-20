import { useRef, useEffect } from 'react';

import { Game } from '../game/Game';

function RoomGame() {
    const ref = useRef(null);

    // Create our game
    const game = new Game({ ref:ref });

    useEffect(() => {
        // On load start the game
        game.start();
    
        // On unload end the game
        return () => {
            game.end();
        };
    }, []);

    const createRoom = () => {
        // game.player.revive(2);
        // game.player.buildShield(["tile027.jpg"]);
        // game.player.drawTavern(1, ["tile027.jpg"]);
        // game.player.drawCastle("tile027.jpg");
        // game.player.attack(["tile003.jpg"]);
        // game.player.discardShield(["tile016.jpg"]);
        // game.player.discardHand(2, ["tile037.jpg", "tile038.jpg"]);
    }

    return (
        <div>
            <button onClick={createRoom}>Create A Room</button>
            <div ref={ref} />
        </div>
    );
}

export default RoomGame;
