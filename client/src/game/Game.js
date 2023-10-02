import * as PIXI from "pixi.js";

import swordImage from './assets/images/sword.png';
import cardsImage from './assets/images/cards.png';
import cardsSheet from './assets/mappings/cards.json';
import positions from './assets/mappings/positionsDict.json';

import { Player } from "./entities/Player";
import { Board } from "./entities/Board";
import { Indicator } from "./entities/Indicator";

export class Game {
    constructor({ canvasRef, socket, gameState }) {
        this.playerID = socket.id;
        this.app = new PIXI.Application({
            resizeTo: window,
            resolution: window.devicePixelRatio || 1,
            autoDensity: true,
            backgroundColor: 0x00a37a,
        });
        global.__PIXI_APP__ = this.app;
        
        this.sheet = new PIXI.Spritesheet(
            PIXI.BaseTexture.from(cardsImage),
            cardsSheet
        );
        this.parseSheet();

        canvasRef.current.appendChild(this.app.view);

        this.board = new Board(this.app);
        this.damageIndicator = new Indicator(this.app, positions.frontline.damageIndicator, swordImage, gameState.turn.damage);
        this.players = this.createPlayers(this.app, this.sheet, this.playerID, gameState, positions, this.damageIndicator)

        for (const key of Object.keys(this.players)) {
            const player = this.players[key];

            // Get game turn state
            const turnPlayerID = gameState.turn.playerID;
            const stance = gameState.turn.stance;

            // Update player states
            player.setStance(this.playerID === turnPlayerID? stance : "waiting");
        }

        this.resize = () => {
            const windowWidth = window.innerWidth;
            const windowHeight = window.innerHeight;
    
            // Update renderer dimensions
            this.app.renderer.resize(windowWidth, windowHeight);

            // // Update canvas style dimensions
            // if ( (windowWidth / windowHeight) > (16 / 9) ) {
            //     this.app.stage.width = (16 / 9) * windowHeight;
            //     this.app.stage.height = windowHeight;
            // } else {
            //     this.app.stage.width = windowWidth;
            //     this.app.stage.height = (9 / 16) * windowWidth;
            // }
        }

        this.resize();
        window.addEventListener('resize', this.resize, this);
    }

    parseSheet = async () => {
        await this.sheet.parse();
    }

    update(data) {
        this.damageIndicator.setValue(data.turn.damage);
        for (const key of Object.keys(this.players)) {
            const player = this.players[key];

            // Perform player moves
            if (data.moves[key].length > 0) {
                for (const moveIndex in data.moves[key]) {
                    const move = data.moves[key][moveIndex];
                    player.moveCards(move.cardsNames, move.nCards, move.location, move.destination);
                }
                player.repositionBoard();
            }

            // Update jokers
            player.jokerLeft.setState(data.jokers[key].jokerLeft);
            player.jokerRight.setState(data.jokers[key].jokerRight);

            // Get game turn state
            const turnPlayerID = data.turn.playerID;
            const stance = data.turn.stance;

            // Update player states
            player.setStance(key === turnPlayerID? stance : "waiting");
        }
    }

    end() {
        this.sheet.destroy(true);
        this.app.stop();
        this.app.destroy(true, true);
    }

    onConfirmButton(event) {
        this.players[this.playerID].confirmButton.button.on('pointerdown', event);
    }

    onJokerLeft(event) {
        this.players[this.playerID].jokerLeft.sprite.on('pointerdown', event);
    }

    onJokerRight(event) {
        this.players[this.playerID].jokerRight.sprite.on('pointerdown', event);
    }

    createPlayers(app, sheet, playerID, gameState, positions, damageIndicator) {
        const players = {};
        const keys = Object.keys(gameState.players);
      
        if (keys.length !== 2) {
          throw new Error('gameState.players must have exactly 2 players.');
        }
      
        const firstPlayerKey = keys[0];
        const secondPlayerKey = keys[1];
      
        if (firstPlayerKey === playerID) {
          players[firstPlayerKey] = new Player(app, sheet, gameState.players[firstPlayerKey], positions.bottom, damageIndicator, true);
          players[secondPlayerKey] = new Player(app, sheet, gameState.players[secondPlayerKey], positions.top, damageIndicator, false);
        } else if (secondPlayerKey === playerID) {
          players[firstPlayerKey] = new Player(app, sheet, gameState.players[firstPlayerKey], positions.top, damageIndicator, false);
          players[secondPlayerKey] = new Player(app, sheet, gameState.players[secondPlayerKey], positions.bottom, damageIndicator, true);
        } else {
          players[firstPlayerKey] = new Player(app, sheet, gameState.players[firstPlayerKey], positions.top, damageIndicator, false);
          players[secondPlayerKey] = new Player(app, sheet, gameState.players[secondPlayerKey], positions.bottom, damageIndicator, false);
        }
      
        return players;
    }
}
