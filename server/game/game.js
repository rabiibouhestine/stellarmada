const cardsMapping = require('./cardsDict.json');
const { shuffleDeck } = require('./utils.js');

const deck = [
    'AS', '2S', '3S', '4S', '5S', '6S', '7S', '8S', '9S', 'TS', 'JS', 'QS', 'KS',
    'AD', '2D', '3D', '4D', '5D', '6D', '7D', '8D', '9D', 'TD', 'JD', 'QD', 'KD',
    'AC', '2C', '3C', '4C', '5C', '6C', '7C', '8C', '9C', 'TC', 'JC', 'QC', 'KC',
    'AH', '2H', '3H', '4H', '5H', '6H', '7H', '8H', '9H', 'TH', 'JH', 'QH', 'KH'
];

const handMax = 7;

const initGameState = (room) => {
    // Create players states
    const players = {};
    const playersIDs = Object.keys(room.players);
    for (const id of playersIDs) {
        players[id] = initPlayerState(deck);
    }

    // Define gameState
    const gameState = {
        isGameOver: false,
        winnerID: "",
        turn: {
            playerID: "",
            stance: "attacking", // "discarding", "attacking" or "waiting"
            damage: 0 // only set when state discarding
        },
        players: players
    };

    // Pick a random player index
    const randomPlayerIndex = Math.floor(Math.random() * playersIDs.length);
    // Get the player with the random index
    const attackingPlayerID = playersIDs[randomPlayerIndex];
    // Give the turn to the player
    gameState.turn.playerID = attackingPlayerID;

    return gameState;
}

const initPlayerState = (deck) => {
    // Shuffle player deck
    const shuffledDeck =  shuffleDeck(deck);
    // Draw handMax cards from the shuffled deck
    const hand = shuffledDeck.slice(-handMax);
    // Put the remaining cards in the tavern
    const tavern = shuffledDeck.slice(0, shuffledDeck.length - handMax);

    // Define playerState
    const playerState = {
        cards: {
            hand: hand,
            handCount: handMax,
            field: [],
            shield: [],
            tavern: tavern,
            cemetry: [],
            castle: [],
            jokerLeft: true,
            jokerRight: true
        }
    };

    return playerState;
}

const handleActionRequest = (playerID, playerSelection, gamestate) => {

    // If not player turn exit
    if (playerID !== gamestate.turn.playerID)
        return;

    // Get the players ids
    const playersIDS = Object.keys(gamestate.players);

    // Get the second player id
    const secondPlayerID = playerID === playersIDS[0] ? playersIDS[1] : playersIDS[0];

    // Initialise game action
    const gameAction = {
        isGameOver: gamestate.isGameOver,
        winnerID: gamestate.winnerID,
        turn: gamestate.turn,
        jokers: {},
        moves: {}
    };
    for (const id of playersIDS) {
        gameAction.jokers[id] = {
            jokerLeft: gamestate.players[id].cards.jokerLeft,
            jokerRight: gamestate.players[id].cards.jokerRight
        };
    }
    for (const id of playersIDS) {
        gameAction.moves[id] = [];
    }

    // If player is attacking
    if (gamestate.turn.stance === "attacking") {
        const playerCards = gamestate.players[playerID].cards
        const playerHandSelection = playerSelection.hand;

        // If player selection does not make sense we exit
        if (playerHandSelection.some(card => !playerCards.hand.includes(card)))
            return;

        // Check selection suits and calculate selection value
        const hasClubs = playerHandSelection.some(card => cardsMapping[card].suit === "C");
        const hasHearts = playerHandSelection.some(card => cardsMapping[card].suit === "H");
        const hasDiamonds = playerHandSelection.some(card => cardsMapping[card].suit === "D");
        const playerSelectionSum = playerHandSelection.reduce((accumulator, card) => {
            return accumulator + cardsMapping[card].value;
        }, 0);
        const playerSelectionValue = hasClubs? 2 * playerSelectionSum : playerSelectionSum;

        // Move selected cards from hand to field
        playerCards.hand = playerCards.hand.filter(card => !playerHandSelection.includes(card));
        playerCards.handCount = playerCards.hand.length;
        playerCards.field = playerHandSelection;

        // Add move to game action
        gameAction.moves[playerID].push(
            {
                cardsNames: playerHandSelection,
                nCards: playerHandSelection.length,
                location: "hand",
                destination: "field"
            }
        );

        // If Hearts in selection, move cards from cemetry to tavern
        if (hasHearts && playerCards.cemetry.length !== 0) {
            const revivedCards = playerCards.cemetry.splice(0, playerSelectionValue);
            playerCards.tavern.unshift(...revivedCards);

            gameAction.moves[playerID].push(
                {
                    cardsNames: [],
                    nCards: playerSelectionValue,
                    location: "cemetry",
                    destination: "tavern"
                }
            );
        }

        // If Diamonds in selection, move cards from tavern to hand
        if (hasDiamonds && playerCards.tavern.length !== 0) {
            const nCardsMissingFromHand = handMax - playerCards.hand.length;
            const nCardsToDraw = Math.min(playerSelectionValue, nCardsMissingFromHand);
            const cardsToDraw = playerCards.tavern.slice(-nCardsToDraw);
            playerCards.tavern.splice(-nCardsToDraw);
            playerCards.hand.push(...cardsToDraw);

            gameAction.moves[playerID].push(
                {
                    cardsNames: cardsToDraw,
                    nCards: nCardsToDraw,
                    location: "tavern",
                    destination: "hand"
                }
            );
        }

        // Update gameAction turn
        gameAction.turn = {
            playerID: secondPlayerID,
            stance: "discarding",
            damage: playerSelectionValue
        }
    }

    // If player is discarding
    if (gamestate.turn.stance === "discarding") {
        const playerCards = gamestate.players[playerID].cards
        const playerHandSelection = playerSelection.hand;
        const playerShieldSelection = playerSelection.shield;

        // If player selection does not make sense we exit
        const isHandSelectionScam = playerHandSelection.some(card => !playerCards.hand.includes(card));
        const isShieldSelectionScam = playerShieldSelection.some(card => !playerCards.shield.includes(card));
        const handSelectionDamage = playerHandSelection.reduce((accumulator, card) => {
            return accumulator + cardsMapping[card].value;
        }, 0);
        const shieldSelectionDamage = playerShieldSelection.reduce((accumulator, card) => {
            return accumulator + cardsMapping[card].value;
        }, 0);
        const selectionDamage = handSelectionDamage + shieldSelectionDamage;
        const isDamageEnough = selectionDamage >= gamestate.turn.damage;
        if (isHandSelectionScam || isShieldSelectionScam || !isDamageEnough)
            return;

        // Discard Royals from Shield
        const shieldHasRoyals = playerShieldSelection.some(card => cardsMapping[card].isCastle === true);
        if (shieldHasRoyals) {
            const shieldSelectedRoyals = playerShieldSelection.filter(card => cardsMapping[card].isCastle === true);
            playerCards.shield = playerCards.shield.filter(card => !shieldSelectedRoyals.includes(card));
            playerCards.castle.push(...shieldSelectedRoyals);

            gameAction.moves[playerID].push(
                {
                    cardsNames: shieldSelectedRoyals,
                    nCards: shieldSelectedRoyals.length,
                    location: "shield",
                    destination: "castle"
                }
            );
        }

        // Discard non Royals from Shield
        const shieldHasStandards = playerShieldSelection.some(card => cardsMapping[card].isCastle === false);
        if (shieldHasStandards) {
            const shieldSelectedStandards = playerShieldSelection.filter(card => cardsMapping[card].isCastle === false);
            playerCards.shield = playerCards.shield.filter(card => !shieldSelectedStandards.includes(card));
            playerCards.cemetry.push(...shieldSelectedStandards);

            gameAction.moves[playerID].push(
                {
                    cardsNames: shieldSelectedStandards,
                    nCards: shieldSelectedStandards.length,
                    location: "shield",
                    destination: "cemetry"
                }
            );
        }

        // Discard Royals from Hand
        const handHasRoyals = playerHandSelection.some(card => cardsMapping[card].isCastle === true);
        if (handHasRoyals) {
            const handSelectedRoyals = playerHandSelection.filter(card => cardsMapping[card].isCastle === true);
            playerCards.hand = playerCards.hand.filter(card => !handSelectedRoyals.includes(card));
            playerCards.castle.push(...handSelectedRoyals);

            gameAction.moves[playerID].push(
                {
                    cardsNames: handSelectedRoyals,
                    nCards: handSelectedRoyals.length,
                    location: "hand",
                    destination: "castle"
                }
            );
        }

        // Discard non Royals from Hand
        const handHasStandards = playerHandSelection.some(card => cardsMapping[card].isCastle === false);
        if (handHasStandards) {
            const handSelectedStandards = playerHandSelection.filter(card => cardsMapping[card].isCastle === false);
            playerCards.hand = playerCards.hand.filter(card => !handSelectedStandards.includes(card));
            playerCards.cemetry.push(...handSelectedStandards);

            gameAction.moves[playerID].push(
                {
                    cardsNames: handSelectedStandards,
                    nCards: handSelectedStandards.length,
                    location: "hand",
                    destination: "cemetry"
                }
            );
        }

        // Move cards from field to secondPlayer shield
        const secondPlayerCards = gamestate.players[secondPlayerID].cards;
        const isSecondPlayerShieldFull = secondPlayerCards.shield.length == 2;
        const secondPlayerFieldHasSpades = secondPlayerCards.field.some(card => cardsMapping[card].suit === "S");

        if (!isSecondPlayerShieldFull && secondPlayerFieldHasSpades) {
            // Sort the field array by value in descending order
            secondPlayerCards.field.sort((a, b) => cardsMapping[a].value - cardsMapping[b].value);

            // Calculate how many cards can be moved to the shield
            const nCardsToMove = Math.min(2 - secondPlayerCards.shield.length, secondPlayerCards.field.length);
            const cardsToMove = secondPlayerCards.field.slice(-nCardsToMove);

            // Move the cards from the field to the shield
            secondPlayerCards.shield.push(...cardsToMove);
            secondPlayerCards.field.splice(0, nCardsToMove);

            gameAction.moves[secondPlayerID].push(
                {
                    cardsNames: cardsToMove,
                    nCards: cardsToMove.length,
                    location: "field",
                    destination: "shield"
                }
            );
        }

        // Discard second player Royals from Field
        const secondPlayerFieldHasRoyals = secondPlayerCards.field.some(card => cardsMapping[card].isCastle === true);
        if (secondPlayerFieldHasRoyals) {
            const secondPlayerFieldRoyals = secondPlayerCards.field.filter(card => cardsMapping[card].isCastle === true);
            secondPlayerCards.field = secondPlayerCards.field.filter(card => !secondPlayerFieldRoyals.includes(card));
            secondPlayerCards.castle.push(...secondPlayerFieldRoyals);

            gameAction.moves[secondPlayerID].push(
                {
                    cardsNames: secondPlayerFieldRoyals,
                    nCards: secondPlayerFieldRoyals.length,
                    location: "field",
                    destination: "castle"
                }
            );
        }
        
        // Discard second player non Royals from Field
        const secondPlayerFieldHasStandards = secondPlayerCards.field.some(card => cardsMapping[card].isCastle === false);
        if (secondPlayerFieldHasStandards) {
            const secondPlayerFieldStandards = secondPlayerCards.field.filter(card => cardsMapping[card].isCastle === false);
            secondPlayerCards.field = secondPlayerCards.field.filter(card => !secondPlayerFieldStandards.includes(card));
            secondPlayerCards.cemetry.push(...secondPlayerFieldStandards);

            gameAction.moves[secondPlayerID].push(
                {
                    cardsNames: secondPlayerFieldStandards,
                    nCards: secondPlayerFieldStandards.length,
                    location: "field",
                    destination: "cemetry"
                }
            );
        }

        // Update gameAction turn
        gameAction.turn = {
            playerID: playerID,
            stance: "attacking",
            damage: 0
        }
    }

    // Update game state
    gamestate.isGameOver = gameAction.isGameOver;
    gamestate.turn = gameAction.turn;

    return gameAction;
}

const handleJokerRequest = (playerID, joker, gamestate) => {
    // If not player turn exit
    if (playerID !== gamestate.turn.playerID)
        return;

    // If requested Joker is already dead exit
    if (joker === "left" && !gamestate.players[playerID].cards.jokerLeft) {
        return;
    }
    if (joker === "right" && !gamestate.players[playerID].cards.jokerRight) {
        return;
    }

    // Update joker in gamestate
    if (joker === "left") {
        gamestate.players[playerID].cards.jokerLeft = false;
    }
    if (joker === "right") {
        gamestate.players[playerID].cards.jokerRight = false;
    }

    // Get the players ids
    const playersIDS = Object.keys(gamestate.players);

    // Initialise game action
    const gameAction = {
        isGameOver: gamestate.isGameOver,
        winnerID: gamestate.winnerID,
        turn: gamestate.turn,
        jokers: {},
        moves: {}
    };
    for (const id of playersIDS) {
        gameAction.jokers[id] = {
            jokerLeft: gamestate.players[id].cards.jokerLeft,
            jokerRight: gamestate.players[id].cards.jokerRight
        };
    }
    for (const id of playersIDS) {
        gameAction.moves[id] = [];
    }

    // Return hand to tavern
    const hand = gamestate.players[playerID].cards.hand;
    const tavern = gamestate.players[playerID].cards.tavern;
    const oldHand = [...hand];
    tavern.push(...oldHand);
    hand.splice(0, hand.length);
    gameAction.moves[playerID].push(
        {
            cardsNames: oldHand,
            nCards: oldHand.length,
            location: "hand",
            destination: "tavern"
        }
    );

    // Shuffle tavern and draw handMax cards
    const shuffledDeck =  shuffleDeck(tavern);
    gamestate.players[playerID].cards.hand = shuffledDeck.slice(-handMax);
    gamestate.players[playerID].cards.tavern = shuffledDeck.slice(0, shuffledDeck.length - handMax);
    const newHand = gamestate.players[playerID].cards.hand;
    gameAction.moves[playerID].push(
        {
            cardsNames: newHand,
            nCards: newHand.length,
            location: "tavern",
            destination: "hand"
        }
    );

    return gameAction;
}

module.exports = { initGameState, handleActionRequest, handleJokerRequest }
