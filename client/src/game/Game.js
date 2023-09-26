import * as PIXI from "pixi.js";

import cardsImage from './assets/images/cards.png';
import cardsSheet from './assets/mappings/cards.json';
import positions from './assets/mappings/positionsDict.json';

import { Player } from "./entities/Player";
import { Board } from "./entities/Board";

export class Game {
    constructor({ canvasRef, socket, gameState }) {
        this.playerID = socket.id;

        this.app = new PIXI.Application({
            resolution: Math.max(window.devicePixelRatio, 2),
            backgroundColor: 0x87C1FF,
        });
        global.__PIXI_APP__ = this.app;
        
        this.sheet = new PIXI.Spritesheet(
            PIXI.BaseTexture.from(cardsImage),
            cardsSheet
        );
        this.parseSheet();

        canvasRef.current.appendChild(this.app.view);

        this.board = new Board(this.app);
        this.players = this.createPlayers(this.app, this.sheet, this.playerID, gameState, positions)

        for (const key of Object.keys(this.players)) {
            const player = this.players[key];

            // Get game turn state
            const turnPlayerID = gameState.turn.playerID;
            const stance = gameState.turn.stance;
            const damage = gameState.turn.damage;

            // Update player states
            player.setStance(this.playerID === turnPlayerID? stance : "waiting");
            player.setAttackValue(this.playerID === turnPlayerID? damage : 0);
            player.setDamageValue(this.playerID === turnPlayerID? 0 : damage);
        }

        this.resize();
        window.addEventListener('resize', this.resize, this);
    }

    parseSheet = async () => {
        await this.sheet.parse();
    }

    update(data) {
        for (const key of Object.keys(this.players)) {
            const player = this.players[key];

            // Perform player moves
            for (const moveIndex in data.moves[key]) {
                const move = data.moves[key][moveIndex];
                player.moveCards(move.cardsNames, move.nCards, move.location, move.destination);
            }
            player.repositionBoard();

            // Get game turn state
            const turnPlayerID = data.turn.playerID;
            const stance = data.turn.stance;
            const damage = data.turn.damage;

            // Update player states
            player.setAttackValue(key === turnPlayerID? 0 : damage);
            player.setDamageValue(key === turnPlayerID? damage : 0);
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

        // Update canvas style dimensions
        this.app.renderer.view.style.width = `${windowWidth}px`;
        this.app.renderer.view.style.height = `${windowHeight}px`;

        // Update renderer dimensions
        this.app.renderer.resize(windowWidth, windowHeight);
    }
}
