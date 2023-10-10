import * as PIXI from "pixi.js";
import * as TWEEN from '@tweenjs/tween.js';

import cardsDict from '../assets/mappings/cardsDict.json';
import glow from '../assets/images/glow.png';

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
        this.scale = 1;

        // Define card container
        this.container = new PIXI.Container();
        this.container.eventMode = 'static';
        this.container.cursor = 'default';
        this.container.x = this.position.x;
        this.container.y = this.position.y;

        // Define card glow
        this.glow = PIXI.Sprite.from(glow);
        this.glow.anchor.set(0.5);
        this.glow.width = 140;
        this.glow.height = 190;
        this.glow.visible = false;
        this.glow.eventMode = 'none';
        this.glow.tint = 0x0096FF;
        this.container.addChild(this.glow);

        // Define card frame
        this.frame = new PIXI.Graphics();
        this.frame.beginFill(0xffffff, 1);
        this.frame.drawRoundedRect(-35, -47.5, 70, 95, 4);
        this.frame.endFill();
        this.container.addChild(this.frame);

        // Define card sprite
        this.sprite = new PIXI.Sprite(this.sheet.textures[name]);
        this.sprite.anchor.set(0.5);
        this.sprite.width = 65;
        this.sprite.height = 90;
        this.container.addChild(this.sprite);

        // Add card to cards container
        this.cardsContainer.addChild(this.container);

        // Handle events
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
        this.container.scale.set(this.scale * 1.1);
    }

    onPointerOut() {
        this.container.scale.set(this.scale);
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

    moveTo(position, isHand, reveal, destroy) {
        const propreties = {
            x: this.container.x,
            y: this.container.y,
            scale: this.scale
        };

        const targetScale = isHand? 1.2 : 1;

        const tween = new TWEEN.Tween(propreties, false)
            .to({
                x: position.x,
                y: position.y,
                scale: targetScale
            }, 600)
            .easing(TWEEN.Easing.Exponential.Out)
            .onStart(() => {
                if (reveal) {
                    this.reveal();
                } else {
                    this.hide();
                }
            })
            .onUpdate(() => {
                this.container.x = propreties.x;
                this.container.y = propreties.y;
                if (this.scale !== targetScale) {
                    this.container.scale.set(propreties.scale);
                }
            })
            .onComplete(() => {
                this.position = position;
                this.scale = targetScale;
                if (destroy) {
                    this.container.destroy();
                }
            })
            .start()

        const updatePosition = (delta) => {
            if (!tween.isPlaying()) return;
            tween.update(delta);
            requestAnimationFrame(updatePosition);
        };
    
        requestAnimationFrame(updatePosition);
    }
}
