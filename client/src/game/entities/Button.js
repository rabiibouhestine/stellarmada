import * as PIXI from "pixi.js";

import swordImage from '../assets/images/sword.png';
import skullImage from '../assets/images/skull.png';
import hourImage from '../assets/images/hourglass.png';

export class Button {
    constructor(app, position) {
        this.enabled = false;
        this.state = "waiting";
        this.states = {
            attacking: {
                color: 0x73bed3,
                colorHover: 0x4f8fba,
                icon: PIXI.Texture.from(swordImage),
                text: "Attack"
            },
            discarding: {
                color: 0xde9e41,
                colorHover: 0xbe772b,
                icon: PIXI.Texture.from(skullImage),
                text: "Counter"
            },
            waiting: {
                color: 0x000000,
                colorHover: 0x000000,
                icon: PIXI.Texture.from(hourImage),
                text: "Enemy turn"
            }
        };

        // Define button container
        this.button = new PIXI.Container();
        this.button.eventMode = this.enabled? 'static' : 'static';
        this.button.cursor = this.enabled? 'pointer' : 'default';
        this.button.x = position.x;
        this.button.y = position.y;

        // Define button graphic
        this.graphic = new PIXI.Graphics();
        this.graphic.beginFill(this.states[this.state].color, 0.25);
        this.graphic.drawRoundedRect(0, 0, 150, 50, 8);
        this.graphic.endFill();
        this.button.addChild(this.graphic);

        // Define button icon
        this.iconSprite = new PIXI.Sprite(this.states[this.state].icon);
        this.iconSprite.anchor.set(0.5);
        this.iconSprite.x = 25;
        this.iconSprite.y = 25;
        this.iconSprite.scale.set(0.2);
        this.button.addChild(this.iconSprite);

        // Define button label
        this.label = new PIXI.Text(this.states[this.state].text, {
            fontFamily: 'Arial',
            fontWeight: 'bold',
            fontSize: 16,
            fill: 0xFFFFFF,
            align: 'center'
        });
        this.label.anchor.set(0.5);
        this.label.x = 90;
        this.label.y = 25;
        this.button.addChild(this.label);

        // Add button container to app stage
        app.stage.addChild(this.button);

        // Animate the button icon
        let time = 0;
        app.ticker.add(() =>
        {
            time += 0.1;
            if ( this.enabled ) {
                this.iconSprite.scale.set(0.25 + 0.05 * Math.sin(time));
            } else {
                this.iconSprite.scale.set(0.2);
                time = 0;
            }
        });

        this.button
            .on('pointerover', this.onPointerOver, this)
            .on('pointerout', this.onPointerOut, this);
    }

    onPointerOver()
    {
        this.setColor(this.states[this.state].colorHover, 1)
    }

    onPointerOut()
    {
        this.setColor(this.states[this.state].color, 1)
    }

    setColor(color, alpha) {
        this.graphic.clear();
        this.graphic.beginFill(color, alpha);
        this.graphic.drawRoundedRect(0, 0, 150, 50, 8);
        this.graphic.endFill();
    }

    setState(stance) {
        this.disable();
        switch(stance) {
            case "attacking":
                this.state = "attacking";
                this.iconSprite.texture = this.states.attacking.icon;
                this.label.text = this.states.attacking.text;
                break;
            case "discarding":
                this.state = "discarding";
                this.iconSprite.texture = this.states.discarding.icon;
                this.label.text = this.states.discarding.text;
                break;
            default:
                this.state = "waiting";
                this.iconSprite.texture = this.states.waiting.icon;
                this.label.text = this.states.waiting.text;
        }
    }

    enable() {
        this.enabled = true;
        this.button.eventMode = 'static';
        this.button.cursor = 'pointer';
        this.setColor(this.states[this.state].color, 1);
    }

    disable() {
        this.enabled = false;
        this.button.eventMode = 'none';
        this.button.cursor = 'default';
        this.setColor(0x000000, 0.25);
    }
}
