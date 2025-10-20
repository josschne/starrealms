
module.exports = {
	buyStrategy: buyStrategy,
	orStrategy: orStrategy,
	copyShipStrategy: copyShipStrategy,
    scrapStrategy: scrapStrategy,
    scrapCardStrategy: scrapCardStrategy,
    destroyBaseStrategy: destroyBaseStrategy,
    discardThenDrawStrategy: discardThenDrawStrategy,
    scrapTradeRowStrategy: scrapTradeRowStrategy,
    drawThenScrapStrategy: drawThenScrapStrategy,
    scrapThenDrawStrategy: scrapThenDrawStrategy,
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
	// Discard the first 'count' cards from hand
	return hand.slice(0, count);
}

function scrapTradeRowStrategy(tradeRow) {
	// Scrap the first card
	return tradeRow[0];
}

function drawThenScrapStrategy(hand) {
	// Scrap the first card
	return hand[0];
}

function scrapThenDrawStrategy(hand, discard, maxCount) {
	// Scrap up to maxCount cards from discard first (prefer Vipers/Scouts)
	var vipers = discard.filter(function(c) { return c.name === "Viper"; });
	var scouts = discard.filter(function(c) { return c.name === "Scout"; });
	var toScrap = vipers.concat(scouts).slice(0, maxCount);

	// If we still have room, scrap from hand
	if (toScrap.length < maxCount) {
		var remaining = maxCount - toScrap.length;
		toScrap = toScrap.concat(hand.slice(0, remaining));
	}

	return toScrap;
}