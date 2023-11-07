import * as PIXI from "pixi.js";

import { Card } from "./Card";
import { Pile } from "./Pile";
import { Hand } from "./Hand";
import { Field } from "./Field";

export class Player {
    constructor(app, sheet, state, positions, damageIndicator, confirmButton, isPlayer) {
        this.app = app;
        this.sheet = sheet;
        this.positions = positions;
        this.damageIndicator = damageIndicator;
        this.confirmButton = confirmButton;
        this.isPlayer = isPlayer;
        
        this.cardsContainer = new PIXI.Container();
        this.cardsContainer.sortableChildren = true;
        this.app.stage.addChild(this.cardsContainer);
        
        this.drawPile = new Pile(this.cardsContainer, sheet, this.isPlayer, this.positions.drawPile, state.cards.drawPile);
        this.discardPile = new Pile(this.cardsContainer, sheet, this.isPlayer, this.positions.discardPile, state.cards.discardPile);
        this.destroyPile = new Pile(this.cardsContainer, sheet, this.isPlayer, this.positions.destroyPile, state.cards.destroyPile);
        this.battleField = new Field(this.cardsContainer, sheet, state.cards.battleField, positions.battleField);
        this.hand = new Hand(this.cardsContainer, sheet, state.cards.hand, positions.hand, isPlayer);
        this.hand.cards.map((card) => card.container.on('pointerdown', () => this.onCardSelection(card)));

        this.attackSelection = [];
        this.discardSelection = [];
        
        this.stance = "waiting";
        this.setStance(state.stance);
    }

    adjustBoard() {
        this.battleField.adjust();
        this.hand.adjust();
        this.discardPile.adjust();
        this.drawPile.adjust();
        this.destroyPile.adjust();
    }

    onCardSelection(card) {
        if (!card.selectable || !["attacking", "discarding"].includes(this.stance)) return;
    
        const cardSelection = this.stance === "attacking" ? this.attackSelection : this.discardSelection;

        if (card.selected) {
            card.setSelected(false);
            const index = cardSelection.indexOf(card);
            cardSelection.splice(index, 1);
        } else {
            card.setSelected(true);
            cardSelection.push(card);
        }
    
        if (this.stance === "attacking") {
            const sum = cardSelection.reduce((accumulator, card) => {
                return accumulator + card.offensivePower;
            }, 0);
            this.damageIndicator.setValue(sum);
        }

        if (this.stance === "discarding") {
            if (card.selected) {
                this.damageIndicator.setValue(this.damageIndicator.value - card.defensivePower);
            } else {
                this.damageIndicator.setValue(this.damageIndicator.value + card.defensivePower);
            }
        }

        const notSelectedCards = this.hand.cards.filter(card => !cardSelection.includes(card));
        notSelectedCards.forEach(card => { card.setSelectable(this.stance === "attacking" ? this.canCardAttack(card) : true, this.stance === "attacking"); });

        // Update confirm button
        if (this.stance === "attacking") {
            if (this.attackSelection.length > 0) {
                this.confirmButton.enable();
            } else {
                this.confirmButton.disable();
            }
        }
        if (this.stance === "discarding") {
            if (this.damageIndicator.value <= 0) {
                this.confirmButton.enable();
            } else {
                this.confirmButton.disable();
            }
        }
    }

    setStance(stance) {
        this.stance = stance;
        const isAttacking = this.stance === "attacking";
        const isDiscarding = this.stance === "discarding";
    
        this.battleField.cards.forEach(card => {
            card.setSelected(false);
            card.setSelectable(false, false);
        });

        this.hand.cards.forEach(card => {
            card.setSelected(false);
            card.setSelectable(this.isPlayer && (isAttacking || isDiscarding), isAttacking);
        });

        if (this.isPlayer) {
            this.confirmButton.setState(stance);
        }

        this.attackSelection = [];
        this.discardSelection = [];
    }

    canCardAttack(card) {
        // Clone the attackSelection array and add the current card to it for checking the conditions
        const updatedSelection = [...this.attackSelection, card];

        // Check if the updated selection has missiles
        const hasMissiles = updatedSelection.some(card => card.isMissile === true);

        // Check if the updated selection has ships
        const hasShips = updatedSelection.some(card => card.isMissile === false);

        // Check allowed selections
        const singleCard = updatedSelection.length === 1;
        const shipAndMissile = updatedSelection.length === 2 && hasMissiles;
        const allMissiles = updatedSelection.length > 2 && !hasShips;
    
        // Check if selection allowed
        const conditionsMet = (singleCard || shipAndMissile || allMissiles);

        // Return conditionsMet check
        return conditionsMet;
    }

    moveCards(cardsNames, location, destination) {

        if (location === "destroyPile" && destination === "discardPile") {
            const card = new Card(this.cardsContainer, this.sheet, this.isPlayer? "B1" : "B2", this.positions.destroyPile, this.isPlayer);
            this.discardPile.cardsToGet.push(card);
            this.destroyPile.setSize(this.destroyPile.size - cardsNames.length);
            this.discardPile.setSize(this.discardPile.size + cardsNames.length);
        }

        if (location === "discardPile" && destination === "drawPile") {
            const card = new Card(this.cardsContainer, this.sheet, this.isPlayer? "B1" : "B2", this.positions.discardPile, this.isPlayer);
            this.drawPile.cardsToGet.push(card);
            this.discardPile.setSize(this.discardPile.size - cardsNames.length);
            this.drawPile.setSize(this.drawPile.size + cardsNames.length);
        }

        if (location === "drawPile" && destination === "hand") {
            this.drawPile.setSize(this.drawPile.size - cardsNames.length);
            for (const index in cardsNames) {
                const cardName = this.isPlayer? cardsNames[index] : "B2";
                const card = new Card(this.cardsContainer, this.sheet, cardName, this.positions.drawPile, this.isPlayer);
                card.container.on('pointerdown', () => this.onCardSelection(card));
                this.hand.cards.push(card);
            }
        }

        if (location === "battleField" && destination === "discardPile") {
            const cards = this.battleField.cards.filter(card => cardsNames.includes(card.name));
            this.discardPile.cardsToGet.push(...cards);
            this.battleField.cards = this.battleField.cards.filter(card => !cardsNames.includes(card.name));
            this.discardPile.setSize(this.discardPile.size + cardsNames.length);
        }

        if (location === "battleField" && destination === "destroyPile") {
            const cards = this.battleField.cards.filter(card => cardsNames.includes(card.name));
            this.destroyPile.cardsToGet.push(...cards);
            this.battleField.cards = this.battleField.cards.filter(card => !cardsNames.includes(card.name));
            this.destroyPile.setSize(this.destroyPile.size + cardsNames.length);
        }

        if (location === "hand" && destination === "destroyPile") {
            this.destroyPile.setSize(this.destroyPile.size + cardsNames.length);

            if (this.isPlayer) {
                const cards = this.hand.cards.filter(card => cardsNames.includes(card.name));
                this.hand.cards = this.hand.cards.filter(card => !cardsNames.includes(card.name));
                this.destroyPile.cardsToGet.push(...cards);
            } else {
                const cards = this.hand.cards.slice(-cardsNames.length);
                this.hand.cards.splice(-cardsNames.length);
                this.destroyPile.cardsToGet.push(...cards);
            }
        }

        if (location === "hand" && destination === "discardPile") {
            this.discardPile.setSize(this.discardPile.size + cardsNames.length);

            if (this.isPlayer) {
                const cards = this.hand.cards.filter(card => cardsNames.includes(card.name));
                this.hand.cards = this.hand.cards.filter(card => !cardsNames.includes(card.name));
                this.discardPile.cardsToGet.push(...cards);
            } else {
                const cards = this.hand.cards.slice(-cardsNames.length);
                this.hand.cards.splice(-cardsNames.length);
                this.discardPile.cardsToGet.push(...cards);
            }
        }

        if (location === "hand" && destination === "battleField") {
            if (this.isPlayer) {
                const cards = this.hand.cards.filter(card => cardsNames.includes(card.name));
                this.hand.cards = this.hand.cards.filter(card => !cardsNames.includes(card.name));
                this.battleField.cards.push(...cards);
            } else {
                const cards = this.hand.cards.slice(-cardsNames.length);
                this.hand.cards.splice(-cardsNames.length);
                for (const card in cards) {
                    cards[card].reveal(cardsNames[card]);
                    this.battleField.cards.push(cards[card]);
                }
            }
        }
    }
}
