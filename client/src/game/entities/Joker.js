import * as PIXI from "pixi.js";
// import * as TWEEN from '@tweenjs/tween.js'

export class Joker {
    constructor(app, sheet, position, isPlayer) {
        this.app = app;
        this.sheet = sheet;
        this.position = position;
        this.isPlayer = isPlayer;

        // Define jokers container
        this.container = new PIXI.Container();
        this.container.x = this.position.x;
        this.container.y = this.position.y;

        // Define left joker sprite
        this.spriteLeft = new PIXI.Sprite(this.sheet.textures["J1"]);
        this.spriteLeft.anchor.set(0.5);
        this.spriteLeft.x = -36;
        this.spriteLeft.width = 70;
        this.spriteLeft.height = 95;
        this.container.addChild(this.spriteLeft);

        // Define right joker sprite
        this.spriteRight = new PIXI.Sprite(this.sheet.textures["J2"]);
        this.spriteRight.anchor.set(0.5);
        this.spriteRight.x = 36;
        this.spriteRight.width = 70;
        this.spriteRight.height = 95;
        this.container.addChild(this.spriteRight);

        // Mirror sprite if not player
        if (!this.isPlayer) {
            this.container.angle = 180;
        }

        // Add card to cards container
        this.app.stage.addChild(this.container);
    }

    // flipCard() {
    //     const propreties = {
    //         x: 1,
    //         y: 1
    //     };

    //     const tweenUp = new TWEEN.Tween(propreties, false)
    //         .to({
    //             x: 0,
    //             y: 1.1
    //         }, 150)
    //         .onUpdate(() => {
    //             this.card.scale.set(propreties.x, propreties.y);
    //         })
    //         .onComplete(() => {
    //             this.sprite.texture = this.sheet.textures[this.frontName];
    //         });

    //     const tweenDown = new TWEEN.Tween(propreties, false)
    //         .to({
    //             x: 1,
    //             y: 1
    //         }, 150)
    //         .onUpdate(() => {
    //             this.card.scale.set(propreties.x, propreties.y);
    //         })
    //         .onComplete(() => {
    //             this.isAlive = false;
    //         });

    //     const updatePosition = (delta) => {
    //         if (!tweenUp.isPlaying() && !tweenDown.isPlaying()) return;
    //         tweenUp.update(delta);
    //         tweenDown.update(delta);
    //         requestAnimationFrame(updatePosition);
    //     };
    
    //     tweenUp.chain(tweenDown).start();
    //     requestAnimationFrame(updatePosition);
    // }
}
