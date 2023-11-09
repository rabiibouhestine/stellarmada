const cardsMapping = require('./cardsDict.json');
const { shuffleArray, clearAttack, makeUnknownCardsArray } = require('./utils.js');

const handMax = 8;

const initGameState = (room) => {

    // Define gameState
    const gameState = {
        isGameOver: false,
        winnerID: "",
        turn: {
            playerID: "",
            stance: "attacking", // "discarding", "attacking" or "waiting"
            damage: 0 // only set when state discarding
        },
        players: {},
        logs: []
    };

    // Create players states
    const playersIDs = Object.keys(room.players);
    for (const id of playersIDs) {
        gameState.players[id] = initPlayerState();
    }

    if (room.isBotRoom) {
        gameState.turn.playerID = playersIDs[0] === 'bot' ? playersIDs[1] : playersIDs[0];
    } else {
        // Pick a random player index
        const randomPlayerIndex = Math.floor(Math.random() * playersIDs.length);
        // Get the player with the random index
        const attackingPlayerID = playersIDs[randomPlayerIndex];
        // Give the turn to the player
        gameState.turn.playerID = attackingPlayerID;
    }

    return gameState;
}

const initPlayerState = () => {
    // Define a standard playing cards deck split into diamonds and non diamonds
    const schPile = [
        'AS', '2S', '3S', '4S', '5S', '6S', '7S', '8S', '9S', 'TS', 'JS', 'QS', 'KS',
        'AC', '2C', '3C', '4C', '5C', '6C', '7C', '8C', '9C', 'TC', 'JC', 'QC', 'KC',
        'AH', '2H', '3H', '4H', '5H', '6H', '7H', '8H', '9H', 'TH', 'JH', 'QH', 'KH'
    ];
    const dPile = [
        'AD', '2D', '3D', '4D', '5D', '6D', '7D', '8D', '9D', 'TD', 'JD', 'QD', 'KD'
    ];

    // Shuffle diamonds pile and non diamonds pile separately
    const schPileShuffled = shuffleArray(schPile);
    const dPileShuffled = shuffleArray(dPile);

    // Define drawpile and hand
    const drawPile = [];
    const hand = [];

    // Draw all cards from shuffled diamonds pile and shuffled non diamnds pile into the draw pile
    while (dPileShuffled.length > 0) {
        drawPile.push(dPileShuffled.pop()); // Take one card from dPileShuffled
        drawPile.push(...schPileShuffled.splice(-3)); // Take three cards from schPileShuffled
    }

    // Draw handMax cards from the draw pile to hand
    hand.push(...drawPile.splice(-handMax).reverse());

    // Define playerState
    const playerState = {
        cards: {
            hand: hand,
            battleField: [],
            drawPile: drawPile,
            discardPile: [],
            destroyPile: []
        }
    };

    return playerState;
}

const handleActionRequest = (playerID, playerSelection, room) => {

    // get gamestate
    const gamestate = room.gameState;

    // If not player turn exit
    if (playerID !== gamestate.turn.playerID)
        return;

    // Get the players ids
    const playersIDS = Object.keys(gamestate.players);

    // Get the enemy id
    const enemyID = playerID === playersIDS[0] ? playersIDS[1] : playersIDS[0];

    // Initialise game action
    const gameAction = {
        turn: gamestate.turn,
        moves: [],
        logs: []
    };

    // If player is attacking
    if (gamestate.turn.stance === "attacking") {

        // update timers
        room.players[enemyID].timer.start();
        room.players[playerID].timer.stop();

        // Player cards
        const playerCards = gamestate.players[playerID].cards;

        // If player hand selection does not make sense we exit
        if (playerSelection.some(card => !playerCards.hand.includes(card)))
            return;

        // Check selection suits and calculate selection offensive power
        const hasClubs = playerSelection.some(card => cardsMapping[card].suit === "C");
        const hasSpades = playerSelection.some(card => cardsMapping[card].suit === "S");
        const hasHearts = playerSelection.some(card => cardsMapping[card].suit === "H");
        const hasDiamonds = playerSelection.some(card => cardsMapping[card].suit === "D");
        const playerSelectionSum = playerSelection.reduce((accumulator, card) => {
            return accumulator + cardsMapping[card].offensivePower;
        }, 0);
        const selectionOffensivePower = hasClubs? 2 * playerSelectionSum : playerSelectionSum;

        // Move selected cards from hand to battleField
        if (playerSelection.length > 0) {
            playerCards.hand = playerCards.hand.filter(card => !playerSelection.includes(card));
            playerCards.battleField.push(...playerSelection);
    
            // Add move to game action
            gameAction.moves.push(
                {
                    playerID: playerID,
                    cardsNames: playerSelection,
                    location: "hand",
                    destination: "battleField"
                }
            );

            // Add attack to logs
            gamestate.logs.push(
                {
                    playerID: playerID,
                    cardsNames: playerSelection,
                    move: "attack"
                }
            );
            gameAction.logs.push(
                {
                    playerID: playerID,
                    cardsNames: playerSelection,
                    move: "attack"
                }
            );
        }

        // If Spades in selection, move enemy cards from drawPile to discardPile
        const enemyCards = gamestate.players[enemyID].cards;
        if (hasSpades && enemyCards.drawPile.length !== 0) {
            // pick playerSelectionSum from top of drawPile
            const discardedCards = enemyCards.drawPile.slice(-playerSelectionSum);
            // move them to discardPile
            enemyCards.drawPile.splice(-playerSelectionSum);
            enemyCards.discardPile.push(...discardedCards);

            gameAction.moves.push(
                {
                    playerID: enemyID,
                    cardsNames: makeUnknownCardsArray(discardedCards),
                    location: "drawPile",
                    destination: "discardPile"
                }
            );
        }

        // If Hearts in selection, move cards from discardPile to drawPile
        if (hasHearts && playerCards.discardPile.length !== 0) {
            // shuffle discardPile
            playerCards.discardPile = shuffleArray(playerCards.discardPile);
            // pick playerSelectionSum from top of discardPile
            const revivedCards = playerCards.discardPile.slice(-playerSelectionSum);
            // move them to bottom of drawPile
            playerCards.discardPile.splice(-playerSelectionSum);
            playerCards.drawPile.unshift(...revivedCards);

            gameAction.moves.push(
                {
                    playerID: playerID,
                    cardsNames: makeUnknownCardsArray(revivedCards),
                    location: "discardPile",
                    destination: "drawPile"
                }
            );
        }

        // If Diamonds in selection, move cards from drawPile to hand
        if (hasDiamonds && playerCards.drawPile.length !== 0) {
            const nCardsMissingFromHand = handMax - playerCards.hand.length;
            const nCardsToDraw = Math.min(playerSelectionSum, nCardsMissingFromHand);
            const cardsToDraw = playerCards.drawPile.slice(-nCardsToDraw);
            playerCards.drawPile.splice(-nCardsToDraw);
            playerCards.hand.push(...cardsToDraw.reverse());

            gameAction.moves.push(
                {
                    playerID: playerID,
                    cardsNames: cardsToDraw,
                    location: "drawPile",
                    destination: "hand"
                }
            );
        }

        // Update gameAction turn
        gameAction.turn = {
            playerID: enemyID,
            stance: "discarding",
            damage: selectionOffensivePower
        }

        // If enemy does not have enough to discard attack, player wins
        const enemyDefensivePower = gamestate.players[enemyID].cards.hand.reduce((accumulator, card) => {
            return accumulator + cardsMapping[card].defensivePower;
        }, 0);

        if (enemyDefensivePower < selectionOffensivePower) {
            gamestate.isGameOver = true;
            gamestate.winnerID = playerID;
        }
    }

    // If player is discarding
    if (gamestate.turn.stance === "discarding") {

        // get player cards
        const playerCards = gamestate.players[playerID].cards

        // If player selection does not make sense we exit
        const isHandSelectionScam = playerSelection.some(card => !playerCards.hand.includes(card));
        const selectionDefensivePower = playerSelection.reduce((accumulator, card) => {
            return accumulator + cardsMapping[card].defensivePower;
        }, 0);
        const isDamageEnough = selectionDefensivePower >= gamestate.turn.damage;
        if (isHandSelectionScam || !isDamageEnough)
            return;


        // Discard selection from Hand
        playerCards.hand = playerCards.hand.filter(card => !playerSelection.includes(card));
        playerCards.destroyPile.push(...playerSelection);

        gameAction.moves.push(
            {
                playerID: playerID,
                cardsNames: playerSelection,
                location: "hand",
                destination: "discardPile"
            }
        );


        // Add counter to logs
        gamestate.logs.push(
            {
                playerID: playerID,
                cardsNames: playerSelection,
                move: "counter"
            }
        );
        gameAction.logs.push(
            {
                playerID: playerID,
                cardsNames: playerSelection,
                move: "counter"
            }
        );

        // Clear enemy attack
        const clearAttackMoves = clearAttack(enemyID, gamestate);
        gameAction.moves.push(...clearAttackMoves);

        // Update gameAction turn
        gameAction.turn = {
            playerID: playerID,
            stance: "attacking",
            damage: 0
        }

        // If hand empty after discard, enemy wins
        if (playerCards.hand.length === 0) {
            gamestate.isGameOver = true;
            gamestate.winnerID = enemyID;
        } else if (gamestate.players[enemyID].cards.hand.length === 0) {
        // If successful discard and enemy has no cards, player wins
            gamestate.isGameOver = true;
            gamestate.winnerID = playerID;
        }
    }

    // Update game state turn
    gamestate.turn = gameAction.turn;

    return gameAction;
}

module.exports = { initGameState, handleActionRequest }
