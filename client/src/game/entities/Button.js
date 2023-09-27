import * as PIXI from "pixi.js";

export class Button {
    constructor(app, position, buttonImage, iconImage, text, enabled, visible) {
        this.enabled = enabled;

        this.texture = PIXI.Texture.from(buttonImage);
        this.sprite = new PIXI.Sprite(this.texture);
        this.sprite.anchor.set(0.5);

        this.iconTexture = PIXI.Texture.from(iconImage);
        this.iconSprite = new PIXI.Sprite(this.iconTexture);
        this.iconSprite.anchor.set(0.5);
        this.iconSprite.scale.set(0.25);
        this.iconSprite.x = -70;

        this.text = new PIXI.Text(text, { fill: 0xffffff });
        this.text.anchor.set(0.5);
        this.text.x = 10;

        this.button = new PIXI.Container();
        this.button.eventMode = enabled? 'static' : 'static';
        this.button.cursor = enabled? 'pointer' : 'default';
        this.button.x = position.x;
        this.button.y = position.y;
        this.button.visible = visible;
        this.button.addChild(this.sprite);
        this.button.addChild(this.iconSprite);
        this.button.addChild(this.text);
        app.stage.addChild(this.button);

        this.button
            .on('pointerover', this.onPointerOver, this)
            .on('pointerout', this.onPointerOut, this);
    }

    onPointerOver()
    {
        this.sprite.tint = this.enabled? 0x666666 : this.sprite.tint;
    }

    onPointerOut()
    {
        this.sprite.tint = this.enabled? 0xFFFFFF : this.sprite.tint;
    }

    setLabel(text) {
        this.text.text = text;
    }
    
    update(buttonImage, iconImage, text, enabled) {
        this.texture = PIXI.Texture.from(buttonImage);
        this.sprite.texture = this.texture;
        this.iconTexture = PIXI.Texture.from(iconImage);
        this.iconSprite.texture = this.iconTexture;
        this.text.text = text;
        this.sprite.tint = 0xFFFFFF;
        this.enabled = enabled;
        this.button.eventMode = enabled? 'static' : 'none';
        this.button.cursor = enabled? 'pointer' : 'default';
    }

    enable() {
        this.enabled = true;
        this.button.eventMode = 'static';
        this.button.cursor = 'pointer';
    }

    disable() {
        this.enabled = false;
        this.button.eventMode = 'none';
        this.button.cursor = 'default';
    }
}
