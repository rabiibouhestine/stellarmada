import * as PIXI from "pixi.js";

import buttonTexture from '../assets/button.png';

export class Button {
    constructor(app, position, text) {

        this.texture = PIXI.Texture.from(buttonTexture);
        this.sprite = new PIXI.Sprite(this.texture);
        this.sprite.anchor.set(0.5);

        this.text = new PIXI.Text(text);
        this.text.anchor.set(0.5);

        this.button = new PIXI.Container();
        this.button.eventMode = 'static';
        this.button.cursor = 'pointer';
        this.button.x = position.x;
        this.button.y = position.y;
        this.button.addChild(this.sprite);
        this.button.addChild(this.text);
        app.stage.addChild(this.button);

        this.button
            .on('pointerover', this.onPointerOver, this.sprite)
            .on('pointerout', this.onPointerOut, this.sprite);
    }

    onPointerOver()
    {
        this.tint = 0x666666;
    }

    onPointerOut()
    {
        this.tint = 0xFFFFFF;
    }

    setLabel(text) {
        this.text.text = text;
    }
}
