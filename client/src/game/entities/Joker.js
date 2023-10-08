import * as PIXI from "pixi.js";
import * as TWEEN from '@tweenjs/tween.js'

export class Joker {
    constructor(cardsContainer, sheet, frontName, backName, isAlive, position) {
        this.cardsContainer = cardsContainer;
        this.sheet = sheet;
        this.frontName = frontName;
        this.backName = backName;
        this.isAlive = isAlive;
        this.position = position;

        this.card = new PIXI.Container();
        this.card.x = this.position.x;
        this.card.y = this.position.y;
        this.card.scale.set(0.5);

        this.sprite = new PIXI.Sprite(this.sheet.textures[isAlive? frontName : backName]);
        this.sprite.anchor.set(0.5);
        this.card.addChild(this.sprite);

        this.cardsContainer.addChild(this.card);
    }

    flipCard() {
        const propreties = {
            x: 0.5,
            y: 0.5
        };

        const tweenUp = new TWEEN.Tween(propreties, false)
            .to({
                x: 0,
                y: 0.6
            }, 150)
            .onUpdate(() => {
                this.card.scale.set(propreties.x, propreties.y);
            })
            .onComplete(() => {
                this.sprite.texture = this.sheet.textures[this.backName];
            });

        const tweenDown = new TWEEN.Tween(propreties, false)
            .to({
                x: 0.5,
                y: 0.5
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
