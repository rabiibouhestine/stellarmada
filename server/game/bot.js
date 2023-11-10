const cardsMapping = require('./cardsDict.json');

const botSelection = (gamestate) => {

    let selection = [];
    const hand = gamestate.players['bot'].cards.hand;

    if (gamestate.turn.stance === 'attacking') {
        // if hand has more than 4 cards
        if (hand.length > 4) {
            const nonDiamondShips = hand.filter(card => cardsMapping[card].suit !== "D" && cardsMapping[card].isMissile === false);
            // if hand has non diamond ships
            if (nonDiamondShips.length) {
                // play least value non diamond ship
                const cardWithLeastPower = hand.reduce((minCard, currentCard) => {
                    const currentPower = cardsMapping[currentCard].offensivePower;
                    const minPower = cardsMapping[minCard].offensivePower;
                  
                    return currentPower < minPower ? currentCard : minCard;
                  }, hand[0]);
                selection = [cardWithLeastPower];
            } else {
                // else play first card in hand
                selection = [hand[0]];
            }
        } else {
            // else play diamond ship + any missiles
            const diamondShips = hand.filter(card => cardsMapping[card].suit === "D" && cardsMapping[card].isMissile === false);
            const selectionSuits = [];
            if (diamondShips.length) {
                selection.push(diamondShips[0]);
                selectionSuits.push("D");
                const missiles = hand.filter(card => cardsMapping[card].isMissile === true);
                if (missiles.length) {
                    for (const index in missiles) {
                        if ( !selectionSuits.includes(cardsMapping[missiles[index]].suit) ) {
                            selection.push(missiles[index]);
                            selectionSuits.push(cardsMapping[missiles[index]].suit);
                        }
                    }
                }
            } else {
                // else play first card in hand
                selection = [hand[0]];
            }
        }
    } else {
        // pick any non diamond cards, prioritising missiles

        const diamondShips = hand.filter(card => cardsMapping[card].suit === "D" && cardsMapping[card].isMissile === false);
        const nonDiamondShips = hand.filter(card => cardsMapping[card].suit !== "D" && cardsMapping[card].isMissile === false);
        const diamondMissiles = hand.filter(card => cardsMapping[card].suit === "D" && cardsMapping[card].isMissile === true);
        const nonDiamondMissiles = hand.filter(card => cardsMapping[card].suit !== "D" && cardsMapping[card].isMissile === true);

        const reorderedHand = [...nonDiamondMissiles, ...nonDiamondShips, ...diamondMissiles, ...diamondShips];

        for (const index in reorderedHand) {
            const selectionDefensivePower = selection.reduce((accumulator, card) => {
                return accumulator + cardsMapping[card].defensivePower;
            }, 0);
            if (selectionDefensivePower < gamestate.turn.damage) {
                selection.push(reorderedHand[index]);
            }
        }
    }

    return selection;
}

module.exports = { botSelection }
