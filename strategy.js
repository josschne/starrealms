module.exports = {
	buyStrategy: buyStrategy,
	orStrategy: orStrategy,
	discardingStrategy: discardingStrategy,
}

function orStrategy(card)
{
	return card.or[0];
}

function buyStrategy(toBuy)
{
	return toBuy[0];
}

function discardingStrategy(p)
{
	moveCard(p.hand[0], p.hand, p.discard);
}