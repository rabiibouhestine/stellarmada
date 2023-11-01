import * as PIXI from "pixi.js";

export class Mattress {
    constructor(app, positions) {

        // Add battlefield to mattress
        const battlefield = new PIXI.Graphics();
        battlefield.beginFill(0x000000, 0.25);
        battlefield.drawRoundedRect(10, 301, 700, 118, 8);
        battlefield.endFill();
        app.stage.addChild(battlefield);

        // Add player base to mattress
        const playerBase = new PIXI.Graphics();
        playerBase.beginFill(0x000000, 0.25);
        playerBase.drawRoundedRect(215, 429, 290, 128, 8);
        playerBase.endFill();
        app.stage.addChild(playerBase);

        // Add enemy base to mattress
        const enemyBase = new PIXI.Graphics();
        enemyBase.beginFill(0x000000, 0.25);
        enemyBase.drawRoundedRect(215, 163, 290, 128, 8);
        enemyBase.endFill();
        app.stage.addChild(enemyBase);

        // Add labels to mattress
        positions.forEach(function(item) {
            const label = new PIXI.Text(item.label, {
                fontFamily: 'Arial',
                fontWeight: 'bold',
                fontSize: 10,
                fill: 0xFFFFFF,
                align: 'center'
            });
            label.anchor.set(0.5);
            label.x = item.x;
            label.y = item.y;
            label.alpha = 0.8;

            app.stage.addChild(label);
        });
    }
}
