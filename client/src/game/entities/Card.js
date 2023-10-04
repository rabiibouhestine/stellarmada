import * as PIXI from "pixi.js";

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

        this.sprite = new PIXI.Sprite(this.sheet.textures[name]);
        this.sprite.eventMode = 'static';
        this.sprite.cursor = 'default';
        this.sprite.x = this.position.x;
        this.sprite.y = this.position.y;
        this.sprite.scale.set(0.5);
        this.sprite.anchor.set(0.5);
        this.cardsContainer.addChild(this.sprite);

        this.sprite
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
        this.sprite.scale.set(0.6);
    }

    onPointerOut() {
        this.sprite.scale.set(0.5);
    }

    setSelected(isSelected) {
        if (this.selectable) {
            this.selected = isSelected;
            this.sprite.y = isSelected? this.sprite.y - 30 : this.position.y;
        }
    }

    setSelectable(selectable) {
        this.selectable = selectable;
        this.sprite.cursor = selectable? 'pointer' : 'default';
        this.sprite.tint = selectable? 0x89CFF0 : 0xFFFFFF;
    }

    moveTo(position, reveal, destroy) {
        if (reveal) {
            this.reveal();
        } else {
            this.hide();
        }

        if (document.visibilityState === 'visible') {
            const ticker = new PIXI.Ticker();
    
            // Function to update card position
            const updatePosition = (delta) => {
                // Calculate direction towards position
                let dx = position.x - this.sprite.x;
                let dy = position.y - this.sprite.y;
        
                // Calculate distance
                let distance = Math.sqrt(dx * dx + dy * dy);
    
                // Set velocity
                const velocity = 0.14;
        
                // Move Card towards position
                if (distance <= 1) {
                    this.sprite.x = position.x;
                    this.sprite.y = position.y;
                    this.position = position;
                    ticker.stop();
                    ticker.destroy();
                    if (destroy) {
                        this.sprite.destroy();
                    }
                } else {
                    this.sprite.x += dx * velocity * delta;
                    this.sprite.y += dy * velocity * delta;
                }
            };
        
            ticker.add(updatePosition);
            ticker.start();
        } else {
            this.sprite.x = position.x;
            this.sprite.y = position.y;
            this.position = position;
            if (destroy) {
                this.sprite.destroy();
            }
        }
    }
}
