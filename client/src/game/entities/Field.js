import { Card } from "./Card";

export class Field {
    constructor(cardsContainer, sheet, cardsNames, centerPosition) {
        this.centerPosition = centerPosition;
        this.cards = [];
        for (let index = 0; index < cardsNames.length; index++) {
            const cardName = cardsNames[index];
            const card = new Card(cardsContainer, sheet, cardName, centerPosition, true);
            this.cards.push(card);
        }
        this.adjust();
    }

    adjust() {
        // Calculate the total width of the cards in the array
        const cardWidth = 70;
        const cardGap = 7;

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
            this.cards[index].moveTo(newPosition, 1, true, false);
        }
    }
}