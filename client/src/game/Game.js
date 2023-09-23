import * as PIXI from "pixi.js";

import cardsSheet from './assets/mappings/cards.json';
import cardsImage from './assets/images/cards.jpg';
import positions from './assets/mappings/positionsDict.json';

import { Player } from "./entities/Player";
import { Board } from "./entities/Board";

export class Game {
    constructor({ canvasRef, socket }) {
        this.playerID = "P1"; // TODO replace hardcoded id with socket.id

        this.app = new PIXI.Application({
            resizeTo: window,
            resolution: Math.max(window.devicePixelRatio, 2),
            backgroundColor: 0x87C1FF,
        });
        global.__PIXI_APP__ = this.app;
        
        this.sheet = new PIXI.Spritesheet(
            PIXI.BaseTexture.from(cardsImage),
            cardsSheet
        );
        this.sheet.parse(); // load assets: see docs, needs await for some reason!!!

        canvasRef.current.appendChild(this.app.view);



        this.resize();
        window.addEventListener('resize', this.resize, this);
    }

    start(gameState) {
        this.board = new Board(this.app);
        this.players = this.createPlayers(this.app, this.sheet, this.playerID, gameState, positions)

        this.app.start();
    }

    update(data) {
        for (const key of Object.keys(data.players)) {
            // Define player and playerData
            const player = this.players[key];
            const playerData = data.players[key];

            // Update player states
            player.setStance(playerData.stance);
            player.setAttackValue(playerData.attackValue);
            player.setDamageValue(playerData.damageValue);

            // Perform player actions
            for (const key of Object.keys(playerData.actions)) {
                const params = playerData.actions[key];
                switch(key) {
                    case "revive":
                        player.revive(params.x);
                        break;
                    case "buildShield":
                        player.buildShield(params.units);
                        break;
                    case "drawTavern":
                        player.drawTavern(params.x, params.units);
                        break;
                    case "drawCastle":
                        player.drawCastle(params.unit);
                        break;
                    case "attack":
                        player.attack(params.units);
                        break;
                    case "clearField":
                        player.clearField();
                        break;
                    case "discardShield":
                        player.discardShield(params.units);
                        break;
                    case "discardHand":
                        player.discardHand(params.x, params.units);
                        break;
                    default:
                        throw new Error('action ' + key + ' not defined in Player.');
                  }
            }
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


    resize = () => {
        const windowWidth = window.innerWidth;
        const windowHeight = window.innerHeight;
        const minWidth = 800;
        const minHeight = 400;

        // Calculate renderer and canvas sizes based on current dimensions
        const scaleX = windowWidth < minWidth ? minWidth / windowWidth : 1;
        const scaleY = windowHeight < minHeight ? minHeight / windowHeight : 1;
        const scale = scaleX > scaleY ? scaleX : scaleY;
        const width = windowWidth * scale;
        const height = windowHeight * scale;

        // Update canvas style dimensions and scroll window up to avoid issues on mobile resize
        this.app.renderer.view.style.width = `${windowWidth}px`;
        this.app.renderer.view.style.height = `${windowHeight}px`;

        // Update renderer  and navigation screens dimensions
        this.app.renderer.resize(width, height);
    }
}
