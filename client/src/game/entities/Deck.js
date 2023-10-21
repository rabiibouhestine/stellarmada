import * as PIXI from "pixi.js";

export class Deck {
    constructor(app, sheet, isPlayer, position, size) {
        this.app = app;
        this.sheet = sheet;
        this.name = isPlayer? "B1" : "B2";
        this.position = position;
        this.size = size;

        this.cardsToGet = [];

        // Define deck container
        this.container = new PIXI.Container();
        this.container.position = this.position;
        this.container.visible = this.size > 0;

        // Define deck sprite
        this.sprite = new PIXI.Sprite(this.sheet.textures[this.name]);
        this.sprite.width = 70;
        this.sprite.height = 95;
        this.sprite.anchor.set(0.5);
        this.container.addChild(this.sprite);

        // Define text background
        this.textBG = new PIXI.Graphics();
        this.textBG.beginFill(0x000000, 0.4);
        this.textBG.drawCircle(0, 0, 14);
        this.textBG.endFill();
        this.container.addChild(this.textBG);

        // Define deck text
        this.text = new PIXI.Text(this.size, {
            fontFamily: 'Arial',
            fontSize: 14,
            fill: 0xffffff,
            align: 'center'
        });
        this.text.anchor.set(0.5);
        this.container.addChild(this.text);

        // Mirror deck if not player
        if (!isPlayer) {
            this.container.angle = 180;
        }

        // Add deck to app stage
        this.app.stage.addChild(this.container);
    }

    setSize(x) {
        this.size = x;
        this.text.text = this.size;
        this.container.visible = this.size > 0;
    }

    repositionCards() {
        this.cardsToGet.forEach(card => card.moveTo(this.position, false, false, true));
        this.cardsToGet = [];
    }
}
