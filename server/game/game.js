const cardsMapping = require('./cardsDict.json');
const { shuffleDeck } = require('./utils.js');

const deck = [
    'AS', '2S', '3S', '4S', '5S', '6S', '7S', '8S', '9S', 'TS', 'JS', 'QS', 'KS',
    'AD', '2D', '3D', '4D', '5D', '6D', '7D', '8D', '9D', 'TD', 'JD', 'QD', 'KD',
    'AC', '2C', '3C', '4C', '5C', '6C', '7C', '8C', '9C', 'TC', 'JC', 'QC', 'KC',
    'AH', '2H', '3H', '4H', '5H', '6H', '7H', '8H', '9H', 'TH', 'JH', 'QH', 'KH'
];

// const players = {
//     "P1": {
//         isWinner: false,
//         stance: "waiting", // "discarding", "attacking" or "waiting"
//         attackValue: 0,
//         damageValue: 0,
//         cards: {
//             hand: ["2D", "3S", "TD", "5C", "8H", "5S", "9H"],
//             handCount: 7,
//             field: [],
//             shield: ["AS", "3S"],
//             tavern: 15,
//             cemetry: 11,
//             castle: 7,
//             jester: 2
//         }
//     },
//     "P2": initPlayerState(deck)
// }

const initGame = (room) => {
    room.gameStarted = true;
    room.gameState = {
        isGameOver: false,
        players: {
            "P1": initPlayerState(deck),
            "P2": initPlayerState(deck)
        }
    }
    // Get the players IDs in the room
    const playerIDs = Object.keys(room.gameState.players);
    // Pick a random player index
    const randomPlayerIndex = Math.floor(Math.random() * playerIDs.length);
    // Get the player with the random index
    const attackingPlayerID = playerIDs[randomPlayerIndex];
    // Assign an attacking stance to the player with the random index
    room.gameState.players[attackingPlayerID].stance = "attacking";
}

const initPlayerState = (deck) => {
    // Shuffle player deck
    const shuffledDeck =  shuffleDeck(deck);
    // Draw 7 cards from the shuffled deck
    const hand = shuffledDeck.slice(-7);
    // Put the remaining cards in the tavern
    const tavern = shuffledDeck.splice(-7);

    return {
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
    }
}

module.exports = { initGame }
