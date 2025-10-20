
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
	var combatChoices = card.or.filter(function(choice) { return Boolean(choice.combat); });
	if (combatChoices.length > 0) {
		return combatChoices[0];
	} else {
		return card.or[Math.floor(Math.random()*2)];	
	}
}

function buyScore(a) {
	var score = a.combat + (a.allyAbilities && a.allyAbilities.combat || 0) + (a.scrapAbilities && a.scrapAbilities.combat || 0);
	if (a.faction == "The Blob") { score+=15; }
	if (a.faction == "Machine Cult") { score+=5; }
	return score;
}

function buyStrategy(toBuy)
{
	var toBuyCombatSorted = toBuy.sort(function(a, b) {
		return buyScore(a) - buyScore(b); 
	});
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

function scrapStrategy(card, p, notp)
{
    if (p.authority < 40 && !card.combat && (!card.allyAbilities || !card.allyAbilities.combat)) {
        return card;
    } else if (card.scrapAbilities.combat && (notp.authority < 45)) {
    	return card;
    }
    return undefined;
}

function scrapCardStrategy(p) {
	var toDiscard = p.discard.filter(function(card) { return card.name == "Scout"; });
	return toDiscard[0];
}

function destroyBaseStrategy(opponentBases) {
	// Prioritize destroying outposts first (they block attacks)
	var outposts = opponentBases.filter(function(b) { return b.hasOwnProperty('outpost'); });
	if (outposts.length > 0) {
		// Sort by health and destroy the strongest outpost first
		return outposts.sort(function(a, b) { return b.outpost - a.outpost; })[0];
	}
	// Otherwise destroy any base
	return opponentBases[0];
}

function discardThenDrawStrategy(hand, count) {
	// Discard cards with lowest combat value first
	var sorted = hand.slice().sort(function(a, b) {
		var aCombat = a.combat || 0;
		var bCombat = b.combat || 0;
		return aCombat - bCombat;
	});
	return sorted.slice(0, count);
}