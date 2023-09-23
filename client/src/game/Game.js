import * as PIXI from "pixi.js";

import cardsSheet from './assets/cards.json';
import cardsImage from './assets/cards.jpg';
import positions from './assets/positionsDict.json';

import { Player } from "./entities/Player";
import { Board } from "./entities/Board";
import { Button } from "./entities/Button";

export class Game {
    constructor({ canvasRef, socket }) {
        this.playerID = "P1"; // TODO replace hardcoded id with socket.id

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
        this.players = this.createPlayers(this.app, this.sheet, this.playerID, gameState, positions)

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

    createPlayers(app, sheet, playerID, gameState, positions) {
        const players = {};
        const keys = Object.keys(gameState.players);
      
        if (keys.length !== 2) {
          throw new Error('gameState.players must have exactly 2 players.');
        }
      
        const firstPlayerKey = keys[0];
        const secondPlayerKey = keys[1];
      
        if (firstPlayerKey === playerID) {
          players[firstPlayerKey] = new Player(app, sheet, gameState.players[firstPlayerKey], positions.bottom, true);
          players[secondPlayerKey] = new Player(app, sheet, gameState.players[secondPlayerKey], positions.top, false);
        } else if (secondPlayerKey === playerID) {
          players[firstPlayerKey] = new Player(app, sheet, gameState.players[firstPlayerKey], positions.top, false);
          players[secondPlayerKey] = new Player(app, sheet, gameState.players[secondPlayerKey], positions.bottom, true);
        } else {
          players[firstPlayerKey] = new Player(app, sheet, gameState.players[firstPlayerKey], positions.top, false);
          players[secondPlayerKey] = new Player(app, sheet, gameState.players[secondPlayerKey], positions.bottom, false);
        }
      
        return players;
      }
}
