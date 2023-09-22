import * as PIXI from "pixi.js";

import skullPNG from '../assets/skull.png';
import swordPNG from '../assets/sword.png';

export class Board {
    constructor({ app }) {
        // Draw Enemy Board
        const enemy = new PIXI.Graphics();
        enemy.beginFill(0x469155);
        enemy.drawRect(200, 150, 236, 140);
        enemy.drawRect(450, 150, 118, 140);
        enemy.drawRect(582, 150, 236, 140);
        enemy.drawRect(832, 150, 236, 140);
        enemy.endFill();
        app.stage.addChild(enemy);
        
        // Draw Field Board
        const field = new PIXI.Graphics();
        field.beginFill(0x469155);
        field.drawRect(200, 300, 868, 140);
        field.endFill();
        app.stage.addChild(field);

        // Draw Player Board
        const player = new PIXI.Graphics();
        player.beginFill(0x469155);
        player.drawRect(200, 450, 236, 140);
        player.drawRect(450, 450, 236, 140);
        player.drawRect(700, 450, 118, 140);
        player.drawRect(832, 450, 236, 140);
        player.endFill();
        app.stage.addChild(player);

        // Draw Damage Received
        this.damageContainer = new PIXI.Container();
        this.damageTexture = PIXI.Texture.from(swordPNG);
        this.damageSprite = new PIXI.Sprite(this.damageTexture);
        this.damageSprite.anchor.set(0.5);
        this.damageSprite.scale.set(0.5);
        this.damageSprite.x = -40;
        this.damageText = new PIXI.Text(13, {
            fontFamily: 'Arial',
            fontSize: 72,
            fill: 0xFFFFFF,
            align: 'center',
        });
        this.damageText.anchor.set(0.5);
        this.damageText.x = 40;
        this.damageContainer.addChild(this.damageSprite);
        this.damageContainer.addChild(this.damageText);
        this.damageContainer.x = 300;
        this.damageContainer.y = 370;
        app.stage.addChild(this.damageContainer);

        // Draw Health Received
        this.healthContainer = new PIXI.Container();
        this.healthTexture = PIXI.Texture.from(skullPNG);
        this.healthSprite = new PIXI.Sprite(this.healthTexture);
        this.healthSprite.anchor.set(0.5);
        this.healthSprite.scale.set(0.5);
        this.healthSprite.x = 40;
        this.healthText = new PIXI.Text(11, {
            fontFamily: 'Arial',
            fontSize: 72,
            fill: 0xFFFFFF,
            align: 'center',
        });
        this.healthText.anchor.set(0.5);
        this.healthText.x = -40;
        this.healthContainer.addChild(this.healthSprite);
        this.healthContainer.addChild(this.healthText);
        this.healthContainer.x = 975;
        this.healthContainer.y = 370;
        app.stage.addChild(this.healthContainer);
    }
}
