import * as PIXI from "pixi.js";

export class Mattress {
    constructor(app, positions, texture) {

        // Create Mattress Container
        const container = new PIXI.Container();

        // Add background to mattress
        const background = PIXI.Sprite.from(texture);
        container.addChild(background);

        // Add labels to mattress
        positions.forEach(function(item) {
            const labelContainer = new PIXI.Container();
            labelContainer.x = item.x;
            labelContainer.y = item.y;
            labelContainer.height = 23;
            labelContainer.width = item.width;

            const label = new PIXI.Text(item.label, {
                fontFamily: 'Arial',
                fontWeight: 'bold',
                fontSize: 12,
                fill: 0xFFFFFF,
                align: 'center'
            });
            label.anchor.set(0.5);
            label.alpha = 0.8;

            labelContainer.addChild(label);
            container.addChild(labelContainer);
        });

        // Add the mattress container to the app
        app.stage.addChild(container);
    }
}
