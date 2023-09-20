import * as PIXI from "pixi.js";

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

    }
}
