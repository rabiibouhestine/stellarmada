import * as PIXI from "pixi.js";

export class Indicator {
    constructor(app, position, asset, value) {
        this.value = value;

        // Define the indicator container
        this.container = new PIXI.Container();
        this.container.x = position.x; // 300
        this.container.y = position.y; // 370

        // Define the indicator text
        this.text = new PIXI.Text(this.value, {
            fontFamily: 'Arial',
            fontSize: 48,
            fill: 0xFFFFFF,
            align: 'center',
        });
        this.text.anchor.set(0.5);
        this.text.x = 25;
        this.container.addChild(this.text);

        // Define hte indicator logo if asset provided
        if (asset) {
            this.texture = PIXI.Texture.from(asset);
            this.sprite = new PIXI.Sprite(this.texture);
            this.sprite.anchor.set(0.5);
            this.sprite.scale.set(0.5);
            this.sprite.x = -40;
            this.container.addChild(this.sprite);
        }

        // Add container to app stage
        app.stage.addChild(this.container);
    }

    setValue(value) {
        this.value = value;
        this.text.text = Math.max(0, value);
    }
}
