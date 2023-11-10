import * as PIXI from "pixi.js";

export class Mattress {
    constructor(app, positions) {

        // Add battlefield to mattress
        const battlefield = new PIXI.Graphics();
        battlefield.beginFill(0x000000, 0.25);
        battlefield.drawRoundedRect(195, 301, 330, 118, 8);
        battlefield.endFill();
        app.stage.addChild(battlefield);

        // Add player base to mattress
        const playerBase = new PIXI.Graphics();
        playerBase.beginFill(0x000000, 0.25);
        playerBase.drawRoundedRect(535, 301, 170, 118, 8);
        playerBase.endFill();
        app.stage.addChild(playerBase);

        // Add enemy base to mattress
        const enemyBase = new PIXI.Graphics();
        enemyBase.beginFill(0x000000, 0.25);
        enemyBase.drawRoundedRect(15, 301, 170, 118, 8);
        enemyBase.endFill();
        app.stage.addChild(enemyBase);
    }
}
