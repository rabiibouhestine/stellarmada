import * as PIXI from "pixi.js";
import * as TWEEN from '@tweenjs/tween.js'

import cardsDict from '../assets/mappings/cardsDict.json';

export class Card {
    constructor(cardsContainer, sheet, name, position) {
        this.cardsContainer = cardsContainer;
        this.sheet = sheet;
        this.name = name;
        this.position = position;

        this.value = cardsDict[name].value;
        this.suit = cardsDict[name].suit;
        this.isCastle = cardsDict[name].isCastle;

        this.selectable = false;
        this.selected = false;

        this.container = new PIXI.Container();
        this.container.eventMode = 'static';
        this.container.cursor = 'default';
        this.container.x = this.position.x;
        this.container.y = this.position.y;
        this.container.scale.set(0.5);

        const blur = new PIXI.BlurFilter(8);
        this.glow = new PIXI.Sprite(this.sheet.textures[name]);
        this.glow.scale.set(1.1);
        this.glow.anchor.set(0.5);
        this.glow.tint = 0x0096FF;
        this.glow.filters = [blur];
        this.glow.visible = false;
        this.container.addChild(this.glow);

        this.sprite = new PIXI.Sprite(this.sheet.textures[name]);
        this.sprite.anchor.set(0.5);
        this.container.addChild(this.sprite);

        this.cardsContainer.addChild(this.container);

        this.container
            .on('pointerover', this.onPointerOver, this)
            .on('pointerout', this.onPointerOut, this);
    }

    reveal(name) {
        if (name !== undefined) {
            this.name = name;
        }
        this.sprite.texture = this.sheet.textures[this.name];
    }

    hide() {
        this.sprite.texture = this.sheet.textures["B1"];
    }

    onPointerOver() {
        this.container.scale.set(0.6);
    }

    onPointerOut() {
        this.container.scale.set(0.5);
    }

    setSelected(isSelected) {
        if (this.selectable) {
            this.selected = isSelected;
            this.container.y = isSelected? this.container.y - 30 : this.position.y;
        }
    }

    setSelectable(selectable) {
        this.selectable = selectable;
        this.container.cursor = selectable? 'pointer' : 'default';
        this.glow.visible = selectable;
    }

    moveTo(position, reveal, destroy) {
        const coords = {x: this.container.x, y: this.container.y}

        const tween = new TWEEN.Tween(coords, false)
            .to({x: position.x, y: position.y}, 800)
            .easing(TWEEN.Easing.Exponential.Out)
            .onStart(() => {
                if (reveal) {
                    this.reveal();
                } else {
                    this.hide();
                }
            })
            .onUpdate(() => {
                this.container.x = coords.x;
                this.container.y = coords.y;
            })
            .onComplete(() => {
                if (destroy) {
                    this.container.destroy();
                }
            })
            .start()

        const updatePosition = (delta) => {
            tween.update(delta);
            requestAnimationFrame(updatePosition);
        };
    
        requestAnimationFrame(updatePosition);
    }
}
