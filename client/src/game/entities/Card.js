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

        this.card = new PIXI.Container();
        this.card.eventMode = 'static';
        this.card.cursor = 'default';
        this.card.x = this.position.x;
        this.card.y = this.position.y;
        this.card.scale.set(0.5);

        this.sprite = new PIXI.Sprite(this.sheet.textures[name]);
        this.sprite.anchor.set(0.5);
        this.card.addChild(this.sprite);

        this.cardsContainer.addChild(this.card);

        this.card
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
        this.card.scale.set(0.6);
    }

    onPointerOut() {
        this.card.scale.set(0.5);
    }

    setSelected(isSelected) {
        if (this.selectable) {
            this.selected = isSelected;
            this.card.y = isSelected? this.card.y - 30 : this.position.y;
        }
    }

    setSelectable(selectable) {
        this.selectable = selectable;
        this.card.cursor = selectable? 'pointer' : 'default';
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
                let dx = position.x - this.card.x;
                let dy = position.y - this.card.y;
        
                // Calculate distance
                let distance = Math.sqrt(dx * dx + dy * dy);
    
                // Set velocity
                const velocity = 0.14;
        
                // Move Card towards position
                if (distance <= 1) {
                    this.card.x = position.x;
                    this.card.y = position.y;
                    this.position = position;
                    ticker.stop();
                    ticker.destroy();
                    if (destroy) {
                        this.card.destroy();
                    }
                } else {
                    this.card.x += dx * velocity * delta;
                    this.card.y += dy * velocity * delta;
                }
            };
        
            ticker.add(updatePosition);
            ticker.start();
        } else {
            this.card.x = position.x;
            this.card.y = position.y;
            this.position = position;
            if (destroy) {
                this.card.destroy();
            }
        }
    }
}
