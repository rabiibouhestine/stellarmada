import * as PIXI from "pixi.js";
import * as TWEEN from '@tweenjs/tween.js';

export class Indicator {
    constructor(app, position, value) {
        this.value = value;

        // Define the indicator container
        this.container = new PIXI.Container();
        this.container.x = position.x;
        this.container.y = position.y;

        // Define indicator graphic
        this.graphic = new PIXI.Graphics();
        this.graphic.beginFill(0x000000, 0.25);
        this.graphic.drawRoundedRect(-30, -30, 60, 60, 8);
        this.graphic.endFill();
        this.container.addChild(this.graphic);

        // Define indicator number
        this.text = new PIXI.Text(this.value, {
            fontFamily: 'Arial',
            fontSize: 24,
            fill: 0xFFFFFF,
            align: 'center'
        });
        this.text.anchor.set(0.5);
        this.container.addChild(this.text);

        // Define indicator label
        this.label = new PIXI.Text("Damage", {
            fontFamily: 'Arial',
            fontWeight: 'bold',
            fontSize: 12,
            fill: 0xFFFFFF,
            align: 'center'
        });
        this.label.y = 40;
        this.label.anchor.set(0.5);
        this.container.addChild(this.label);

        // Add indicator container to app stage
        app.stage.addChild(this.container);
    }

    setValue(value) {
        if (this.value === value) return;
        this.value = value;
        this.text.text = Math.max(0, value);
        this.pulse();
    }

    pulse() {
        const propreties = {
            textScale: 1.5
        };

        const tween = new TWEEN.Tween(propreties, false)
            .to({
                textScale: 1
            }, 1000)
            .easing(TWEEN.Easing.Elastic.Out)
            .onUpdate(() => {
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
