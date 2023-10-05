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

        this.container = new PIXI.Container();
        this.container.eventMode = 'static';
        this.container.cursor = 'default';
        this.container.x = this.position.x;
        this.container.y = this.position.y;
        this.container.scale.set(0.5);

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
    
            // Function to update container position
            const updatePosition = (delta) => {
                // Calculate direction towards position
                let dx = position.x - this.container.x;
                let dy = position.y - this.container.y;
        
                // Calculate distance
                let distance = Math.sqrt(dx * dx + dy * dy);
    
                // Set velocity
                const velocity = 0.14;
        
                // Move Card towards position
                if (distance <= 1) {
                    this.container.x = position.x;
                    this.container.y = position.y;
                    this.position = position;
                    ticker.stop();
                    ticker.destroy();
                    if (destroy) {
                        this.container.destroy();
                    }
                } else {
                    this.container.x += dx * velocity * delta;
                    this.container.y += dy * velocity * delta;
                }
            };
        
            ticker.add(updatePosition);
            ticker.start();
        } else {
            this.container.x = position.x;
            this.container.y = position.y;
            this.position = position;
            if (destroy) {
                this.container.destroy();
            }
        }
    }
}
