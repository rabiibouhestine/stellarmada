import * as PIXI from "pixi.js";

import { Pile } from "./Pile";
import { Card } from "./Card";
import { Joker } from "./Joker";

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
        
        this.drawPile = new Pile(app, sheet, this.isPlayer, this.positions.drawPile, state.cards.drawPile);
        this.discardPile = new Pile(app, sheet, this.isPlayer, this.positions.discardPile, state.cards.discardPile);
        this.destroyPile = new Pile(app, sheet, this.isPlayer, this.positions.destroyPile, state.cards.destroyPile);
        this.hand = this.createCards(state.cards.hand, this.isPlayer, this.positions.hand, true, this.isPlayer);
        this.battleField = this.createCards(state.cards.battleField, true, this.positions.battleField, false, this.isPlayer);
        this.joker = new Joker(app, sheet, this.positions.joker, this.isPlayer);

        this.attackSelection = [];
        this.discardSelection = [];
        
        this.stance = "waiting";
        this.setStance(state.stance);
    }

    createCards(locationState, isHidden, startPosition, isHand, isPlayer) {
        const cards = [];
        for (let index = 0; index < locationState.length; index++) {
            const cardName = isHidden ? locationState[index] : "B2";
            const card = this.createCard(this.cardsContainer, this.sheet, cardName, startPosition, isPlayer);
            cards.push(card);
        }
        this.repositionCards(cards, startPosition, isHand);
        return cards;
    }

    createCard(cardsContainer, sheet, cardName, startPosition, isPlayer) {
        const card = new Card(cardsContainer, sheet, cardName, startPosition, isPlayer);
        card.container.on('pointerdown', () => this.onPointerDown(card));
        return card;
    }

    repositionCards(array, centerPosition, isHand) {
        // Calculate the total width of the cards in the array
        const cardWidth = isHand? 80 : 70;
        const cardGap = isHand? 9 : 7;

        // Calculate the starting position to center the cards
        const startX = centerPosition.x - ((cardWidth + cardGap)/2) * (array.length - 1);
     
        // Set the y-coordinate of the centerPosition
        const startY = centerPosition.y;
    
        // Reposition the cards
        for (let index = 0; index < array.length; index++) {
            const newPosition = {
                x: startX + (index * (cardWidth + cardGap)),
                y: startY
            };
            array[index].moveTo(newPosition, isHand, true, false);
        }
    }

    repositionBoard() {
        this.repositionCards(this.battleField, this.positions.battleField, false);
        this.repositionCards(this.hand, this.positions.hand, true);
        this.discardPile.repositionCards();
        this.drawPile.repositionCards();
        this.destroyPile.repositionCards();
    }

    onPointerDown(card) {
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

        const notSelectedCards = this.hand.filter(card => !cardSelection.includes(card));
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
    
        this.battleField.forEach(card => {
            card.setSelected(false);
            card.setSelectable(false, false);
        });

        this.hand.forEach(card => {
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

    /**
   * This is a description of your method.
   * @param {[string]} cardsNames - The names of the cards to move. Ex: ["2H", "8D", "5S"]
   * @param {string} location - The current location of cards.
   * Must be one of "hand", "battleField", "discardPile", "drawPile", "destroyPile".
   * @param {string} destination - The destination to where the cards should move.
   * Must be one of "hand", "battleField", "discardPile", "drawPile", "destroyPile".
   */
    moveCards(cardsNames, location, destination) {

        if (location === "discardPile" && destination === "drawPile") {
            const card = this.createCard(this.cardsContainer, this.sheet, this.isPlayer? "B1" : "B2", this.positions.discardPile, this.isPlayer);
            this.drawPile.cardsToGet.push(card);
            this.discardPile.setSize(this.discardPile.size - cardsNames.length);
            this.drawPile.setSize(this.drawPile.size + cardsNames.length);
        }

        if (location === "drawPile" && destination === "discardPile") {
            const card = this.createCard(this.cardsContainer, this.sheet, this.isPlayer? "B1" : "B2", this.positions.drawPile, this.isPlayer);
            this.discardPile.cardsToGet.push(card);
            this.drawPile.setSize(this.drawPile.size - cardsNames.length);
            this.discardPile.setSize(this.discardPile.size + cardsNames.length);
        }

        if (location === "drawPile" && destination === "hand") {
            this.drawPile.setSize(this.drawPile.size - cardsNames.length);
            if (this.isPlayer) {
                for (const index in cardsNames) {
                    const card = this.createCard(this.cardsContainer, this.sheet, cardsNames[index], this.positions.drawPile, this.isPlayer);
                    this.hand.push(card);
                }
            } else {
                for (let step = 0; step < cardsNames.length; step++) {
                    const card = this.createCard(this.cardsContainer, this.sheet, "B2", this.positions.drawPile, this.isPlayer);
                    this.hand.push(card);
                }
            }
        }

        if (location === "battleField" && destination === "discardPile") {
            const cards = this.battleField.filter(card => cardsNames.includes(card.name));
            this.discardPile.cardsToGet.push(...cards);
            this.battleField = this.battleField.filter(card => !cardsNames.includes(card.name));
            this.discardPile.setSize(this.discardPile.size + cardsNames.length);
        }

        if (location === "battleField" && destination === "destroyPile") {
            const cards = this.battleField.filter(card => cardsNames.includes(card.name));
            this.destroyPile.cardsToGet.push(...cards);
            this.battleField = this.battleField.filter(card => !cardsNames.includes(card.name));
            this.destroyPile.setSize(this.destroyPile.size + cardsNames.length);
        }

        if (location === "hand" && destination === "destroyPile") {
            this.destroyPile.setSize(this.destroyPile.size + cardsNames.length);

            if (this.isPlayer) {
                const cards = this.hand.filter(card => cardsNames.includes(card.name));
                this.hand = this.hand.filter(card => !cardsNames.includes(card.name));
                this.destroyPile.cardsToGet.push(...cards);
            } else {
                const cards = this.hand.slice(-cardsNames.length);
                this.hand.splice(-cardsNames.length);
                this.destroyPile.cardsToGet.push(...cards);
            }
        }

        if (location === "hand" && destination === "discardPile") {
            this.discardPile.setSize(this.discardPile.size + cardsNames.length);

            if (this.isPlayer) {
                const cards = this.hand.filter(card => cardsNames.includes(card.name));
                this.hand = this.hand.filter(card => !cardsNames.includes(card.name));
                this.discardPile.cardsToGet.push(...cards);
            } else {
                const cards = this.hand.slice(-cardsNames.length);
                this.hand.splice(-cardsNames.length);
                this.discardPile.cardsToGet.push(...cards);
            }
        }

        if (location === "hand" && destination === "battleField") {
            if (this.isPlayer) {
                const cards = this.hand.filter(card => cardsNames.includes(card.name));
                this.hand = this.hand.filter(card => !cardsNames.includes(card.name));
                this.battleField.push(...cards);
            } else {
                const cards = this.hand.slice(-cardsNames.length);
                this.hand.splice(-cardsNames.length);
                for (const card in cards) {
                    cards[card].reveal(cardsNames[card]);
                    this.battleField.push(cards[card]);
                }
            }
        }
    }
}
