import * as PIXI from "pixi.js";

import { Deck } from "./Deck";
import { Card } from "./Card";
import { Joker } from "./Joker";
import { Button } from "./Button";

import swordImage from '../assets/images/sword.png';
import skullImage from '../assets/images/skull.png';
import hourImage from '../assets/images/hourglass.png';

import greenBtnImg from '../assets/images/green_button.png';
import redBtnImg from '../assets/images/red_button.png';
import yellowBtnImg from '../assets/images/yellow_button.png';

export class Player {
    constructor(app, sheet, state, positions, damageIndicator, confirmButton, isPlayer) {
        this.app = app;
        this.sheet = sheet;
        this.positions = positions;
        this.damageIndicator = damageIndicator;
        this.isPlayer = isPlayer;
        
        this.cardsContainer = new PIXI.Container();
        this.cardsContainer.sortableChildren = true;
        this.app.stage.addChild(this.cardsContainer);
        
        this.handCount = state.cards.handCount;
        this.tavern = new Deck(app, sheet, this.isPlayer? "B1" : "B2", this.positions.tavern, state.cards.tavern);
        this.graveyard = new Deck(app, sheet, this.isPlayer? "B1" : "B2", this.positions.graveyard, state.cards.graveyard);
        this.castle = new Deck(app, sheet, this.isPlayer? "B1" : "B2", this.positions.castle, state.cards.castle);
        this.hand = this.createCards(state.cards.hand, this.isPlayer, this.positions.hand);
        this.frontline = this.createCards(state.cards.frontline, true, this.positions.frontline);
        this.rearguard = this.createCards(state.cards.rearguard, true, this.positions.rearguard);
        this.jokerLeft = new Joker(this.cardsContainer, this.sheet, "J1", this.isPlayer? "B1" : "B2", this.isPlayer, state.cards.jokerLeft, this.positions.jokerLeft);
        this.jokerRight = new Joker(this.cardsContainer, this.sheet, "J1", this.isPlayer? "B1" : "B2", this.isPlayer, state.cards.jokerRight, this.positions.jokerRight);

        this.stance = "waiting";

        this.confirmButton = confirmButton;

        this.attackSelection = [];
        this.discardSelection = [];

        this.setStance(state.stance);
    }

    setDamageValue(value) {
        this.damageIndicator.setValue(value);
    }

    createCards(locationState, isPlayer, startPosition) {
        const cards = [];
        for (let index = 0; index < (isPlayer ? locationState.length : this.handCount); index++) {
            const cardName = isPlayer ? locationState[index] : "B2";
            const card = this.createCard(this.cardsContainer, this.sheet, cardName, startPosition);
            cards.push(card);
        }
        this.repositionCards(cards, startPosition);
        return cards;
    }

    createCard(cardsContainer, sheet, cardName, startPosition) {
        const card = new Card(cardsContainer, sheet, cardName, startPosition);
        card.sprite.on('pointerdown', () => this.onPointerDown(card));
        return card;
    }

    repositionCards(array, centerPosition) {
        // Calculate the total width of the cards in the array
        const cardWidth = 70;
        const cardGap = 8;

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
            array[index].moveTo(newPosition, true, false);
        }
    }

    repositionBoard() {
        this.repositionCards(this.frontline, this.positions.frontline);
        this.repositionCards(this.rearguard, this.positions.rearguard);
        this.repositionCards(this.hand, this.positions.hand);
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
                return accumulator + card.value;
            }, 0);
            const hasClubs = cardSelection.some(card => card.suit === "C");
            this.setDamageValue(hasClubs? 2*sum : sum);
        }

        if (this.stance === "discarding") {
            if (card.selected) {
                this.setDamageValue(this.damageIndicator.value - card.value);
            } else {
                this.setDamageValue(this.damageIndicator.value + card.value);
            }
        }

        const notSelectedCardsHand = this.hand.filter(card => !cardSelection.includes(card));
        const notSelectedCardsRearguard = this.rearguard.filter(card => !cardSelection.includes(card));
        const notSelectedCards = this.stance === "attacking"? notSelectedCardsHand : [...notSelectedCardsHand, ...notSelectedCardsRearguard];
        notSelectedCards.forEach(card => { card.setSelectable(this.stance === "attacking" ? this.canCardAttack(card) : this.damageIndicator.value > 0); });

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
            card.setSelectable(false);
        });

        this.hand.forEach(card => {
            card.setSelected(false);
            card.setSelectable(this.isPlayer && (isAttacking || isDiscarding));
        });
    
        this.rearguard.forEach(card => {
            card.setSelected(false);
            card.setSelectable(this.isPlayer && isDiscarding);
        });

        switch(stance) {
            case "attacking":
                if (this.isPlayer) this.confirmButton.update(greenBtnImg, swordImage, "Attack", false);
                this.jokerLeft.setSelectable(true);
                this.jokerRight.setSelectable(true);
                break;
            case "discarding":
                if (this.isPlayer) this.confirmButton.update(redBtnImg, skullImage, "Discard", false);
                this.jokerLeft.setSelectable(true);
                this.jokerRight.setSelectable(true);
                break;
            default:
                if (this.isPlayer) this.confirmButton.update(yellowBtnImg, hourImage, "Wait", false);
                this.jokerLeft.setSelectable(false);
                this.jokerRight.setSelectable(false);
        }

        this.attackSelection = [];
        this.discardSelection = [];
    }

    canCardAttack(card) {
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

    /**
   * This is a description of your method.
   * @param {[string]} cardsNames - The names of the cards to move. Ex: ["2H", "8D", "5S"]
   * @param {number} nCards - The number of cards to move.
   * @param {string} location - The current location of cards.
   * Must be one of "hand", "frontline", "rearguard", "graveyard", "tavern", "castle".
   * @param {string} destination - The destination to where the cards should move.
   * Must be one of "hand", "frontline", "rearguard", "graveyard", "tavern", "castle".
   */
    moveCards(cardsNames, nCards, location, destination) {

        if (location === "graveyard" && destination === "tavern") {
            const card = this.createCard(this.cardsContainer, this.sheet, this.isPlayer? "B1" : "B2", this.positions.graveyard);
            this.tavern.cardsToGet.push(card);
            this.graveyard.setSize(this.graveyard.size - nCards);
            this.tavern.setSize(this.tavern.size + nCards);
        }

        if (location === "tavern" && destination === "hand") {
            this.tavern.setSize(this.tavern.size - nCards);
            this.handCount += nCards;
            if (this.isPlayer) {
                for (const index in cardsNames) {
                    const card = this.createCard(this.cardsContainer, this.sheet, cardsNames[index], this.positions.tavern);
                    this.hand.push(card);
                }
            } else {
                for (let step = 0; step < nCards; step++) {
                    const card = this.createCard(this.cardsContainer, this.sheet, "B2", this.positions.tavern);
                    this.hand.push(card);
                }
            }
        }

        if (location === "frontline" && destination === "graveyard") {
            const cards = this.frontline.filter(card => cardsNames.includes(card.name));
            this.graveyard.cardsToGet.push(...cards);
            this.frontline = this.frontline.filter(card => !cardsNames.includes(card.name));
            this.graveyard.setSize(this.graveyard.size + nCards);
        }

        if (location === "frontline" && destination === "castle") {
            const cards = this.frontline.filter(card => cardsNames.includes(card.name));
            this.castle.cardsToGet.push(...cards);
            this.frontline = this.frontline.filter(card => !cardsNames.includes(card.name));
            this.castle.setSize(this.castle.size + nCards);
        }

        if (location === "rearguard" && destination === "graveyard") {
            const cards = this.rearguard.filter(card => cardsNames.includes(card.name));
            this.graveyard.cardsToGet.push(...cards);
            this.rearguard = this.rearguard.filter(card => !cardsNames.includes(card.name));
            this.graveyard.setSize(this.graveyard.size + nCards);
        }

        if (location === "rearguard" && destination === "castle") {
            const cards = this.rearguard.filter(card => cardsNames.includes(card.name));
            this.castle.cardsToGet.push(...cards);
            this.rearguard = this.rearguard.filter(card => !cardsNames.includes(card.name));
            this.castle.setSize(this.castle.size + nCards);
        }

        if (location === "frontline" && destination === "rearguard") {
            const cards = this.frontline.filter(card => cardsNames.includes(card.name));
            this.rearguard.push(...cards);
            this.frontline = this.frontline.filter(card => !cardsNames.includes(card.name));
        }

        if (location === "hand" && destination === "tavern") {
            this.handCount -= nCards;
            this.tavern.setSize(this.tavern.size + nCards);

            if (this.isPlayer) {
                const cards = this.hand.filter(card => cardsNames.includes(card.name));
                this.hand = this.hand.filter(card => !cardsNames.includes(card.name));
                this.tavern.cardsToGet.push(...cards);
            } else {
                const cards = this.hand.slice(-nCards);
                this.hand.splice(-nCards);
                this.tavern.cardsToGet.push(...cards);
            }
        }

        if (location === "hand" && destination === "castle") {
            this.handCount -= nCards;
            this.castle.setSize(this.castle.size + nCards);

            if (this.isPlayer) {
                const cards = this.hand.filter(card => cardsNames.includes(card.name));
                this.hand = this.hand.filter(card => !cardsNames.includes(card.name));
                this.castle.cardsToGet.push(...cards);
            } else {
                const cards = this.hand.slice(-nCards);
                this.hand.splice(-nCards);
                this.castle.cardsToGet.push(...cards);
            }
        }

        if (location === "hand" && destination === "graveyard") {
            this.handCount -= nCards;
            this.graveyard.setSize(this.graveyard.size + nCards);

            if (this.isPlayer) {
                const cards = this.hand.filter(card => cardsNames.includes(card.name));
                this.hand = this.hand.filter(card => !cardsNames.includes(card.name));
                this.graveyard.cardsToGet.push(...cards);
            } else {
                const cards = this.hand.slice(-nCards);
                this.hand.splice(-nCards);
                this.graveyard.cardsToGet.push(...cards);
            }
        }

        if (location === "hand" && destination === "frontline") {
            this.handCount -= nCards;
            if (this.isPlayer) {
                const cards = this.hand.filter(card => cardsNames.includes(card.name));
                this.hand = this.hand.filter(card => !cardsNames.includes(card.name));
                this.frontline.push(...cards);
            } else {
                const cards = this.hand.slice(-nCards);
                this.hand.splice(-nCards);
                for (const card in cards) {
                    cards[card].reveal(cardsNames[card]);
                    this.frontline.push(cards[card]);
                }
            }
        }
    }
}
