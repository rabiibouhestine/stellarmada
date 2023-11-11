import * as PIXI from "pixi.js";
import * as TWEEN from '@tweenjs/tween.js';

import rectPNG from '../assets/images/rect.png';

export class Shield {
    constructor(app, position, health, isPlayer) {

        this.health = health;

        this.x = position.x;
        this.y = position.y;

        this.width = 690;
        this.height = 20;

        this.widthHealthRatio = 690/300;

        this.mask = new PIXI.Graphics();
        this.mask.beginFill(0x000000);
        this.mask.drawRoundedRect(-this.width/2, -this.height/2, this.width, this.height, 8);
        this.mask.endFill();

        this.shield = new PIXI.Graphics();
        this.shield.beginFill(0x000000, 0.25);
        this.shield.drawRoundedRect(-this.width/2, -this.height/2, this.width, this.height, 8);
        this.shield.endFill();

        this.healthBgTexture = PIXI.Texture.from(rectPNG);
        this.healthBgSprite = new PIXI.Sprite(this.healthBgTexture);
        this.healthBgSprite.anchor.set(0.5);
        this.healthBgSprite.width = this.health * this.widthHealthRatio;
        this.healthBgSprite.height = this.height;
        this.healthBgSprite.mask = this.mask;

        this.healthTexture = PIXI.Texture.from(rectPNG);
        this.healthSprite = new PIXI.Sprite(this.healthTexture);
        this.healthSprite.anchor.set(0.5);
        this.healthSprite.width = this.health * this.widthHealthRatio;
        this.healthSprite.height = this.height;
        this.healthSprite.mask = this.mask;
        this.healthSprite.tint = isPlayer ? 0x4f8fba : 0xda863e;

        this.label = new PIXI.Text(this.health, {
            fontFamily: 'Arial',
            fontWeight: 'bold',
            fontSize: 16,
            fill: 0xFFFFFF,
            align: 'center'
        });
        this.label.anchor.set(0.5);     

        this.shieldContainer = new PIXI.Container();
        this.shieldContainer.x = this.x;
        this.shieldContainer.y = this.y;
        this.shieldContainer.addChild(this.mask);
        this.shieldContainer.addChild(this.shield);
        this.shieldContainer.addChild(this.healthBgSprite);
        this.shieldContainer.addChild(this.healthSprite);
        this.shieldContainer.addChild(this.label);

        app.stage.addChild(this.shieldContainer);
    }

    setValue(value) {
        if (this.health === value) {
            return;
        }

        this.health = value;
        this.label.text = this.health;
        this.healthSprite.width = this.health * this.widthHealthRatio;

        const propreties = {
            width: this.healthBgSprite.width
        };

        const healthBgTween = new TWEEN.Tween(propreties, false)
        .to({
            width: this.health * this.widthHealthRatio
        }, 600)
        .easing(TWEEN.Easing.Exponential.In)
        .onUpdate(() => {
            this.healthBgSprite.width = propreties.width;
        })
        .start()

        const updateValue = (delta) => {
            if (!healthBgTween.isPlaying()) return;
            healthBgTween.update(delta);
            requestAnimationFrame(updateValue);
        };

        requestAnimationFrame(updateValue);
    }

}
