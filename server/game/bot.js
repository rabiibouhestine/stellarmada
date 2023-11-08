const botSelection = (gamestate) => {
    if (gamestate.turn.stance === 'attacking') {
        return [gamestate.players['bot'].cards.hand[0]];
    } else {
        return gamestate.players['bot'].cards.hand.slice(1);
    }
}

module.exports = { botSelection }
