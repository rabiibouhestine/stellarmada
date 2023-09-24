const cardsMapping = require('./cardsDict.json');

const deck = [
    'AS', '2S', '3S', '4S', '5S', '6S', '7S', '8S', '9S', 'TS', 'JS', 'QS', 'KS',
    'AD', '2D', '3D', '4D', '5D', '6D', '7D', '8D', '9D', 'TD', 'JD', 'QD', 'KD',
    'AC', '2C', '3C', '4C', '5C', '6C', '7C', '8C', '9C', 'TC', 'JC', 'QC', 'KC',
    'AH', '2H', '3H', '4H', '5H', '6H', '7H', '8H', '9H', 'TH', 'JH', 'QH', 'KH'
];

const initializeGame = (room) => {
    room.gameStarted = true;
    room.gameState = {
        isGameOver: false,
        players: {
            "P1": {
                isWinner: false,
                stance: "attacking", // "discarding", "attacking" or "waiting"
                attackValue: 0,
                damageValue: 13,
                cards: {
                    hand: ["2D", "AS", "AD", "5C", "8H", "5S", "2H"],
                    handCount: 7,
                    field: ["AC", "6S"],
                    shield: ["4S", "7S"],
                    tavern: 25,
                    cemetry: 7,
                    castle: 4,
                    jester: 1
                }
            },
            "P2": {
                isWinner: false,
                stance: "waiting", // "discarding", "attacking" or "waiting"
                attackValue: 13,
                damageValue: 0,
                cards: {
                    hand: ["2D", "3S", "TD", "5C", "8H", "5S", "9H"],
                    handCount: 7,
                    field: [],
                    shield: ["AS", "3S"],
                    tavern: 15,
                    cemetry: 11,
                    castle: 7,
                    jester: 2
                }
            }
        }
    }
}

module.exports = { initializeGame }
