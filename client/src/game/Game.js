import * as PIXI from "pixi.js";

import cardsSheet from './assets/cards.json';
import cardsImage from './assets/cards.jpg';

import { Player } from "./entities/Player";
import { Board } from "./entities/Board";
import { Button } from "./entities/Button";

export class Game {
    constructor({ ref, gameState }) {
        this.ref = ref;
        this.gameState = gameState;

        this.app = new PIXI.Application({
            resizeTo: window,
            backgroundColor: 0x5BBA6F,
        });
        global.__PIXI_APP__ = this.app;
        this.sheet = new PIXI.Spritesheet(
            PIXI.BaseTexture.from(cardsImage),
            cardsSheet
        );
        this.board = new Board({ app:this.app });
    }

    start() {
        this.ref.current.appendChild(this.app.view);
        this.sheet.parse(); // load assets: see docs, needs await for some reason!!!

        const playerPositions = {
            hand: {x: 320, y: 670},
            field: {x: 480, y: 370},
            shield: {x: 900, y: 520},
            tavern: {x: 360, y: 520},
            cemetry: {x: 260, y: 520},
            castle: {x: 760, y: 520},
            jester: {x: 510, y: 520}
        };

        const opponentPositions = {
            hand: {x: 320, y: 70},
            field: {x: 480, y: 370},
            shield: {x: 260, y: 220},
            tavern: {x: 900, y: 220},
            cemetry: {x: 1000, y: 220},
            castle: {x: 510, y: 220},
            jester: {x: 650, y: 220}
        };

        this.button = new Button(this.app, {x:1200, y:500}, "Confirm");
        this.player = new Player(this.app, this.sheet, this.gameState.state.player, playerPositions, true);
        this.opponent = new Player(this.app, this.sheet, this.gameState.state.opponent, opponentPositions, false);

        this.app.start();
    }

    end() {
        this.sheet.destroy(true);
        this.app.destroy(true, true);
    }
}
