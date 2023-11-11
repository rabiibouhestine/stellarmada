import * as PIXI from "pixi.js";
import {Howl} from 'howler';

import cardsImage from './assets/images/cardsSpritesheet.png';
import cardsSheet from './assets/mappings/cardsSpritesheet.json';
import positions from './assets/mappings/positionsDict.json';

import sfxAttack from './assets/audio/cardPlace1.ogg';
import sfxDiscard from './assets/audio/cardSlide1.ogg';
import sfxGameStart from './assets/audio/cardTakeOutPackage2.ogg';
import sfxGameVictory from './assets/audio/victory.mp3';
import sfxGameDefeat from './assets/audio/defeat.mp3';

import { Player } from "./entities/Player";
import { Indicator } from "./entities/Indicator";
import { Button } from "./entities/Button";
import { Mattress } from "./entities/Mattress";

export class Game {
    constructor(canvasRef, gameState, playerID, isMuted) {
        this.init(canvasRef, gameState, playerID, isMuted);
    }

    async init(canvasRef, gameState, playerID, isMuted) {
        this.canvasRef = canvasRef;
        this.gameState = gameState;
        this.playerID = playerID;
        this.isMuted = isMuted;
        this.toggleMute(this.isMuted);

        this.app = new PIXI.Application({
            // resizeTo: window,
            width: 720,
            height: 720,
            resolution: window.devicePixelRatio || 1,
            autoDensity: true,
            backgroundColor: 0x475569,
            backgroundAlpha: 0
        });

        this.canvasRef.appendChild(this.app.view);

        const cardsTextures = await PIXI.Assets.load(cardsImage);

        this.sheet = new PIXI.Spritesheet(
            cardsTextures,
            cardsSheet
        );
        await this.sheet.parse();

        this.mattress = new Mattress(this.app);
        this.damageIndicator = new Indicator(this.app, positions.battleField.damageIndicator, this.gameState.turn.damage);
        this.confirmButton = new Button(this.app, positions.battleField.confirmButton);
        this.players = this.createPlayers(this.app, this.sheet, this.playerID, this.gameState, positions, this.damageIndicator, this.confirmButton);

        const confirmButtonClickedEvent = new Event("confirmButtonClicked", { bubbles: true, cancelable: false });
        this.confirmButton.button.on('pointerdown', () => window.dispatchEvent(confirmButtonClickedEvent));

        this.resize();
        window.addEventListener('resize', () => {this.resize()});

        this.sfxAttackHowl = new Howl({
            src: [sfxAttack]
        });
        this.sfxDiscardHowl = new Howl({
            src: [sfxDiscard]
        });
        this.sfxGameVictoryHowl = new Howl({
            src: [sfxGameVictory]
        });
        this.sfxGameDefeatHowl = new Howl({
            src: [sfxGameDefeat]
        });
        this.sfxGameStartHowl = new Howl({
            src: [sfxGameStart],
            autoplay: true,
            loop: false
        });
    }

    resize() {
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

    handleGameOver(winnerID) {
        if (winnerID === this.playerID) {
            this.sfxGameVictoryHowl.play();
        } else {
            this.sfxGameDefeatHowl.play();
        }
    }

    toggleMute(isMuted) {
        this.isMuted = isMuted;
        Howler.mute(isMuted);
    }

    update(data) {
        if (data.turn.stance === 'discarding') {
            this.sfxAttackHowl.play();
        } else {
            this.sfxDiscardHowl.play();
        }
        this.damageIndicator.setValue(data.turn.damage);

        // Perform moves
        if (data.moves) {
            for (const move of data.moves) {
                // get player
                const player = this.players[move.playerID];
                // move cards
                player.moveCards(move.cardsNames, move.location, move.destination);
            };
        }

        for (const key of Object.keys(this.players)) {
            const player = this.players[key];

            // Get game turn state
            const turnPlayerID = data.turn.playerID;
            const stance = data.turn.stance;

            // Update player states
            player.setStance(key === turnPlayerID? stance : "waiting");
            player.shield.setValue(data.shields[key]);
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

            // create player
            if (key !== playerID && !topSet) {
                players[key] = new Player(app, sheet, gameState.players[key], positions.top, damageIndicator, confirmButton, false);
                topSet = true;
            } else {
                players[key] = new Player(app, sheet, gameState.players[key], positions.bottom, damageIndicator, confirmButton, key === playerID);
            }

            // update player stance
            players[key].setStance(playerID === gameState.turn.playerID? gameState.turn.stance : "waiting");
        }

        return players;
    }
}
