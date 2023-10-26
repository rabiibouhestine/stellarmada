const cardsMapping = require('./cardsDict.json');
const { shuffleDeck, clearAttack, makeUnknownCardsArray } = require('./utils.js');

const deck = [
    'AS', '2S', '3S', '4S', '5S', '6S', '7S', '8S', '9S', 'TS', 'JS', 'QS', 'KS',
    'AD', '2D', '3D', '4D', '5D', '6D', '7D', '8D', '9D', 'TD', 'JD', 'QD', 'KD',
    'AC', '2C', '3C', '4C', '5C', '6C', '7C', '8C', '9C', 'TC', 'JC', 'QC', 'KC',
    'AH', '2H', '3H', '4H', '5H', '6H', '7H', '8H', '9H', 'TH', 'JH', 'QH', 'KH'
];

const handMax = 8;

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
    // Make a player deck
    const playerDeck = deck.slice();
    // Remove Ace of Diamonds from player deck
    const indexToRemove = playerDeck.indexOf("AD");
    playerDeck.splice(indexToRemove, 1);
    // Add the Ace of Diamonds to hand
    const hand = ["AD"];
    // Shuffle player deck
    const shuffledPlayerDeck =  shuffleDeck(playerDeck);
    // Draw handMax - 1 cards from the shuffled deck
    const cardsToDraw = shuffledPlayerDeck.splice(0, handMax - 1); 
    hand.push(...cardsToDraw);
    // Put the remaining cards in the tavern
    const tavern = shuffledPlayerDeck;

    // Define playerState
    const playerState = {
        timeLeft: 600000,
        turnStartTime: null,
        cards: {
            hand: hand,
            frontline: [],
            tavern: tavern,
            graveyard: [],
            castle: []
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
        moves: []
    };

    // If player is attacking
    if (gamestate.turn.stance === "attacking") {

        // Player cards
        const playerCards = gamestate.players[playerID].cards;

        // If player hand selection does not make sense we exit
        if (playerSelection.some(card => !playerCards.hand.includes(card)))
            return;

        // Check selection suits and calculate selection value
        const hasClubs = playerSelection.some(card => cardsMapping[card].suit === "C");
        const hasSpades = playerSelection.some(card => cardsMapping[card].suit === "S");
        const hasHearts = playerSelection.some(card => cardsMapping[card].suit === "H");
        const hasDiamonds = playerSelection.some(card => cardsMapping[card].suit === "D");
        const playerSelectionSum = playerSelection.reduce((accumulator, card) => {
            return accumulator + cardsMapping[card].value;
        }, 0);
        const playerSelectionValue = hasClubs? 2 * playerSelectionSum : playerSelectionSum;

        // Move selected cards from hand to frontline
        if (playerSelection.length > 0) {
            playerCards.hand = playerCards.hand.filter(card => !playerSelection.includes(card));
            playerCards.frontline.push(...playerSelection);
    
            // Add move to game action
            gameAction.moves.push(
                {
                    playerID: playerID,
                    cardsNames: playerSelection,
                    location: "hand",
                    destination: "frontline"
                }
            );
        }

        // If Spades in selection, move enemy cards from tavern to graveyard
        const enemyCards = gamestate.players[secondPlayerID].cards;
        if (hasSpades && enemyCards.tavern.length !== 0) {
            // pick playerSelection.length from top of enemy tavern
            const brokenCards = enemyCards.tavern.slice(-playerSelection.length);
            // move them to graveyard
            enemyCards.tavern.splice(-playerSelection.length);
            enemyCards.graveyard.push(...brokenCards);

            gameAction.moves.push(
                {
                    playerID: secondPlayerID,
                    cardsNames: makeUnknownCardsArray(brokenCards),
                    location: "tavern",
                    destination: "graveyard"
                }
            );
        }

        // If Hearts in selection, move cards from graveyard to tavern
        if (hasHearts && playerCards.graveyard.length !== 0) {
            // shuffle graveyard
            playerCards.graveyard = shuffleDeck(playerCards.graveyard);
            // pick playerSelectionSum from top of graveyard
            const revivedCards = playerCards.graveyard.slice(-playerSelectionSum);
            // move them to bottom of tavern
            playerCards.graveyard.splice(-playerSelectionSum);
            playerCards.tavern.unshift(...revivedCards);

            gameAction.moves.push(
                {
                    playerID: playerID,
                    cardsNames: makeUnknownCardsArray(revivedCards),
                    location: "graveyard",
                    destination: "tavern"
                }
            );
        }

        // If Diamonds in selection, move cards from tavern to hand
        if (hasDiamonds && playerCards.tavern.length !== 0) {
            const nCardsMissingFromHand = handMax - playerCards.hand.length;
            const nCardsToDraw = Math.min(playerSelectionSum, nCardsMissingFromHand);
            const cardsToDraw = playerCards.tavern.slice(-nCardsToDraw);
            playerCards.tavern.splice(-nCardsToDraw);
            playerCards.hand.push(...cardsToDraw);

            gameAction.moves.push(
                {
                    playerID: playerID,
                    cardsNames: cardsToDraw,
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

        // Get current time
        const currentDate = new Date();
        const currentTime = currentDate.getTime();

        // Update enemy turn start time
        gamestate.players[secondPlayerID].turnStartTime = currentTime;

        // Update player turn start time if first attack
        if (gamestate.players[playerID].turnStartTime === null) {
            gamestate.players[playerID].turnStartTime = currentTime;
        }

        // If player has no time left, enemy wins
        gamestate.players[playerID].timeLeft -= currentTime - gamestate.players[playerID].turnStartTime;
        if (gamestate.players[playerID].timeLeft < 0) {
            gameAction.isGameOver = true;
            gameAction.winnerID = secondPlayerID;
        }

        // If enemy does not have enough to discard attack, player wins
        const secondPlayerHandValue = gamestate.players[secondPlayerID].cards.hand.reduce((accumulator, card) => {
            return accumulator + cardsMapping[card].value;
        }, 0);

        if (secondPlayerHandValue < playerSelectionValue) {
            gameAction.isGameOver = true;
            gameAction.winnerID = playerID;
        }
    }

    // If player is discarding
    if (gamestate.turn.stance === "discarding") {
        const playerCards = gamestate.players[playerID].cards

        // If player selection does not make sense we exit
        const isHandSelectionScam = playerSelection.some(card => !playerCards.hand.includes(card));
        const selectionDamage = playerSelection.reduce((accumulator, card) => {
            return accumulator + cardsMapping[card].value;
        }, 0);
        const isDamageEnough = selectionDamage >= gamestate.turn.damage;
        if (isHandSelectionScam || !isDamageEnough)
            return;


        // Discard Royals from Hand
        const handHasRoyals = playerSelection.some(card => cardsMapping[card].isCastle === true);
        if (handHasRoyals) {
            const handSelectedRoyals = playerSelection.filter(card => cardsMapping[card].isCastle === true);
            playerCards.hand = playerCards.hand.filter(card => !handSelectedRoyals.includes(card));
            playerCards.castle.push(...handSelectedRoyals);

            gameAction.moves.push(
                {
                    playerID: playerID,
                    cardsNames: handSelectedRoyals,
                    location: "hand",
                    destination: "castle"
                }
            );
        }

        // Discard non Royals from Hand
        const handHasStandards = playerSelection.some(card => cardsMapping[card].isCastle === false);
        if (handHasStandards) {
            const handSelectedStandards = playerSelection.filter(card => cardsMapping[card].isCastle === false);
            playerCards.hand = playerCards.hand.filter(card => !handSelectedStandards.includes(card));
            playerCards.graveyard.push(...handSelectedStandards);

            gameAction.moves.push(
                {
                    playerID: playerID,
                    cardsNames: handSelectedStandards,
                    location: "hand",
                    destination: "graveyard"
                }
            );
        }

        // Clear second player attack
        const clearAttackMoves = clearAttack(secondPlayerID, gamestate);
        gameAction.moves.push(...clearAttackMoves);

        // Update gameAction turn
        gameAction.turn = {
            playerID: playerID,
            stance: "attacking",
            damage: 0
        }

        // If empty fleet (hand empty after discard), enemy wins
        if (playerCards.hand.length === 0) {
            gameAction.isGameOver = true;
            gameAction.winnerID = secondPlayerID;
        }
    }

    // Update game state
    gamestate.isGameOver = gameAction.isGameOver;
    gamestate.winnerID = gameAction.winnerID;
    gamestate.turn = gameAction.turn;

    return gameAction;
}

module.exports = { initGameState, handleActionRequest }
