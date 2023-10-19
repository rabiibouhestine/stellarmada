const cardsMapping = require('./cardsDict.json');

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

const resetState = (playerID, gamestate, handMax) => {

    // Initialise reset action
    const resetAction = {
        jokers: {
            jokerLeft: gamestate.players[playerID].cards.jokerLeft,
            jokerRight: gamestate.players[playerID].cards.jokerRight
        },
        moves: []
    };

    const playerJokerLeft = gamestate.players[playerID].cards.jokerLeft;
    const playerJokerRight = gamestate.players[playerID].cards.jokerRight;
    const playerJokersDead = !playerJokerLeft && !playerJokerRight;

    // If both towers dead, abort reset
    if (playerJokersDead) return resetAction;

    // Destory one tower, starting with left
    if (playerJokerLeft) {
        gamestate.players[playerID].cards.jokerLeft = false;
        resetAction.jokers.jokerLeft = false;
    } else {
        gamestate.players[playerID].cards.jokerRight = false;
        resetAction.jokers.jokerRight = false;
    }

    // Put outpost cards in Barracks
    if (gamestate.players[playerID].cards.rearguard.length) {
        const currentRearguard = [...gamestate.players[playerID].cards.rearguard];
        gamestate.players[playerID].cards.tavern.push(...currentRearguard);
        gamestate.players[playerID].cards.rearguard = [];
        resetAction.moves.push(
            {
                cardsNames: currentRearguard,
                nCards: currentRearguard.length,
                location: "rearguard",
                destination: "tavern"
            }
        );
    }

    // Put hospice cards in Barracks
    if (gamestate.players[playerID].cards.graveyard.length) {
        const currentGraveyard = [...gamestate.players[playerID].cards.graveyard];
        gamestate.players[playerID].cards.tavern.push(...currentGraveyard);
        gamestate.players[playerID].cards.graveyard = [];
        resetAction.moves.push(
            {
                cardsNames: currentGraveyard,
                nCards: currentGraveyard.length,
                location: "graveyard",
                destination: "tavern"
            }
        );
    }

    // Put hand cards in Barracks
    if (gamestate.players[playerID].cards.hand.length) {
        const currentHand = [...gamestate.players[playerID].cards.hand];
        gamestate.players[playerID].cards.tavern.push(...currentHand);
        gamestate.players[playerID].cards.hand = [];
        resetAction.moves.push(
            {
                cardsNames: currentHand,
                nCards: currentHand.length,
                location: "hand",
                destination: "tavern"
            }
        );
    }

    // Remove Ace of Diamonds from barracks
    const currentTavern = [...gamestate.players[playerID].cards.tavern];
    const indexToRemove = currentTavern.indexOf("AD");
    currentTavern.splice(indexToRemove, 1);
    // Add the Ace of Diamonds to hand
    gamestate.players[playerID].cards.hand = ["AD"];
    // Shuffle barracks
    const shuffledTavern =  shuffleDeck(currentTavern);
    // Draw handMax - 1 cards from the shuffled deck
    const cardsToDraw = shuffledTavern.splice(0, handMax - 1); 
    gamestate.players[playerID].cards.hand.push(...cardsToDraw);
    // Put the remaining cards in the barracks
    gamestate.players[playerID].cards.tavern = shuffledTavern;
    // Add move
    resetAction.moves.push(
        {
            cardsNames: gamestate.players[playerID].cards.hand,
            nCards: gamestate.players[playerID].cards.hand.length,
            location: "tavern",
            destination: "hand"
        }
    );

    // Return reset action
    return resetAction;
}

const clearAttack = (playerID, gamestate, outpostCapacity) => {
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
                cardsNames: frontlineRoyals,
                nCards: frontlineRoyals.length,
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
                cardsNames: frontlineStandards,
                nCards: frontlineStandards.length,
                location: "frontline",
                destination: "graveyard"
            }
        );
    }

    // Return clear attack moves
    return clearAttackMoves;
}

module.exports = { shuffleDeck, processGameState, resetState, clearAttack }
