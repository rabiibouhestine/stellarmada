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

        this.attackSelection = [];
    }

    createCards(locationState, isPlayer, start) {
        const cards = [];
        for (let index = 0; index < (isPlayer ? locationState.length : this.state.handCount); index++) {
            const cardName = isPlayer ? locationState[index] : "B1";
            const card = new Card(this.cardsContainer, this.sheet, cardName, start);
            card.sprite.on('pointerdown', () => this.onPointerDown(card));
            cards.push(card);
        }
        this.repositionCards(cards, start);
        return cards;
    }

    repositionCards(array, centerPosition) {
        // Calculate the total width of the cards in the array
        const totalWidth = array.length * 100; // Assuming each card has a width of 100 units
    
        // Calculate the starting position to center the cards
        const startX = centerPosition.x - (totalWidth / 2);
     
        // Set the y-coordinate of the centerPosition
        const startY = centerPosition.y;
    
        // Reposition the cards
        for (let index = 0; index < array.length; index++) {
            const newPosition = {
                x: startX + (index * 100),
                y: startY
            };
            array[index].moveTo(newPosition, true, false);
        }
    }

    onPointerDown(card) {
        if (card.selectable) {
            if (card.selected) {
                // If card is already selected, we unselect it, and remove it from attack selection
                card.setSelected(false);
                const index = this.attackSelection.indexOf(card);
                this.attackSelection.splice(index, 1);
                const notSelectedCards = this.hand.filter(card => !this.attackSelection.includes(card));
                notSelectedCards.forEach(card => {card.setSelectable(this.canSelectCard(card));});
            } else {
                card.setSelected(true);
                this.attackSelection.push(card);
                const notSelectedCards = this.hand.filter(card => !this.attackSelection.includes(card));
                notSelectedCards.forEach(card => {card.setSelectable(this.canSelectCard(card));});
            }
        }
    }

    setSelectable(phase) {
        this.field.forEach(card => {card.setSelectable(false);});
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

    canSelectCard(card) {
        // Clone the attackSelection array and add the current card to it for checking the conditions
        const updatedSelection = [...this.attackSelection, card];
    
        // Count the number of cards with values 1 to 5 in the updated selection
        const valueCounts = {
            1: 0,
            2: 0,
            3: 0,
            4: 0,
            5: 0,
        };
    
        for (const selectedCard of updatedSelection) {
            valueCounts[selectedCard.value]++;
        }
    
        // Check if the updated selection satisfies only one of the specified conditions
        const singleCard = updatedSelection.length === 1;
        const cardAndOne = updatedSelection.length === 2 && valueCounts[1] === 1;
        const maxFourOnes = updatedSelection.length === valueCounts[1] && valueCounts[1] <= 4;
        const maxFourTwos = updatedSelection.length === valueCounts[2] && valueCounts[2] <= 4;
        const maxThreeThrees = updatedSelection.length === valueCounts[3] && valueCounts[3] <= 3;
        const maxTwoFours = updatedSelection.length === valueCounts[4] && valueCounts[4] <= 2;
        const maxTwoFives = updatedSelection.length === valueCounts[5] && valueCounts[5] <= 2;
    
        const conditionsMet = (
            singleCard ||
            cardAndOne ||
            maxFourOnes ||
            maxFourTwos ||
            maxThreeThrees ||
            maxTwoFours ||
            maxTwoFives
        );

        return conditionsMet;
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
                card.sprite.on('pointerdown', () => this.onPointerDown(card));
                this.hand.push(card);
            }
        } else {
            for (let step = 0; step < x; step++) {
                const card = new Card(this.cardsContainer, this.sheet, "B1", this.positions.tavern);
                card.sprite.on('pointerdown', () => this.onPointerDown(card));
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
        card.sprite.on('pointerdown', () => this.onPointerDown(card));
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
