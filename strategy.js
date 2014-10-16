module.exports = {
	buyStrategy: buyStrategy,
	orStrategy: orStrategy,
}

function orStrategy(card)
{
	return card.or[0];
}

function buyStrategy(toBuy)
{
	return toBuy[0];
}