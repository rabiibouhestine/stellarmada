import * as PIXI from "pixi.js";

import { Deck } from "./Deck";
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
        
        this.tavern = new Deck(app, sheet, this.isPlayer, this.positions.tavern, state.cards.tavern);
        this.graveyard = new Deck(app, sheet, this.isPlayer, this.positions.graveyard, state.cards.graveyard);
        this.castle = new Deck(app, sheet, this.isPlayer, this.positions.castle, state.cards.castle);
        this.hand = this.createCards(state.cards.hand, this.isPlayer, this.positions.hand, true, this.isPlayer);
        this.frontline = this.createCards(state.cards.frontline, true, this.positions.frontline, false, this.isPlayer);
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
        const cardWidth = isHand? 84 : 70;
        const cardGap = isHand? 6 : 8;

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
        this.repositionCards(this.frontline, this.positions.frontline, false);
        this.repositionCards(this.hand, this.positions.hand, true);
        this.graveyard.repositionCards();
        this.tavern.repositionCards();
        this.castle.repositionCards();
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
            const hasClubs = cardSelection.some(card => card.suit === "C");
            this.damageIndicator.setValue(hasClubs? 2*sum : sum);
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
    
        this.frontline.forEach(card => {
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
   * Must be one of "hand", "frontline", "graveyard", "tavern", "castle".
   * @param {string} destination - The destination to where the cards should move.
   * Must be one of "hand", "frontline", "graveyard", "tavern", "castle".
   */
    moveCards(cardsNames, location, destination) {

        if (location === "graveyard" && destination === "tavern") {
            const card = this.createCard(this.cardsContainer, this.sheet, this.isPlayer? "B1" : "B2", this.positions.graveyard, this.isPlayer);
            this.tavern.cardsToGet.push(card);
            this.graveyard.setSize(this.graveyard.size - cardsNames.length);
            this.tavern.setSize(this.tavern.size + cardsNames.length);
        }

        if (location === "tavern" && destination === "graveyard") {
            const card = this.createCard(this.cardsContainer, this.sheet, this.isPlayer? "B1" : "B2", this.positions.tavern, this.isPlayer);
            this.graveyard.cardsToGet.push(card);
            this.tavern.setSize(this.tavern.size - cardsNames.length);
            this.graveyard.setSize(this.graveyard.size + cardsNames.length);
        }

        if (location === "tavern" && destination === "hand") {
            this.tavern.setSize(this.tavern.size - cardsNames.length);
            if (this.isPlayer) {
                for (const index in cardsNames) {
                    const card = this.createCard(this.cardsContainer, this.sheet, cardsNames[index], this.positions.tavern, this.isPlayer);
                    this.hand.push(card);
                }
            } else {
                for (let step = 0; step < cardsNames.length; step++) {
                    const card = this.createCard(this.cardsContainer, this.sheet, "B2", this.positions.tavern, this.isPlayer);
                    this.hand.push(card);
                }
            }
        }

        if (location === "frontline" && destination === "graveyard") {
            const cards = this.frontline.filter(card => cardsNames.includes(card.name));
            this.graveyard.cardsToGet.push(...cards);
            this.frontline = this.frontline.filter(card => !cardsNames.includes(card.name));
            this.graveyard.setSize(this.graveyard.size + cardsNames.length);
        }

        if (location === "frontline" && destination === "castle") {
            const cards = this.frontline.filter(card => cardsNames.includes(card.name));
            this.castle.cardsToGet.push(...cards);
            this.frontline = this.frontline.filter(card => !cardsNames.includes(card.name));
            this.castle.setSize(this.castle.size + cardsNames.length);
        }

        if (location === "hand" && destination === "castle") {
            this.castle.setSize(this.castle.size + cardsNames.length);

            if (this.isPlayer) {
                const cards = this.hand.filter(card => cardsNames.includes(card.name));
                this.hand = this.hand.filter(card => !cardsNames.includes(card.name));
                this.castle.cardsToGet.push(...cards);
            } else {
                const cards = this.hand.slice(-cardsNames.length);
                this.hand.splice(-cardsNames.length);
                this.castle.cardsToGet.push(...cards);
            }
        }

        if (location === "hand" && destination === "graveyard") {
            this.graveyard.setSize(this.graveyard.size + cardsNames.length);

            if (this.isPlayer) {
                const cards = this.hand.filter(card => cardsNames.includes(card.name));
                this.hand = this.hand.filter(card => !cardsNames.includes(card.name));
                this.graveyard.cardsToGet.push(...cards);
            } else {
                const cards = this.hand.slice(-cardsNames.length);
                this.hand.splice(-cardsNames.length);
                this.graveyard.cardsToGet.push(...cards);
            }
        }

        if (location === "hand" && destination === "frontline") {
            if (this.isPlayer) {
                const cards = this.hand.filter(card => cardsNames.includes(card.name));
                this.hand = this.hand.filter(card => !cardsNames.includes(card.name));
                this.frontline.push(...cards);
            } else {
                const cards = this.hand.slice(-cardsNames.length);
                this.hand.splice(-cardsNames.length);
                for (const card in cards) {
                    cards[card].reveal(cardsNames[card]);
                    this.frontline.push(cards[card]);
                }
            }
        }
    }
}
