import * as PIXI from "pixi.js";
import * as TWEEN from '@tweenjs/tween.js'

export class Joker {
    constructor(cardsContainer, sheet, frontName, isPlayer, isAlive, position) {
        this.cardsContainer = cardsContainer;
        this.sheet = sheet;
        this.frontName = frontName;
        this.backName = isPlayer? "B1" : "B2";
        this.isAlive = isAlive;
        this.position = position;

        // Define tower card
        this.card = new PIXI.Container();
        this.card.x = this.position.x;
        this.card.y = this.position.y;

        // Define tower sprite
        this.sprite = new PIXI.Sprite(this.sheet.textures[isAlive? this.backName : this.frontName]);
        this.sprite.anchor.set(0.5);
        this.sprite.width = 70;
        this.sprite.height = 95;
        this.card.addChild(this.sprite);

        // Mirror sprite if not player
        if (!isPlayer) {
            this.sprite.angle = 180;
        }

        // Add card to cards container
        this.cardsContainer.addChild(this.card);
    }

    flipCard() {
        const propreties = {
            x: 1,
            y: 1
        };

        const tweenUp = new TWEEN.Tween(propreties, false)
            .to({
                x: 0,
                y: 1.1
            }, 150)
            .onUpdate(() => {
                this.card.scale.set(propreties.x, propreties.y);
            })
            .onComplete(() => {
                this.sprite.texture = this.sheet.textures[this.frontName];
            });

        const tweenDown = new TWEEN.Tween(propreties, false)
            .to({
                x: 1,
                y: 1
            }, 150)
            .onUpdate(() => {
                this.card.scale.set(propreties.x, propreties.y);
            })
            .onComplete(() => {
                this.isAlive = false;
            });

        const updatePosition = (delta) => {
            if (!tweenUp.isPlaying() && !tweenDown.isPlaying()) return;
            tweenUp.update(delta);
            tweenDown.update(delta);
            requestAnimationFrame(updatePosition);
        };
    
        tweenUp.chain(tweenDown).start();
        requestAnimationFrame(updatePosition);
    }
}
