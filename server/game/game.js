const cardsMapping = require('./cardsDict.json');
const { shuffleDeck } = require('./utils.js');

const deck = [
    'AS', '2S', '3S', '4S', '5S', '6S', '7S', '8S', '9S', 'TS', 'JS', 'QS', 'KS',
    'AD', '2D', '3D', '4D', '5D', '6D', '7D', '8D', '9D', 'TD', 'JD', 'QD', 'KD',
    'AC', '2C', '3C', '4C', '5C', '6C', '7C', '8C', '9C', 'TC', 'JC', 'QC', 'KC',
    'AH', '2H', '3H', '4H', '5H', '6H', '7H', '8H', '9H', 'TH', 'JH', 'QH', 'KH'
];

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
    // Draw 7 cards from the shuffled deck
    const hand = shuffledDeck.slice(-7);
    // Put the remaining cards in the tavern
    const tavern = shuffledDeck.slice(0, shuffledDeck.length - 7);

    // Define playerState
    const playerState = {
        isWinner: false,
        stance: "waiting", // "discarding", "attacking" or "waiting"
        attackValue: 0,
        damageValue: 0,
        cards: {
            hand: hand,
            handCount: 7,
            field: [],
            shield: [],
            tavern: tavern,
            cemetry: [],
            castle: [],
            jester: 0
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
        isGameOver: false,
        turn: {
            playerID: "",
            stance: "",
            damage: 0
        },
        moves: {}
    };
    for (const id of playersIDS) {
        gameAction.moves[id] = [];
    }

    // If player is attacking
    if (gamestate.turn.stance === "attacking") {
        const playerCards = gamestate.players[playerID].cards
        const playerHandSelection = playerSelection.hand;
        const playerHand = playerCards.hand;

        // If player selection does not make sense we exit
        if (playerHandSelection.some(card => !playerHand.includes(card)))
            return;

        // Check selection suits and calculate selection value
        const hasClubs = playerHandSelection.some(card => cardsMapping[card].suit === "C");
        const hasHearts = playerHandSelection.some(card => cardsMapping[card].suit === "H");
        const hasDiamonds = playerHandSelection.some(card => cardsMapping[card].suit === "D");
        const hasSpades = playerHandSelection.some(card => cardsMapping[card].suit === "S");
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
            const nCardsMissingFromHand = 7 - playerCards.hand.length;
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

    }

    return gameAction;
}

module.exports = { initGameState, handleActionRequest }
