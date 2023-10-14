import * as PIXI from "pixi.js";

import cardsImage from './assets/images/kennyCards.jpg';
import cardsSheet from './assets/mappings/kennyCards.json';
import positions from './assets/mappings/positionsDict.json';

import { Player } from "./entities/Player";
import { Indicator } from "./entities/Indicator";
import { Button } from "./entities/Button";

import layout from './assets/images/brownMattress.png';
import { Mattress } from "./entities/Mattress";

export class Game {
    constructor({ canvasRef, socket, gameState }) {
        this.playerID = localStorage.getItem("playerID");

        this.app = new PIXI.Application({
            // resizeTo: window,
            width: 800,
            height: 720,
            resolution: window.devicePixelRatio || 1,
            autoDensity: true,
            backgroundColor: 0x475569,
        });
        globalThis.__PIXI_APP__ = this.app;
        
        this.sheet = new PIXI.Spritesheet(
            PIXI.BaseTexture.from(cardsImage),
            cardsSheet
        );
        this.parseSheet();

        canvasRef.appendChild(this.app.view);

        this.mattress = new Mattress(this.app, positions.mattress, layout);
        this.damageIndicator = new Indicator(this.app, positions.frontline.damageIndicator, gameState.turn.damage);
        this.confirmButton = new Button(this.app, positions.frontline.confirmButton);
        this.players = this.createPlayers(this.app, this.sheet, this.playerID, gameState, positions, this.damageIndicator, this.confirmButton);

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
            const stageScale = Math.min(windowWidth / 800, windowHeight / 720);
    
            // Update renderer dimensions
            this.app.renderer.resize(windowWidth, windowHeight);

            // Update stage scale
            this.app.stage.scale.set(stageScale);

            // Center the stage
            this.app.stage.x = (windowWidth - 800 * stageScale ) / 2;
            this.app.stage.y = (windowHeight - 720 * stageScale ) / 2;
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

            // Update joker left
            if (!data.jokers[key].jokerLeft && player.jokerLeft.isAlive) {
                player.jokerLeft.flipCard();
            }

            // Update joker right
            if (!data.jokers[key].jokerRight && player.jokerRight.isAlive) {
                player.jokerRight.flipCard();
            }

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

    createPlayers(app, sheet, playerID, gameState, positions, damageIndicator, confirmButton) {
        const players = {};
        const keys = Object.keys(gameState.players);
      
        if (keys.length !== 2) {
          throw new Error('gameState.players must have exactly 2 players.');
        }
      
        const firstPlayerKey = keys[0];
        const secondPlayerKey = keys[1];
      
        if (firstPlayerKey === playerID) {
          players[firstPlayerKey] = new Player(app, sheet, gameState.players[firstPlayerKey], positions.bottom, damageIndicator, confirmButton, true);
          players[secondPlayerKey] = new Player(app, sheet, gameState.players[secondPlayerKey], positions.top, damageIndicator, confirmButton, false);
        } else if (secondPlayerKey === playerID) {
          players[firstPlayerKey] = new Player(app, sheet, gameState.players[firstPlayerKey], positions.top, damageIndicator, confirmButton, false);
          players[secondPlayerKey] = new Player(app, sheet, gameState.players[secondPlayerKey], positions.bottom, damageIndicator, confirmButton, true);
        } else {
          players[firstPlayerKey] = new Player(app, sheet, gameState.players[firstPlayerKey], positions.top, damageIndicator, confirmButton, false);
          players[secondPlayerKey] = new Player(app, sheet, gameState.players[secondPlayerKey], positions.bottom, damageIndicator, confirmButton, false);
        }
      
        return players;
    }
}
