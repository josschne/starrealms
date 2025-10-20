module.exports = {
	buyStrategy: buyStrategy,
	orStrategy: orStrategy,
	copyShipStrategy: copyShipStrategy,
    scrapStrategy: scrapStrategy,
    scrapCardStrategy: scrapCardStrategy,
    destroyBaseStrategy: destroyBaseStrategy,
    discardThenDrawStrategy: discardThenDrawStrategy,
}

function orStrategy(card)
{
	return card.or[0];
}

function buyStrategy(toBuy)
{
	return toBuy[0];
}

function copyShipStrategy(inPlayCards)
{
	return inPlayCards[0];
}

function scrapStrategy(card)
{
    if (Math.random() < 0.9) {
        return card;
    }
    return undefined;
}

function scrapCardStrategy(p) {
	var toDiscard = p.discard.filter(function(card) { return card.name == "Viper" || card.name == "Scout"; });
	return toDiscard[0];
}

function destroyBaseStrategy(opponentBases) {
	return opponentBases[0];
}

function discardThenDrawStrategy(hand, count) {
	return hand.slice(0, count);
}