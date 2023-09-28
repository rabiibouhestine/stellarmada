import * as PIXI from "pixi.js";

export class Joker {
    constructor(cardsContainer, sheet, frontName, backName, position) {
        this.cardsContainer = cardsContainer;
        this.sheet = sheet;
        this.frontName = frontName;
        this.backName = backName;
        this.position = position;

        this.sprite = new PIXI.Sprite(this.sheet.textures[frontName]);
        this.sprite.eventMode = 'static';
        this.sprite.cursor = 'default';
        this.sprite.x = this.position.x;
        this.sprite.y = this.position.y;
        this.sprite.scale.set(0.6);
        this.sprite.anchor.set(0.5);
        this.cardsContainer.addChild(this.sprite);

        this.sprite
            .on('pointerover', this.onPointerOver, this)
            .on('pointerout', this.onPointerOut, this);
    }

    reveal() {
        this.sprite.texture = this.sheet.textures[this.frontName];
    }

    hide() {
        this.sprite.texture = this.sheet.textures[this.backName];
    }

    onPointerOver() {
        this.sprite.scale.set(0.65);
    }

    onPointerOut() {
        this.sprite.scale.set(0.6);
    }
}
