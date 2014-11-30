var card = require('./card_utils');

module.exports = {
	buyStrategy: buyStrategy,
	orStrategy: orStrategy,
	copyShipStrategy: copyShipStrategy,
    scrapStrategy: scrapStrategy,
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
	return inPlayCards[0]
}

function scrapStrategy(card)
{
    if (Math.random() < 0.9) {
        return card;
    }
    return undefined;
}