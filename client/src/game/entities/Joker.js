import * as PIXI from "pixi.js";

import skullImage from '../assets/images/skull.png';

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

        this.card = new PIXI.Container();
        this.card.eventMode = 'static';
        this.card.cursor = this.isPlayer? 'pointer' : 'default';
        this.card.x = this.position.x;
        this.card.y = this.position.y;
        this.card.scale.set(0.5);

        this.sprite = new PIXI.Sprite(this.sheet.textures[frontName]);
        this.sprite.anchor.set(0.5);
        this.card.addChild(this.sprite);

        this.overlay = new PIXI.Container();
        this.overlay.visible = false;
        this.graphic = new PIXI.Graphics();
        this.graphic.beginFill(0x000000, 0.6);
        this.graphic.drawRoundedRect(-70, -95, 140, 190, 4);
        this.graphic.endFill();
        this.overlay.addChild(this.graphic);
        this.icon = PIXI.Sprite.from(skullImage);
        this.icon.anchor.set(0.5);
        this.icon.scale.set(0.5);
        this.overlay.addChild(this.icon);
        this.card.addChild(this.overlay);

        this.cardsContainer.addChild(this.card);

        this.card
            .on('pointerover', this.onPointerOver, this)
            .on('pointerout', this.onPointerOut, this);
    }

    setState(isJokerAlive) {
        if (this.isAlive && !isJokerAlive) {
            this.isAlive = false;
            this.isSelectable = false;
            this.card.cursor = 'default';
            this.sprite.texture = this.sheet.textures[this.backName];
            this.overlay.visible = false;
        }
    }

    setSelectable(isSelectable) {
        if (this.isAlive && this.isPlayer) {
            this.isSelectable = isSelectable;
            this.card.cursor = isSelectable? 'pointer' : 'default';
        }
    }

    onPointerOver() {
        if (this.isAlive && this.isPlayer && this.isSelectable) {
            this.overlay.visible = true;
        }
    }

    onPointerOut() {
        this.overlay.visible = false;
    }
}
