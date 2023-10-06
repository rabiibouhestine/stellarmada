import * as PIXI from "pixi.js";

export class Deck {
    constructor(app, sheet, name, position, size) {
        this.app = app;
        this.sheet = sheet;
        this.name = name;
        this.position = position;
        this.size = size;

        this.cardsToGet = [];

        this.container = new PIXI.Container();
        this.container.position = this.position;
        this.container.visible = this.size > 0;
        this.sprite = new PIXI.Sprite(this.sheet.textures[this.name]);
        this.sprite.scale.set(0.5);
        this.sprite.anchor.set(0.5);
        this.text = new PIXI.Text(this.size, {
            fontFamily: 'Arial',
            fontSize: 20,
            fill: 0xffffff,
            align: 'center'
        });
        this.text.anchor.set(0.5);

        this.container.addChild(this.sprite);
        this.container.addChild(this.text);
        this.app.stage.addChild(this.container);
    }

    setSize(x) {
        this.size = x;
        this.text.text = this.size;
        this.container.visible = this.size > 0;
    }

    getName() {
        return this.name;
    }

    setName(name) {
        this.name = name;
        this.sprite.texture = this.sheet.textures[this.name]
    }

    repositionCards() {
        this.cardsToGet.forEach(card => card.moveTo(this.position, false, false, true));
        this.cardsToGet = [];
    }
}
