import * as PIXI from "pixi.js";

export class Board {
    constructor(app, playerID, turn) {

        this.text = new PIXI.Text("", {
            fontFamily: 'Arial',
            fontSize: 16,
            fill: 0xFFFFFF,
            align: 'center'
        });

        this.text.anchor.set(0.5);
        this.text.x = 400;
        this.text.y = 570;

        app.stage.addChild(this.text);

        this.setState(playerID, turn);
    }

    setState(playerID, turn) {
        if (playerID === turn.playerID) {
            switch(turn.stance) {
                case "attacking":
                    this.text.text = "Select cards to attack!";
                    break;
                case "discarding":
                    this.text.text = "Select cards to discard!";
                    break;
                default:
                    this.text.text = "";
            }
        } else {
            switch(turn.stance) {
                case "attacking":
                    this.text.text = "Wait for opponent to attack..."
                    break;
                case "discarding":
                    this.text.text = "Wait for opponent to discard..."
                    break;
                default:
                    this.text.text = "";
            }
        }
    }
}
