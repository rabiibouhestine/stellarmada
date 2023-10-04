import * as PIXI from "pixi.js";

import swordImage from '../assets/images/sword.png';
import skullImage from '../assets/images/skull.png';
import hourImage from '../assets/images/hourglass.png';

export class Button {
    constructor(app, position) {
        this.enabled = false;
        this.color = 0x000000;

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
        this.graphic.beginFill(0x000000, 0.8);
        this.graphic.drawRoundedRect(-60, -30, 120, 60, 8);
        this.graphic.endFill();
        this.button.addChild(this.graphic);

        // Define button icon
        this.iconSprite = new PIXI.Sprite(this.hourIcon);
        this.iconSprite.anchor.set(0.5);
        this.iconSprite.scale.set(0.2);
        this.iconSprite.x = -35;
        this.button.addChild(this.iconSprite);

        // Define button label
        this.text = new PIXI.Text("", {
            fontFamily: 'Arial',
            fontSize: 24,
            fill: 0xFFFFFF,
            align: 'center'
        });
        this.text.anchor.set(0.5);
        this.text.x = 12;
        this.button.addChild(this.text);

        // Add button container to app stage
        app.stage.addChild(this.button);

        this.button
            .on('pointerover', this.onPointerOver, this)
            .on('pointerout', this.onPointerOut, this);
    }

    onPointerOver()
    {
        this.setColor(this.color, 0.5)
    }

    onPointerOut()
    {
        this.setColor(this.color, 0.8)
    }

    setColor(color, alpha) {
        this.graphic.clear();
        this.graphic.beginFill(color, alpha);
        this.graphic.drawRoundedRect(-60, -30, 120, 60, 8);
        this.graphic.endFill();
    }

    setState(stance) {
        this.disable();
        switch(stance) {
            case "attacking":
                this.text.text = "Attack";
                this.iconSprite.texture = this.swordIcon;
                this.color = 0x00FFFF;
                break;
            case "discarding":
                this.text.text = "Discard";
                this.iconSprite.texture = this.skullIcon;
                this.color = 0xFF0000;
                break;
            default:
                this.text.text = "Wait...";
                this.iconSprite.texture = this.hourIcon;
                this.color = 0x000000;
        }
        this.setColor(this.color, 0.8);
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
