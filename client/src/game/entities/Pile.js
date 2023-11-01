import * as PIXI from "pixi.js";
import * as TWEEN from '@tweenjs/tween.js';

export class Pile {
    constructor(app, sheet, isPlayer, position, size) {
        this.app = app;
        this.sheet = sheet;
        this.name = isPlayer? "B1" : "B2";
        this.position = position;
        this.size = size;

        this.cardsToGet = [];

        // Define pile container
        this.container = new PIXI.Container();
        this.container.position = this.position;

        // Define pile background
        this.background = new PIXI.Graphics();
        this.background.beginFill(0x000000, 0.25);
        this.background.drawRoundedRect(-35, -49, 70, 98, 8);
        this.background.endFill();
        this.container.addChild(this.background);

        // Define pile sprite
        this.sprite = new PIXI.Sprite(this.sheet.textures[this.name]);
        this.sprite.anchor.set(0.5);
        this.sprite.width = 70;
        this.sprite.height = 98;
        this.sprite.visible = this.size > 0;
        this.container.addChild(this.sprite);

        // Mirror sprite if not player
        if (!isPlayer) {
            this.sprite.angle = 180;
        }

        // Define text background
        this.textBG = new PIXI.Graphics();
        this.textBG.beginFill(0x000000, 0.4);
        this.textBG.drawCircle(0, 0, 14);
        this.textBG.endFill();
        this.container.addChild(this.textBG);

        // Define pile size text
        this.text = new PIXI.Text(this.size, {
            fontFamily: 'Arial',
            fontSize: 14,
            fill: 0xffffff,
            align: 'center'
        });
        this.text.anchor.set(0.5);
        this.container.addChild(this.text);

        // Add pile to app stage
        this.app.stage.addChild(this.container);
    }

    setSize(x) {
        this.size = x;
        this.text.text = this.size;
        this.sprite.visible = this.size > 0;
        if (this.size > 0) {
            this.pulse();
        }
    }

    adjust() {
        this.cardsToGet.forEach(card => card.moveTo(this.position, 1, 90, false, true));
        this.cardsToGet = [];
    }

    pulse() {
        const propreties = {
            textBgScale: 2,
            textScale: 2
        };

        const tween = new TWEEN.Tween(propreties, false)
            .to({
                textBgScale: 1,
                textScale: 1
            }, 1000)
            .easing(TWEEN.Easing.Elastic.Out)
            .onUpdate(() => {
                this.textBG.scale.set(propreties.textBgScale);
                this.text.scale.set(propreties.textScale);
            })
            .start()

        const updateScale = (delta) => {
            if (!tween.isPlaying()) return;
            tween.update(delta);
            requestAnimationFrame(updateScale);
        };
    
        requestAnimationFrame(updateScale);
    }
}
