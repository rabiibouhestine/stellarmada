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
import { Mattress } from "./entities/Mattress";

export class Game {
    constructor(canvasRef, gameState, playerID) {
        this.init(canvasRef, gameState, playerID);
    }

    async init(canvasRef, gameState, playerID) {
        this.canvasRef = canvasRef;
        this.gameState = gameState;
        this.playerID = playerID;
        this.app = new PIXI.Application({
            // resizeTo: window,
            width: 720,
            height: 720,
            resolution: window.devicePixelRatio || 1,
            autoDensity: true,
            backgroundColor: 0x475569,
            backgroundAlpha: 0
        });
        this.sheet = new PIXI.Spritesheet(
            PIXI.BaseTexture.from(cardsImage),
            cardsSheet
        );
        await this.sheet.parse();

        this.canvasRef.appendChild(this.app.view);

        this.mattress = new Mattress(this.app, positions.mattress);
        this.damageIndicator = new Indicator(this.app, positions.battleField.damageIndicator, this.gameState.turn.damage);
        this.confirmButton = new Button(this.app, positions.battleField.confirmButton);
        this.players = this.createPlayers(this.app, this.sheet, this.playerID, this.gameState, positions, this.damageIndicator, this.confirmButton);

        const confirmButtonClickedEvent = new Event("confirmButtonClicked", { bubbles: true, cancelable: false });
        this.confirmButton.button.on('pointerdown', () => window.dispatchEvent(confirmButtonClickedEvent));

        for (const key of Object.keys(this.players)) {
            const player = this.players[key];

            // Get game turn state
            const turnPlayerID = this.gameState.turn.playerID;
            const stance = this.gameState.turn.stance;

            // Update player states
            player.setStance(this.playerID === turnPlayerID? stance : "waiting");
        }

        this.resize = () => {
            const windowWidth = this.canvasRef.offsetWidth;
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
            player.adjustBoard();

            // Get game turn state
            const turnPlayerID = data.turn.playerID;
            const stance = data.turn.stance;

            // Update player states
            player.setStance(key === turnPlayerID? stance : "waiting");
        }
    }

    end() {
        Howler.stop();
        Howler.unload();
        this.sheet.destroy(true);
        this.app.stop();
        this.app.destroy(true, true);
    }

    createPlayers(app, sheet, playerID, gameState, positions, damageIndicator, confirmButton) {
        const players = {};

        const gameStatePlayersKeys = Object.keys(gameState.players);

        if (gameStatePlayersKeys.length !== 2) {
            throw new Error('gameState.players must have exactly 2 players.');
        }

        let topSet = false;
        for (const key of gameStatePlayersKeys) {
            if (key !== playerID && !topSet) {
                players[key] = new Player(app, sheet, gameState.players[key], positions.top, damageIndicator, confirmButton, false);
                topSet = true;
            } else {
                players[key] = new Player(app, sheet, gameState.players[key], positions.bottom, damageIndicator, confirmButton, key === playerID);
            }
        }

        return players;
    }
}
