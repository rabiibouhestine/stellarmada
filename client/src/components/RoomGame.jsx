import { useRef, useEffect } from 'react';

import { Game } from '../game/Game';

function RoomGame({ socket }) {
    const ref = useRef(null);

    const gameState = {
        phase: "player attack",
        state: {
            player: {
                hand: ["2D", "AS", "AD", "5C", "8H", "5S", "9H"],
                handCount: 7,
                field: ["AC", "6S"],
                shield: ["4S", "7S"],
                tavern: 25,
                cemetry: 7,
                castle: 4,
                jester: 1
            },
            opponent: {
                hand: ["2D", "3S", "TD", "5C", "8H", "5S", "9H"],
                handCount: 7,
                field: [],
                shield: ["AS", "3S"],
                tavern: 15,
                cemetry: 11,
                castle: 7,
                jester: 2
            }
        }
    }


    // Create our game
    const game = new Game({ ref:ref, gameState:gameState });




    useEffect(() => {
        // On load start the game
        game.start();
        game.button.button.on('pointerdown', () => handleButton());
        game.player.setSelectable(gameState.phase);

        // On unload end the game
        return () => {
            game.end();
        };
    }, []);

    const handleButton = () => {
        const selectedCards = {
            hand: game.player.hand.filter(card => card.selected).map(card => card.name),
            shield: game.player.shield.filter(card => card.selected).map(card => card.name)
        }
        // game.player.discardShield(selectedCards.shield);
        // game.player.discardHand(selectedCards.hand.length, selectedCards.hand);
        game.player.attack(selectedCards.hand);
        game.player.setSelectable("opponent discard");

        // game.player.revive(2);
        // game.player.buildShield(["tile027.jpg"]);
        // game.player.drawTavern(1, ["tile027.jpg"]);
        // game.player.drawCastle("tile027.jpg");
        // game.player.attack(["tile003.jpg"]);
        // game.player.discardShield(["tile016.jpg"]);
        // game.player.discardHand(2, ["tile037.jpg", "tile038.jpg"]);
    }

    return (
        <div ref={ref} />
    );
}

export default RoomGame;
