import * as PIXI from "pixi.js";

export class Deck {
    constructor(app, sheet, name, position, size) {
        this.app = app;
        this.sheet = sheet;
        this.name = name;
        this.position = position;
        this.size = size;

        this.cardsToGet = [];

        // Define deck container
        this.container = new PIXI.Container();
        this.container.position = this.position;
        this.container.visible = this.size > 0;

        // Define card frame
        this.frame = new PIXI.Graphics();
        this.frame.beginFill(0xffffff, 1);
        this.frame.drawRoundedRect(-35, -47.5, 70, 95, 4);
        this.frame.endFill();
        this.container.addChild(this.frame);

        // Define deck sprite
        this.sprite = new PIXI.Sprite(this.sheet.textures[this.name]);
        this.sprite.width = 65;
        this.sprite.height = 90;
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
            fontSize: 20,
            fill: 0xffffff,
            align: 'center'
        });
        this.text.anchor.set(0.5);
        this.container.addChild(this.text);

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
