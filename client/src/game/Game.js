import * as PIXI from "pixi.js";

import cardsSheet from './assets/cards.json';
import cardsImage from './assets/cards.jpg';

import { Player } from "./entities/Player";
import { Board } from "./entities/Board";

export class Game {
    constructor({ ref }) {
        this.ref = ref;
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

        const playerState = {
            hand: ["tile036.jpg", "tile037.jpg", "tile038.jpg", "tile039.jpg", "tile001.jpg", "tile002.jpg", "tile003.jpg"],
            handCount: 7,
            field: ["tile026.jpg", "tile027.jpg", "tile040.jpg", "tile041.jpg"],
            shield: ["tile016.jpg", "tile017.jpg"],
            tavern: 25,
            grave: 7,
            castle: 4,
            jester: 1
        };

        const opponentState = {
            hand: ["tile036.jpg", "tile037.jpg", "tile038.jpg", "tile039.jpg", "tile001.jpg", "tile002.jpg", "tile003.jpg"],
            handCount: 7,
            field: [],
            shield: ["tile016.jpg", "tile017.jpg"],
            tavern: 15,
            grave: 11,
            castle: 7,
            jester: 2
        };
        

        const playerPositions = {
            hand: {x: 320, y: 670},
            field: {x: 480, y: 370},
            shield: {x: 900, y: 520},
            tavern: {x: 360, y: 520},
            grave: {x: 260, y: 520},
            castle: {x: 760, y: 520},
            jester: {x: 510, y: 520}
        };

        const opponentPositions = {
            hand: {x: 320, y: 70},
            field: {x: 480, y: 370},
            shield: {x: 260, y: 220},
            tavern: {x: 900, y: 220},
            grave: {x: 1000, y: 220},
            castle: {x: 510, y: 220},
            jester: {x: 650, y: 220}
        };

        this.player = new Player(this.app, this.sheet, playerState, playerPositions, true);
        this.opponent = new Player(this.app, this.sheet, opponentState, opponentPositions, false);

        this.app.start();
    }

    end() {
        this.sheet.destroy(true);
        this.app.destroy(true, true);
    }
}
