

const shuffleDeck = (deck) => {
    const shuffled = JSON.parse(JSON.stringify(deck));
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

module.exports = { shuffleDeck, processGameState }
