const cardsMapping = require('./cardsDict.json');

const shuffleArray = (deck) => {
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
            processedState.players[id].cards.drawPile = gameState.players[id].cards.drawPile.length;
            processedState.players[id].cards.discardPile = gameState.players[id].cards.discardPile.length;
            processedState.players[id].cards.destroyPile = gameState.players[id].cards.destroyPile.length;
        } else {
            processedState.players[id].cards.hand = makeUnknownCardsArray(gameState.players[id].cards.hand);
            processedState.players[id].cards.drawPile = gameState.players[id].cards.drawPile.length;
            processedState.players[id].cards.discardPile = gameState.players[id].cards.discardPile.length;
            processedState.players[id].cards.destroyPile = gameState.players[id].cards.destroyPile.length;
        }
    }

    return processedState;
}

const processGameAction = (gameAction, playerID, isCurrentPlayer) => {
    const processedMoves = [];

    for (let i = 0; i < gameAction.moves.length; i++) {
        const move = gameAction.moves[i];
        const isPlayer = move.playerID === playerID;
        const isDrawing = (move.location === "drawPile") && (move.destination === "hand");
        if (isDrawing && ((isPlayer && !isCurrentPlayer) || (!isPlayer && isCurrentPlayer))) {
            const processedMove = {
                playerID: move.playerID,
                cardsNames: makeUnknownCardsArray(move.cardsNames),
                location: move.location,
                destination: move.destination,
            };
            processedMoves.push(processedMove);
        } else {
            processedMoves.push(move);
        }
    }

    return {
        isGameOver: gameAction.isGameOver,
        winnerID: gameAction.winnerID,
        turn: gameAction.turn,
        logs: gameAction.logs,
        moves: processedMoves
    };
}

const clearAttack = (playerID, gamestate) => {
    // Define clear attack moves
    const clearAttackMoves = [];

    // Get player cards
    const playerCards = gamestate.players[playerID].cards;

    // Discard player Royals from Frontline
    const frontlineHasRoyals = playerCards.frontline.some(card => cardsMapping[card].isMissile === true);
    if (frontlineHasRoyals) {
        const frontlineRoyals = playerCards.frontline.filter(card => cardsMapping[card].isMissile === true);
        playerCards.frontline = playerCards.frontline.filter(card => !frontlineRoyals.includes(card));
        playerCards.destroyPile.push(...frontlineRoyals);

        clearAttackMoves.push(
            {
                playerID: playerID,
                cardsNames: frontlineRoyals,
                location: "frontline",
                destination: "destroyPile"
            }
        );
    }
    
    // Discard player non Royals from Frontline
    const frontlineHasStandards = playerCards.frontline.some(card => cardsMapping[card].isMissile === false);
    if (frontlineHasStandards) {
        const frontlineStandards = playerCards.frontline.filter(card => cardsMapping[card].isMissile === false);
        playerCards.frontline = playerCards.frontline.filter(card => !frontlineStandards.includes(card));
        playerCards.discardPile.push(...frontlineStandards);

        clearAttackMoves.push(
            {
                playerID: playerID,
                cardsNames: frontlineStandards,
                location: "frontline",
                destination: "discardPile"
            }
        );
    }

    // Return clear attack moves
    return clearAttackMoves;
}

const makeUnknownCardsArray = (array) => {
    return Array.from({ length: array.length }, () => '?');
}

module.exports = { shuffleArray, processGameState, processGameAction, clearAttack, makeUnknownCardsArray }
