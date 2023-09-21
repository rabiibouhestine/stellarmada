import * as PIXI from "pixi.js";

import { Deck } from "./Deck";
import { Card } from "./Card";

export class Player {
    constructor(app, sheet, state, positions, isPlayer) {
        this.app = app;
        this.sheet = sheet;
        this.state = state;
        this.isPlayer = isPlayer;
        this.positions = positions;

        this.cardsContainer = new PIXI.Container();
        this.cardsContainer.sortableChildren = true;
        this.app.stage.addChild(this.cardsContainer);

        this.handCount = state.handCount;
        this.tavern = new Deck(app, sheet, "B1", this.positions.tavern, state.tavern);
        this.cemetry = new Deck(app, sheet, "B1", this.positions.cemetry, state.cemetry);
        this.castle = new Deck(app, sheet, "KH", this.positions.castle, state.castle);
        this.jester = new Deck(app, sheet, "J1", this.positions.jester, state.jester);
        this.hand = this.createCards(state.hand, this.isPlayer, this.positions.hand);
        this.field = this.createCards(state.field, true, this.positions.field);
        this.shield = this.createCards(state.shield, true, this.positions.shield);
    }

    createCards(locationState, isPlayer, start) {
        const cards = [];
        for (let index = 0; index < (isPlayer ? locationState.length : this.state.handCount); index++) {
            const cardName = isPlayer ? locationState[index] : "B1";
            const card = new Card(this.cardsContainer, this.sheet, cardName, start);
            cards.push(card);
        }
        this.repositionCards(cards, start);
        return cards;
    }

    repositionCards(array, start) {
        for (let index = 0; index < array.length; index++) {
            const newPosition = {
                x: start.x + (index * 100),
                y: start.y
            };
            array[index].moveTo(newPosition, true, false);
        }
    }

    setSelectable(phase) {
        if (phase == "player attack") {
            this.hand.forEach(card => {card.setSelectable(true);});
            this.shield.forEach(card => {card.setSelectable(false);});
        } else if (phase == "player discard") {
            this.hand.forEach(card => {card.setSelectable(true);});
            this.shield.forEach(card => {card.setSelectable(true);});
        } else {
            this.hand.forEach(card => {card.setSelectable(false);});
            this.shield.forEach(card => {card.setSelectable(false);});
        }
    }

    revive(x) {
        this.cemetry.setSize(this.cemetry.size - x);
        this.tavern.setSize(this.tavern.size + x);
    }

    buildShield(units) {
        const cards = this.field.filter(card => units.includes(card.name));
        this.shield.push(...cards);
        this.field = this.field.filter(card => !units.includes(card.name));
        this.repositionCards(this.field, this.positions.field);
        this.repositionCards(this.shield, this.positions.shield);
    }

    drawTavern(x, units) {
        this.tavern.setSize(this.tavern.size - x);
        this.handCount += x;
        if (this.isPlayer) {
            for (const index in units) {
                const card = new Card(this.cardsContainer, this.sheet, units[index], this.positions.tavern);
                this.hand.push(card);
            }
        } else {
            for (let step = 0; step < x; step++) {
                const card = new Card(this.cardsContainer, this.sheet, "B1", this.positions.tavern);
                this.hand.push(card);
            }
        }
        this.repositionCards(this.hand, this.positions.hand);
    }

    drawCastle(unit) {
        this.castle.setSize(this.castle.size - 1);
        this.handCount += 1;
        const name = this.isPlayer? this.castle.getName() : "B1";
        const card = new Card(this.cardsContainer, this.sheet, name, this.positions.castle);
        this.castle.setName(unit);
        this.hand.push(card);
        this.repositionCards(this.hand, this.positions.hand);
    }

    attack(units) {
        const x = units.length;
        this.handCount -= x;
        if (this.isPlayer) {
            const cards = this.hand.filter(card => units.includes(card.name));
            this.hand = this.hand.filter(card => !units.includes(card.name));
            this.field.push(...cards);
        } else {
            const cards = this.hand.slice(-x);
            this.hand.splice(-x);
            for (const card in cards) {
                cards[card].reveal(units[card]);
                this.field.push(cards[card]);
            }
        }
        this.repositionCards(this.field, this.positions.field);
        this.repositionCards(this.hand, this.positions.hand);
    }

    clearField() {
        this.field.forEach(card => card.moveTo(this.positions.cemetry, false, true));
        this.field = [];
    }

    discardShield(units) {
        const cards = this.shield.filter(card => units.includes(card.name));
        cards.forEach(card => card.moveTo(this.positions.cemetry, false, true));
        this.shield = this.shield.filter(card => !units.includes(card.name));
        this.repositionCards(this.shield, this.positions.shield);
    }

    discardHand(x, units) {
        this.handCount -= x;
        this.cemetry.setSize(this.cemetry.size + x);

        const moveCardsToCemetry = (cards) => {
            cards.forEach(card => card.moveTo(this.positions.cemetry, false, true));
        };

        if (this.isPlayer) {
            const cards = this.hand.filter(card => units.includes(card.name));
            this.hand = this.hand.filter(card => !units.includes(card.name));
            moveCardsToCemetry(cards);
        } else {
            const cards = this.hand.slice(-x);
            this.hand.splice(-x);
            moveCardsToCemetry(cards);
        }

        this.repositionCards(this.hand, this.positions.hand);
    }
}
