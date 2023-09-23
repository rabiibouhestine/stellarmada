import * as PIXI from "pixi.js";

export class Indicator {
    constructor(app, position, asset, value) {
        this.value = value;

        this.texture = PIXI.Texture.from(asset);
        this.sprite = new PIXI.Sprite(this.texture);
        this.sprite.anchor.set(0.5);
        this.sprite.scale.set(0.5);
        this.sprite.x = -40;
        
        this.text = new PIXI.Text(this.value, {
            fontFamily: 'Arial',
            fontSize: 48,
            fill: 0xFFFFFF,
            align: 'center',
        });
        this.text.anchor.set(0.5);
        this.text.x = 25;

        // this.graphic = new PIXI.Graphics();
        // this.graphic.beginFill(0x000000);
        // this.graphic.drawRoundedRect(-50, -25, 100, 50, 20);
        // this.graphic.endFill();

        this.container = new PIXI.Container();
        // this.container.addChild(this.graphic);
        this.container.addChild(this.sprite);
        this.container.addChild(this.text);
        this.container.x = position.x; // 300
        this.container.y = position.y; // 370
        app.stage.addChild(this.container);
    }

    setValue(value) {
        this.value = value;
        this.text.text = value;
    }
}
