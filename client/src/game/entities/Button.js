import * as PIXI from "pixi.js";

import swordImage from '../assets/images/sword.png';
import skullImage from '../assets/images/skull.png';
import hourImage from '../assets/images/hourglass.png';

export class Button {
    constructor(app, position) {
        this.enabled = false;
        this.disabledColor = 0x000000;
        this.enabledColor = 0x8E44AD;
        this.enabledColorHover = 0x7D3C98;

        this.swordIcon = PIXI.Texture.from(swordImage);
        this.skullIcon = PIXI.Texture.from(skullImage);
        this.hourIcon = PIXI.Texture.from(hourImage);

        // Define button container
        this.button = new PIXI.Container();
        this.button.eventMode = this.enabled? 'static' : 'static';
        this.button.cursor = this.enabled? 'pointer' : 'default';
        this.button.x = position.x;
        this.button.y = position.y;

        // Define button graphic
        this.graphic = new PIXI.Graphics();
        this.graphic.beginFill(this.disabledColor, 0.25);
        this.graphic.drawRoundedRect(-30, -30, 60, 60, 8);
        this.graphic.endFill();
        this.button.addChild(this.graphic);

        // Define button icon
        this.iconSprite = new PIXI.Sprite(this.hourIcon);
        this.iconSprite.anchor.set(0.5);
        this.iconSprite.scale.set(0.2);
        this.button.addChild(this.iconSprite);

        // Define button label
        this.label = new PIXI.Text("", {
            fontFamily: 'Arial',
            fontWeight: 'bold',
            fontSize: 12,
            fill: 0xFFFFFF,
            align: 'center'
        });
        this.label.y = 40;
        this.label.anchor.set(0.5);
        this.button.addChild(this.label);

        // Add button container to app stage
        app.stage.addChild(this.button);

        this.button
            .on('pointerover', this.onPointerOver, this)
            .on('pointerout', this.onPointerOut, this);
    }

    onPointerOver()
    {
        this.setColor(this.enabledColorHover, 1)
    }

    onPointerOut()
    {
        this.setColor(this.enabledColor, 1)
    }

    setColor(color, alpha) {
        this.graphic.clear();
        this.graphic.beginFill(color, alpha);
        this.graphic.drawRoundedRect(-30, -30, 60, 60, 8);
        this.graphic.endFill();
    }

    setState(stance) {
        this.disable();
        switch(stance) {
            case "attacking":
                this.iconSprite.texture = this.swordIcon;
                this.label.text = "Attack";
                break;
            case "discarding":
                this.iconSprite.texture = this.skullIcon;
                this.label.text = "Discard";
                break;
            default:
                this.iconSprite.texture = this.hourIcon;
                this.label.text = "Opponent's turn";
        }
    }

    enable() {
        this.enabled = true;
        this.button.eventMode = 'static';
        this.button.cursor = 'pointer';
        this.setColor(this.enabledColor, 1)
    }

    disable() {
        this.enabled = false;
        this.button.eventMode = 'none';
        this.button.cursor = 'default';
        this.setColor(this.disabledColor, 0.25)
    }
}
