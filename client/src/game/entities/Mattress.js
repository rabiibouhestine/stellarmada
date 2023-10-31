import * as PIXI from "pixi.js";

export class Mattress {
    constructor(app, positions) {

        // Add battlefield to mattress
        const battlefield = new PIXI.Graphics();
        battlefield.beginFill(0x000000, 0.25);
        battlefield.drawRoundedRect(10, 291, 700, 138, 8);
        battlefield.endFill();
        app.stage.addChild(battlefield);

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
