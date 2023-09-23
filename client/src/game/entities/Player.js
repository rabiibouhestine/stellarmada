import * as PIXI from "pixi.js";

import { Deck } from "./Deck";
import { Card } from "./Card";
import { Button } from "./Button";
import { Indicator } from "./Indicator";

import swordImage from '../assets/images/sword.png';
import skullImage from '../assets/images/skull.png';
import hourImage from '../assets/images/hourglass.png';

import greenBtnImg from '../assets/images/green_button.png';
import redBtnImg from '../assets/images/red_button.png';
import yellowBtnImg from '../assets/images/yellow_button.png';

export class Player {
    constructor(app, sheet, state, positions, isPlayer) {
        this.app = app;
        this.sheet = sheet;
        this.positions = positions;
        this.isPlayer = isPlayer;
        
        this.cardsContainer = new PIXI.Container();
        this.cardsContainer.sortableChildren = true;
        this.app.stage.addChild(this.cardsContainer);
        
        this.stance = state.stance;
        this.handCount = state.cards.handCount;
        this.tavern = new Deck(app, sheet, "B1", this.positions.tavern, state.cards.tavern);
        this.cemetry = new Deck(app, sheet, "B1", this.positions.cemetry, state.cards.cemetry);
        this.castle = new Deck(app, sheet, "KH", this.positions.castle, state.cards.castle);
        this.jester = new Deck(app, sheet, "J1", this.positions.jester, state.cards.jester);
        this.hand = this.createCards(state.cards.hand, this.isPlayer, this.positions.hand);
        this.field = this.createCards(state.cards.field, true, this.positions.field);
        this.shield = this.createCards(state.cards.shield, true, this.positions.shield);
        this.attackIndicator = new Indicator(app, positions.attackIndicator, swordImage, state.attackValue, true);
        this.damageValue = state.damageValue;

        this.confirmButton = new Button(app, positions.confirmButton, yellowBtnImg, hourImage, "", false, isPlayer);
        this.discardIndicator = new Indicator(app, positions.discardIndicator, null, 0, isPlayer);

        this.attackSelection = [];
        this.discardSelection = [];

        this.setStance(state.stance);
    }

    setDiscardValue(value) {
        this.discardIndicator.setValue(value);
    }

    setAttackValue(value) {
        this.attackIndicator.setValue(value);
    }

    setDamageValue(value) {
        this.damageValue = value;
    }

    createCards(locationState, isPlayer, startPosition) {
        const cards = [];
        for (let index = 0; index < (isPlayer ? locationState.length : this.handCount); index++) {
            const cardName = isPlayer ? locationState[index] : "B1";
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
        if (!card.selectable) return;
    
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
            this.setAttackValue(hasClubs? 2*sum : sum);
        }

        if (this.stance === "discarding") {
            const sum = cardSelection.reduce((accumulator, card) => {
                return accumulator + card.value;
            }, 0);
            this.setDiscardValue(sum);
        }

        const notSelectedCardsHand = this.hand.filter(card => !cardSelection.includes(card));
        const notSelectedCardsShield = this.shield.filter(card => !cardSelection.includes(card));
        const notSelectedCards = this.stance === "attacking"? notSelectedCardsHand : [...notSelectedCardsHand, ...notSelectedCardsShield];
        notSelectedCards.forEach(card => { card.setSelectable(this.stance === "attacking" ? this.canCardAttack(card) : this.canDiscardMore()); });
    }

    setStance(stance) {
        this.stance = stance;
        const isAttacking = this.stance === "attacking";
        const canDiscardMore = this.stance === "discarding" && this.canDiscardMore();
    
        this.field.forEach(card => {
            card.setSelectable(false);
        });

        this.hand.forEach(card => {
            card.setSelectable(this.isPlayer && (isAttacking || canDiscardMore));
        });
    
        this.shield.forEach(card => {
            card.setSelectable(isAttacking ? false : (this.isPlayer && canDiscardMore));
        });

        switch(stance) {
            case "attacking":
                this.confirmButton.update(greenBtnImg, swordImage, "Attack", true);
                break;
            case "discarding":
                this.confirmButton.update(redBtnImg, skullImage, "Discard", true);
                break;
            default:
                this.confirmButton.update(yellowBtnImg, hourImage, "Wait", false);
          }
    }

    canDiscardMore() {
        // Calculate the sum of values of selected cards
        const totalValue = this.discardSelection.reduce((sum, card) => sum + card.value, 0);
        return totalValue < this.damageValue;
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
                const card = this.createCard(this.cardsContainer, this.sheet, units[index], this.positions.tavern);
                this.hand.push(card);
            }
        } else {
            for (let step = 0; step < x; step++) {
                const card = this.createCard(this.cardsContainer, this.sheet, "B1", this.positions.tavern);
                this.hand.push(card);
            }
        }
        this.repositionCards(this.hand, this.positions.hand);
    }

    drawCastle(unit) {
        this.castle.setSize(this.castle.size - 1);
        this.handCount += 1;
        const name = this.isPlayer? this.castle.getName() : "B1";
        const card = this.createCard(this.cardsContainer, this.sheet, name, this.positions.castle);
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
