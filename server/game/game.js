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
    // Pick a random player index
    const randomPlayerIndex = Math.floor(Math.random() * playersIDs.length);
    // Get the player with the random index
    const attackingPlayerID = playersIDs[randomPlayerIndex];
    // Assign an attacking stance to the player with the random index
    players[attackingPlayerID].stance = "attacking";

    // Define gameState
    const gameState = {
        isGameOver: false,
        players: players
    };

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

    const gameAction = {
        isGameOver: false,
        players: {}
    };

    gameAction.players[playerID] = {
        isWinner: false,
        stance: "waiting",
        attackValue: 0,
        damageValue: 0,
        actions: {
            attack: {
                units: [...playerSelection.hand, ...playerSelection.shield]
            },
            revive: {
                x: 2
            },
            buildShield: {
                units: "6S"
            },
            drawTavern: {
                x: 0,
                units: ["3H", "5D"]
            }
        } 
    };

    return gameAction;
}

module.exports = { initGameState, handleActionRequest }
