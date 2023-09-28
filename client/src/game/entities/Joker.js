import * as PIXI from "pixi.js";

export class Joker {
    constructor(cardsContainer, sheet, frontName, backName, isPlayer, isAlive, position) {
        this.cardsContainer = cardsContainer;
        this.sheet = sheet;
        this.frontName = frontName;
        this.backName = backName;
        this.isPlayer = isPlayer;
        this.isAlive = isAlive;
        this.position = position;

        this.isSelectable = false;

        this.sprite = new PIXI.Sprite(this.sheet.textures[frontName]);
        this.sprite.eventMode = 'static';
        this.sprite.cursor = this.isPlayer? 'pointer' : 'default';
        this.sprite.x = this.position.x;
        this.sprite.y = this.position.y;
        this.sprite.scale.set(0.6);
        this.sprite.anchor.set(0.5);
        this.cardsContainer.addChild(this.sprite);

        this.sprite
            .on('pointerover', this.onPointerOver, this)
            .on('pointerout', this.onPointerOut, this);
    }

    setState(isJokerAlive) {
        if (this.isAlive && !isJokerAlive) {
            this.isAlive = false;
            this.isSelectable = false;
            this.sprite.cursor = 'default';
            this.sprite.texture = this.sheet.textures[this.backName];
        }
    }

    setSelectable(isSelectable) {
        if (this.isAlive && this.isPlayer) {
            this.isSelectable = isSelectable;
            this.sprite.cursor = isSelectable? 'pointer' : 'default';
        }
    }

    onPointerOver() {
        this.sprite.scale.set(0.65);
    }

    onPointerOut() {
        this.sprite.scale.set(0.6);
    }
}
