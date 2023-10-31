import { Card } from "./Card";

export class Hand {
    constructor(cardsContainer, sheet, cardsNames, centerPosition, isPlayer) {
        this.centerPosition = centerPosition;
        this.cards = [];
        for (let index = 0; index < cardsNames.length; index++) {
            const cardName = isPlayer ? cardsNames[index] : "B2";
            const card = new Card(cardsContainer, sheet, cardName, centerPosition, isPlayer);
            this.cards.push(card);
        }
        this.adjust();
    }

    adjust() {
        // Calculate the total width of the cards in the array
        const cardWidth = 80;
        const cardGap = 9;

        // Calculate the starting position to center the cards
        const startX = this.centerPosition.x - ((cardWidth + cardGap)/2) * (this.cards.length - 1);
     
        // Set the y-coordinate of the centerPosition
        const startY = this.centerPosition.y;
    
        // Reposition the cards
        for (let index = 0; index < this.cards.length; index++) {
            const newPosition = {
                x: startX + (index * (cardWidth + cardGap)),
                y: startY
            };
            this.cards[index].moveTo(newPosition, 1.14, 0, true, false);
        }
    }
}
