import * as PIXI from "pixi.js";

export class Card {
    constructor(cardsContainer, sheet, name, position) {
        this.cardsContainer = cardsContainer;
        this.sheet = sheet;
        this.name = name;
        this.position = position;

        this.selectable = false;
        this.selected = false;
        this.spriteTint = 0xFFFFFF;

        this.sprite = new PIXI.Sprite(this.sheet.textures[name]);
        this.sprite.eventMode = 'static';
        this.sprite.cursor = 'pointer';
        this.sprite.x = this.position.x;
        this.sprite.y = this.position.y;
        this.sprite.scale.set(0.4);
        this.sprite.anchor.set(0.5);
        this.cardsContainer.addChild(this.sprite);

        this.sprite
            .on('pointerover', this.onPointerOver, this)
            .on('pointerout', this.onPointerOut, this)
            .on('pointerdown', this.onPointerDown, this);
    }

    reveal(name) {
        if (name !== undefined) {
            this.name = name;
        }
        this.sprite.texture = this.sheet.textures[this.name];
    }

    hide() {
        this.sprite.texture = this.sheet.textures["tile028.jpg"];
    }

    onPointerOver() {
        this.sprite.scale.set(0.45);
    }

    onPointerOut() {
        this.sprite.scale.set(0.4);
    }

    onPointerDown() {
        if (this.selectable) {
            this.selected = !this.selected;
            this.sprite.tint = this.selected? 0x444444 : this.spriteTint;
        }
    }

    setSelectable(selectable) {
        this.selectable = selectable;
        this.spriteTint = selectable? 0x666666 : 0xFFFFFF;
        this.sprite.tint = this.spriteTint;
    }

    moveTo(position, reveal, destroy) {
        if (reveal) {
            this.reveal();
        } else {
            this.hide();
        }
        const ticker = new PIXI.Ticker();
        ticker.add((delta) =>
        {
            // Constants
            const velocity = 0.15;

            // Calculate direction towards position
            let dx = position.x - this.sprite.x;
            let dy = position.y - this.sprite.y;

            // Calculate distance
            let distance = Math.sqrt(dx * dx + dy * dy);

            // Move Card towards position
            if (distance <= 1) {
                this.sprite.x = position.x;
                this.sprite.y = position.y;
                this.position = position;
                ticker.destroy();
                if (destroy) {
                    this.sprite.destroy();
                }
            } else {
                this.sprite.x += dx * velocity * delta;
                this.sprite.y += dy * velocity * delta;
            }
        });
        ticker.start()
    }
}
