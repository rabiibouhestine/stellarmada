import * as PIXI from "pixi.js";

export class Indicator {
    constructor(app, position, value) {
        this.value = value;

        // Define the indicator container
        this.container = new PIXI.Container();
        this.container.x = position.x;
        this.container.y = position.y;

        // Define indicator graphic
        this.graphic = new PIXI.Graphics();
        this.graphic.beginFill(0x000000, 0.25);
        this.graphic.drawRoundedRect(-30, -30, 60, 60, 8);
        this.graphic.endFill();
        this.container.addChild(this.graphic);

        // Define indicator text
        this.text = new PIXI.Text(this.value, {
            fontFamily: 'Arial',
            fontSize: 24,
            fill: 0xFFFFFF,
            align: 'center'
        });
        this.text.anchor.set(0.5);
        this.container.addChild(this.text);

        // Add indicator container to app stage
        app.stage.addChild(this.container);
    }

    setValue(value) {
        this.value = value;
        this.text.text = Math.max(0, value);
    }
}
