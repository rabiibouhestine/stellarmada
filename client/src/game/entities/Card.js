import * as PIXI from "pixi.js";
import * as TWEEN from '@tweenjs/tween.js';
import cardsDict from '../assets/mappings/cardsDict.json';

export class Card {
    constructor(cardsContainer, sheet, name, position, isPlayer) {
        this.cardsContainer = cardsContainer;
        this.sheet = sheet;
        this.name = name;
        this.position = position;
        this.isPlayer = isPlayer;

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
        this.glow = new PIXI.Graphics();
        this.glow.beginFill(0xffffff, 1);
        this.glow.drawRoundedRect(-37.5, -50, 75, 100, 8);
        this.glow.endFill();
        this.glow.visible = false;
        this.glow.eventMode = 'none';
        this.glow.tint = 0x0096FF; //0xD22B2B
        this.container.addChild(this.glow);

        // Animate the glow alpha
        let time = 0;
        const ticker = new PIXI.Ticker();
        ticker.add(() =>
        {
            time += 0.075;
            this.glow.alpha = Math.sin(time) * 0.25 + 0.75;
        });
        ticker.start();

        // Define card sprite
        this.sprite = new PIXI.Sprite(this.sheet.textures[name]);
        this.sprite.anchor.set(0.5);
        this.sprite.width = 70;
        this.sprite.height = 95;
        this.container.addChild(this.sprite);

        // Mirror sprite if not player
        if (!isPlayer) {
            this.sprite.angle = 180;
        }

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

    setSelectable(selectable, isAttack) {
        this.selectable = selectable;
        this.container.cursor = selectable? 'pointer' : 'default';
        this.glow.visible = selectable;
        this.glow.tint = isAttack? 0x4f8fba : 0xcf573c;
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
