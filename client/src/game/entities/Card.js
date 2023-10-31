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

        this.offensivePower = cardsDict[name].offensivePower;
        this.defensivePower = cardsDict[name].defensivePower;
        this.suit = cardsDict[name].suit;
        this.isMissile = cardsDict[name].isMissile;

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
        this.glow.drawRoundedRect(-38, -52, 76, 104, 8);
        this.glow.endFill();
        this.glow.visible = false;
        this.glow.eventMode = 'none';
        this.glow.tint = 0x0096FF;
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
        this.sprite.height = 98;
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
        this.sprite.texture = this.sheet.textures[this.isPlayer? "B1": "B2"];
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

    moveTo(toPosition, toScale, toAngle, visible, destroy) {
        this.setSelectable(false, false);

        const propreties = {
            x: this.container.x,
            y: this.container.y,
            scale: this.scale,
            angle: this.container.angle
        };

        const tween = new TWEEN.Tween(propreties, false)
            .to({
                x: toPosition.x,
                y: toPosition.y,
                scale: toScale,
                angle: toAngle
            }, 600)
            .easing(TWEEN.Easing.Exponential.Out)
            .onStart(() => {
                if (visible) {
                    this.reveal();
                } else {
                    this.hide();
                }
            })
            .onUpdate(() => {
                this.container.x = propreties.x;
                this.container.y = propreties.y;
                this.container.angle = propreties.angle;
                if (this.scale !== toScale) {
                    this.container.scale.set(propreties.scale);
                }
            })
            .onComplete(() => {
                this.position = toPosition;
                this.scale = toScale;
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
