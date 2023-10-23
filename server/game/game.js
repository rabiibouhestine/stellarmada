const cardsMapping = require('./cardsDict.json');
const { shuffleDeck, clearAttack, makeUnknownCardsArray } = require('./utils.js');

const deck = [
    'AS', '2S', '3S', '4S', '5S', '6S', '7S', '8S', '9S', 'TS', 'JS', 'QS', 'KS',
    'AD', '2D', '3D', '4D', '5D', '6D', '7D', '8D', '9D', 'TD', 'JD', 'QD', 'KD',
    'AC', '2C', '3C', '4C', '5C', '6C', '7C', '8C', '9C', 'TC', 'JC', 'QC', 'KC',
    'AH', '2H', '3H', '4H', '5H', '6H', '7H', '8H', '9H', 'TH', 'JH', 'QH', 'KH'
];

const handMax = 7;
const outpostCapacity = 3;

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
        cards: {
            hand: hand,
            handCount: handMax,
            frontline: [],
            rearguard: [],
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
        const playerCards = gamestate.players[playerID].cards;
        const playerHandSelection = playerSelection.hand;
        const playerRearguardSelection = playerSelection.rearguard;

        // If player hand selection does not make sense we exit
        if (playerHandSelection.some(card => !playerCards.hand.includes(card)))
            return;

        // If player rearguard selection does not make sense we exit
        if (playerRearguardSelection.some(card => !playerCards.rearguard.includes(card)))
            return;

        // Check selection suits and calculate selection value
        const hasClubs = playerHandSelection.some(card => cardsMapping[card].suit === "C") || playerRearguardSelection.some(card => cardsMapping[card].suit === "C");
        const hasSpades = playerHandSelection.some(card => cardsMapping[card].suit === "S") || playerRearguardSelection.some(card => cardsMapping[card].suit === "S");
        const hasHearts = playerHandSelection.some(card => cardsMapping[card].suit === "H") || playerRearguardSelection.some(card => cardsMapping[card].suit === "H");
        const hasDiamonds = playerHandSelection.some(card => cardsMapping[card].suit === "D") || playerRearguardSelection.some(card => cardsMapping[card].suit === "D");
        const playerHandSelectionSum = playerHandSelection.reduce((accumulator, card) => {
            return accumulator + cardsMapping[card].value;
        }, 0);
        const playerRearguardSelectionSum = playerRearguardSelection.reduce((accumulator, card) => {
            return accumulator + cardsMapping[card].value;
        }, 0);
        const playerSelectionSum = playerHandSelectionSum + playerRearguardSelectionSum;
        const playerSelectionValue = hasClubs? 2 * playerSelectionSum : playerSelectionSum;

        // Move selected cards from hand to frontline
        if (playerHandSelection.length > 0) {
            playerCards.hand = playerCards.hand.filter(card => !playerHandSelection.includes(card));
            playerCards.handCount = playerCards.hand.length;
            playerCards.frontline.push(...playerHandSelection);
    
            // Add move to game action
            gameAction.moves.push(
                {
                    playerID: playerID,
                    cardsNames: playerHandSelection,
                    location: "hand",
                    destination: "frontline"
                }
            );
        }

        // Move selected cards from rearguard to frontline
        if (playerRearguardSelection.length > 0) {
            playerCards.rearguard = playerCards.rearguard.filter(card => !playerRearguardSelection.includes(card));
            playerCards.frontline.push(...playerRearguardSelection);
    
            // Add move to game action
            gameAction.moves.push(
                {
                    playerID: playerID,
                    cardsNames: playerRearguardSelection,
                    location: "rearguard",
                    destination: "frontline"
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

        // If Spades in selection, move cards from tavern to rearguard
        if (hasSpades && playerCards.tavern.length !== 0) {
            const nCardsToDraw = Math.min(
                outpostCapacity - playerCards.rearguard.length,
                playerHandSelection.length + playerRearguardSelection.length,
                playerCards.tavern.length
            );
            if (nCardsToDraw > 0) {
                const cardsToDraw = playerCards.tavern.slice(-nCardsToDraw);
                playerCards.tavern.splice(-nCardsToDraw);
                playerCards.rearguard.push(...cardsToDraw);
    
                gameAction.moves.push(
                    {
                        playerID: playerID,
                        cardsNames: cardsToDraw,
                        location: "tavern",
                        destination: "rearguard"
                    }
                );
            }
        }

        // Update gameAction turn
        gameAction.turn = {
            playerID: secondPlayerID,
            stance: "discarding",
            damage: playerSelectionValue
        }

        // If enemy does not have enough to discard attack, player wins
        const secondPlayerHandValue = gamestate.players[secondPlayerID].cards.hand.reduce((accumulator, card) => {
            return accumulator + cardsMapping[card].value;
        }, 0);
        const secondPlayerRearguardValue = gamestate.players[secondPlayerID].cards.rearguard.reduce((accumulator, card) => {
            return accumulator + cardsMapping[card].value;
        }, 0);
        const secondPlayerMaxDiscardValue = secondPlayerHandValue + secondPlayerRearguardValue;

        if (secondPlayerMaxDiscardValue < playerSelectionValue) {
            gameAction.isGameOver = true;
            gameAction.winnerID = playerID;
        }
    }

    // If player is discarding
    if (gamestate.turn.stance === "discarding") {
        const playerCards = gamestate.players[playerID].cards
        const playerHandSelection = playerSelection.hand;
        const playerRearguardSelection = playerSelection.rearguard;

        // If player selection does not make sense we exit
        const isHandSelectionScam = playerHandSelection.some(card => !playerCards.hand.includes(card));
        const isRearguardSelectionScam = playerRearguardSelection.some(card => !playerCards.rearguard.includes(card));
        const handSelectionDamage = playerHandSelection.reduce((accumulator, card) => {
            return accumulator + cardsMapping[card].value;
        }, 0);
        const rearguardSelectionDamage = playerRearguardSelection.reduce((accumulator, card) => {
            return accumulator + cardsMapping[card].value;
        }, 0);
        const selectionDamage = handSelectionDamage + rearguardSelectionDamage;
        const isDamageEnough = selectionDamage >= gamestate.turn.damage;
        if (isHandSelectionScam || isRearguardSelectionScam || !isDamageEnough)
            return;

        // Discard Royals from Rearguard
        const rearguardHasRoyals = playerRearguardSelection.some(card => cardsMapping[card].isCastle === true);
        if (rearguardHasRoyals) {
            const rearguardSelectedRoyals = playerRearguardSelection.filter(card => cardsMapping[card].isCastle === true);
            playerCards.rearguard = playerCards.rearguard.filter(card => !rearguardSelectedRoyals.includes(card));
            playerCards.castle.push(...rearguardSelectedRoyals);

            gameAction.moves.push(
                {
                    playerID: playerID,
                    cardsNames: rearguardSelectedRoyals,
                    location: "rearguard",
                    destination: "castle"
                }
            );
        }

        // Discard non Royals from Rearguard
        const rearguardHasStandards = playerRearguardSelection.some(card => cardsMapping[card].isCastle === false);
        if (rearguardHasStandards) {
            const rearguardSelectedStandards = playerRearguardSelection.filter(card => cardsMapping[card].isCastle === false);
            playerCards.rearguard = playerCards.rearguard.filter(card => !rearguardSelectedStandards.includes(card));
            playerCards.graveyard.push(...rearguardSelectedStandards);

            gameAction.moves.push(
                {
                    playerID: playerID,
                    cardsNames: rearguardSelectedStandards,
                    location: "rearguard",
                    destination: "graveyard"
                }
            );
        }

        // Discard Royals from Hand
        const handHasRoyals = playerHandSelection.some(card => cardsMapping[card].isCastle === true);
        if (handHasRoyals) {
            const handSelectedRoyals = playerHandSelection.filter(card => cardsMapping[card].isCastle === true);
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
        const handHasStandards = playerHandSelection.some(card => cardsMapping[card].isCastle === false);
        if (handHasStandards) {
            const handSelectedStandards = playerHandSelection.filter(card => cardsMapping[card].isCastle === false);
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

        // If empty fleet (hand and rearguard both empty after discard), enemy wins
        if (playerCards.hand.length === 0 && playerCards.rearguard.length === 0) {
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
