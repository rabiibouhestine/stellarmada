const cardsMapping = require('./cardsDict.json');

const shuffleDeck = (deck) => {
    const shuffled = [...deck];
    for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
}

const processGameState = (gameState, playerID) => {
    const processedState = JSON.parse(JSON.stringify(gameState));
    const playersIDs = Object.keys(processedState.players);
    for (const id of playersIDs) {
        if (id === playerID) {
            processedState.players[id].cards.tavern = gameState.players[id].cards.tavern.length;
            processedState.players[id].cards.graveyard = gameState.players[id].cards.graveyard.length;
            processedState.players[id].cards.castle = gameState.players[id].cards.castle.length;
        } else {
            processedState.players[id].cards.hand = [];
            processedState.players[id].cards.tavern = gameState.players[id].cards.tavern.length;
            processedState.players[id].cards.graveyard = gameState.players[id].cards.graveyard.length;
            processedState.players[id].cards.castle = gameState.players[id].cards.castle.length;
        }
    }

    return processedState;
}

const clearAttack = (playerID, gamestate) => {
    // Define clear attack moves
    const clearAttackMoves = [];

    // Get player cards
    const playerCards = gamestate.players[playerID].cards;

    // Discard player Royals from Frontline
    const frontlineHasRoyals = playerCards.frontline.some(card => cardsMapping[card].isCastle === true);
    if (frontlineHasRoyals) {
        const frontlineRoyals = playerCards.frontline.filter(card => cardsMapping[card].isCastle === true);
        playerCards.frontline = playerCards.frontline.filter(card => !frontlineRoyals.includes(card));
        playerCards.castle.push(...frontlineRoyals);

        clearAttackMoves.push(
            {
                playerID: playerID,
                cardsNames: frontlineRoyals,
                location: "frontline",
                destination: "castle"
            }
        );
    }
    
    // Discard player non Royals from Frontline
    const frontlineHasStandards = playerCards.frontline.some(card => cardsMapping[card].isCastle === false);
    if (frontlineHasStandards) {
        const frontlineStandards = playerCards.frontline.filter(card => cardsMapping[card].isCastle === false);
        playerCards.frontline = playerCards.frontline.filter(card => !frontlineStandards.includes(card));
        playerCards.graveyard.push(...frontlineStandards);

        clearAttackMoves.push(
            {
                playerID: playerID,
                cardsNames: frontlineStandards,
                location: "frontline",
                destination: "graveyard"
            }
        );
    }

    // Return clear attack moves
    return clearAttackMoves;
}

module.exports = { shuffleDeck, processGameState, clearAttack }
