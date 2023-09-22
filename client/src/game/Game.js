import * as PIXI from "pixi.js";

import cardsSheet from './assets/cards.json';
import cardsImage from './assets/cards.jpg';
import positions from './assets/positionsDict.json';

import { Player } from "./entities/Player";
import { Board } from "./entities/Board";
import { Button } from "./entities/Button";

export class Game {
    constructor({ canvasRef, socket }) {
        this.playerID = socket.id;

        this.app = new PIXI.Application({
            resizeTo: window,
            backgroundColor: 0x5BBA6F,
        });
        global.__PIXI_APP__ = this.app;
        
        this.sheet = new PIXI.Spritesheet(
            PIXI.BaseTexture.from(cardsImage),
            cardsSheet
        );
        this.sheet.parse(); // load assets: see docs, needs await for some reason!!!

        canvasRef.current.appendChild(this.app.view);
    }

    start(gameState) {
        this.board = new Board(this.app);
        this.button = new Button(this.app, {x:1200, y:500}, "Confirm");
        this.opponent = new Player(this.app, this.sheet, gameState.state.opponent, gameState.phase, positions.top, false);
        this.player = new Player(this.app, this.sheet, gameState.state.player, gameState.phase, positions.bottom, true);

        this.app.start();
    }

    // update(data) {
    //     if (this.playerID === data.player) {
    //         // update the stance of the player instance (this.player)
    //         // the stance is either 'attacking', 'discarding' or 'waiting'
    //     }

    //     // execute opponent actions
    //     // get actions of data.actions.id !== socket.id
    //     for (action in actions) {
    //         // execute action
    //     }

    //     // execute player actions
    //     // get actions of data.actions.id == socket.id
    //     for (action in actions) {
    //         // execute action
    //     }
    // }

    end() {
        this.sheet.destroy(true);
        this.app.stop();
        this.app.destroy(true, true);
    }

    onButton(event) {
        this.button.button.on('pointerdown', event);
    }
}
