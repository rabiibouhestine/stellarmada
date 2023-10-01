import * as PIXI from "pixi.js";

export class Board {
    constructor(app) {
        // Draw Enemy Board
        const enemy = new PIXI.Graphics();
        enemy.beginFill(0x7393B3);
        enemy.drawRect(200, 150, 236, 140);
        enemy.drawRect(450, 150, 118, 140);
        enemy.drawRect(582, 150, 236, 140);
        enemy.drawRect(832, 150, 236, 140);
        enemy.endFill();
        app.stage.addChild(enemy);
        
        // Draw Frontline Board
        const frontline = new PIXI.Graphics();
        frontline.beginFill(0x7393B3);
        frontline.drawRect(200, 300, 868, 140);
        frontline.endFill();
        app.stage.addChild(frontline);

        // Draw Player Board
        const player = new PIXI.Graphics();
        player.beginFill(0x7393B3);
        player.drawRect(200, 450, 236, 140);
        player.drawRect(450, 450, 236, 140);
        player.drawRect(700, 450, 118, 140);
        player.drawRect(832, 450, 236, 140);
        player.endFill();
        app.stage.addChild(player);
    }
}
