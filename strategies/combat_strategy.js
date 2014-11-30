
module.exports = {
	buyStrategy: buyStrategy,
	orStrategy: orStrategy,
	copyShipStrategy: copyShipStrategy,
    scrapStrategy: scrapStrategy,
    scrapCardStrategy: scrapCardStrategy,
}

function orStrategy(card)
{
	var combatChoices = card.or.filter(function(choice) { return choice.combat; });
	if (combatChoices) {
		return combatChoices[0];
	} else {
		return card.or[0];	
	}	
}

function buyStrategy(toBuy)
{
	var toBuyCombatSorted = toBuy.sort(function(a, b) { return a.combat-b.combat; });
	return toBuyCombatSorted[0];
}

function copyShipStrategy(inPlayShips)
{
	var combatCards = inPlayShips.filter(function(c){return c.combat;}).sort(function(a,b){return a.combat-b.combat;});
	if (combatCards) {
		return combatCards[0];
	} else {
		return inPlayShips[0];
	}
}

function scrapStrategy(card)
{
    if (!card.combat) {
        return card;
    } else if (card.scrapAbilities.combat) {
    	return card;
    }
    return undefined;
}

function scrapCardStrategy(p) {
	var toDiscard = p.discard.filter(function(card) { return card.name == "Scout"; });
	return toDiscard[0];
}