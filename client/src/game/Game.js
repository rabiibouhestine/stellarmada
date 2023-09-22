import * as PIXI from "pixi.js";

import cardsSheet from './assets/cards.json';
import cardsImage from './assets/cards.jpg';
import positions from './assets/positionsDict.json';

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
        this.positions = positions;
    }

    start() {
        this.ref.current.appendChild(this.app.view);
        this.sheet.parse(); // load assets: see docs, needs await for some reason!!!

        this.button = new Button(this.app, {x:1200, y:500}, "Confirm");
        this.player = new Player(this.app, this.sheet, this.gameState.state.player, this.gameState.phase, this.positions.player, true);
        this.opponent = new Player(this.app, this.sheet, this.gameState.state.opponent, this.gameState.phase, this.positions.opponent, false);

        this.app.start();
    }

    end() {
        this.sheet.destroy(true);
        this.app.destroy(true, true);
    }
}
