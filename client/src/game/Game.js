import * as PIXI from "pixi.js";
import {Howl} from 'howler';

import cardsImage from './assets/images/cardsSpritesheet.png';
import cardsSheet from './assets/mappings/cardsSpritesheet.json';
import positions from './assets/mappings/positionsDict.json';

import sfxShipsAttacked from './assets/audio/laserLarge_000.ogg';
import sfxShipsDiscarded from './assets/audio/forceField_000.ogg';
import bgMusic from './assets/audio/bgMusic.flac';

import { Player } from "./entities/Player";
import { Indicator } from "./entities/Indicator";
import { Button } from "./entities/Button";

import layout from './assets/images/mattress.png';
import { Mattress } from "./entities/Mattress";

export class Game {
    constructor({ canvasRef, gameState }) {
        this.playerID = localStorage.getItem("playerID");

        this.app = new PIXI.Application({
            // resizeTo: window,
            width: 720,
            height: 720,
            resolution: window.devicePixelRatio || 1,
            autoDensity: true,
            backgroundColor: 0x475569,
            backgroundAlpha: 0
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
            const windowWidth = canvasRef.offsetWidth;
            const windowHeight = window.innerHeight;
            const stageScale = Math.min(windowWidth / 720, windowHeight / 720);
    
            // Update renderer dimensions
            this.app.renderer.resize(windowWidth, windowHeight);

            // Update stage scale
            this.app.stage.scale.set(stageScale);

            // Center the stage
            this.app.stage.x = (windowWidth - 720 * stageScale ) / 2;
            this.app.stage.y = (windowHeight - 720 * stageScale ) / 2;
        }

        this.resize();
        window.addEventListener('resize', this.resize, this);

        this.soundShipsAttacked = new Howl({
            src: [sfxShipsAttacked]
        });
        this.soundShipsDiscarded = new Howl({
            src: [sfxShipsDiscarded]
        });
        this.soundBgMusic = new Howl({
            src: [bgMusic],
            autoplay: true,
            loop: true,
            volume: 0.05
        });
    }

    parseSheet = async () => {
        await this.sheet.parse();
    }

    update(data) {
        if (data.turn.stance === 'discarding') {
            this.soundShipsAttacked.play();
        } else {
            this.soundShipsDiscarded.play();
        }
        this.damageIndicator.setValue(data.turn.damage);

        // Perform moves
        if (data.moves) {
            for (const move of data.moves) {
                this.players[move.playerID].moveCards(move.cardsNames, move.location, move.destination);
            };
        }

        for (const key of Object.keys(this.players)) {
            const player = this.players[key];

            // Reposition player cards
            player.repositionBoard();

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
