
function getTradeCards() {

	var tradeCards = [];
	var add = function (n, card) { for (var i=0; i<n; i++) { tradeCards.push(card); }};

	//Star Empire
	add(3, {name:'Imperial Fighter', faction:'Star Empire', cost:1, combat:2, opponentDiscard:1, allyAbilities:{combat:2}});
	add(2, {name:'Corvette', faction:'Star Empire', cost:2, combat:1, drawCard:1, allyAbilities:{combat:2}});
	add(3, {name:'Imperial Frigate', faction:'Star Empire', cost:3, combat:4, opponentDiscard:1, allyAbilities:{combat:2}, scrapAbilities:{ drawCard:1 }});
	add(3, {name:'Survey Ship', faction:'Star Empire', cost:3, trade:1, drawCard:1, scrapAbilities:{opponentDiscard:1}});
	add(1, {name:'Battlecruiser', faction:'Star Empire', cost:6, combat:5, drawCard:1, allyAbilities:{opponentDiscard:1}, scrapAbilities:{drawCard:1, destroyBase:1}});
	add(1, {name:'Dreadnaught', faction:'Star Empire', cost:7, combat:7, drawCard:1, scrapAbilities:{combat:5}});
	add(2, {name:'Recycling Station', faction:'Star Empire', cost:4, or:[{trade:1}, {discardThenDraw:2}], outpost:4});
	add(2, {name:'Space Station', faction:'Star Empire', cost:4, combat:2, allyAbilities:{combat:2}, scrapAbilities:{trade:4}, outpost:4});
	add(1, {name:'War World', faction:'Star Empire', cost:5, combat:3, allyAbilities:{combat:4}, outpost:4});
	add(1, {name:'Royal Redoubt', faction:'Star Empire', cost:6, combat:3, allyAbilities:{opponentDiscard:1}, outpost:6});
	add(1, {name:'Fleet HQ', faction:'Star Empire', cost:8, allShipsCombat:1, base:8});

	// Trade Federation
	add(3, {name:'Federation Shuttle', faction:'Trade Federation', cost:1, trade:2, allyAbilities:{authority:4}});
	add(3, {name:'Cutter', faction:'Trade Federation', cost:2, authority:4, trade:2, allyAbilities:{combat:4}});
	add(2, {name:'Embassy Yacht', faction:'Trade Federation', cost:3, trade:2, authority:3, ifAtLeastTwoBases:{drawCard:2}});
	add(2, {name:'Freighter', faction:'Trade Federation', cost:4, trade:4, allyAbilities:{nextShipToTop:1}});
	add(1, {name:'Trade Escort', faction:'Trade Federation', cost:5, authority:4, combat:4, allyAbilities:{drawCard:1}});
	add(1, {name:'Flagship', faction:'Trade Federation', cost:6, combat:5, drawCard:1, allyAbilities:{authority:5}});
	add(1, {name:'Command Ship', faction:'Trade Federation', cost:8, authority:4, combat:5, drawCard:2, allyAbilities:{destroyBase:1}});
	add(2, {name:'Trading Post', faction:'Trade Federation', cost:3, or:[{authority:1}, {trade:1}], scrapAbilities:{combat:3}, outpost:4});
	add(2, {name:'Barter World', faction:'Trade Federation', cost:4, or:[{authority:2}, {trade:2}], scrapAbilities:{combat:5}, base:4});
	add(1, {name:'Defense Center', faction:'Trade Federation', cost:5, or:[{authority:3}, {combat:2}], allyAbilities:{combat:2}, outpost:5});
	add(1, {name:'Port of Call', faction:'Trade Federation', cost:6, trade:3, scrapAbilities:{drawCard:1, destroyBase:1}, outpost:6});
	add(1, {name:'Central Office', faction:'Trade Federation', cost:7, trade:2, nextShipToTop:1, allyAbilities:{drawCard:1}, base:6});

	// The Blob
	add(3, {name:'Blob Fighter', faction:'The Blob', cost:1, combat:3, allyAbilities:{drawCard:1}});
	add(2, {name:'Battle Pod', faction:'The Blob', cost:2, combat:4, scrapTradeRow:1, allyAbilities:{combat:2}});
	add(3, {name:'Trade Pod', faction:'The Blob', cost:2, trade:3, allyAbilities:{combat:2}});
	add(2, {name:'Ram', faction:'The Blob', cost:3, combat:5, allyAbilities:{combat:2}, scrapAbilities:{trade:3}});
	add(2, {name:'Blob Destroyer', faction:'The Blob', cost:4, combat:6, allyAbilities:{destroyBase:1, scrapTradeRow:1}});
	add(1, {name:'Battle Blob', faction:'The Blob', cost:6 , combat:8, allyAbilities:{drawCard:1}, scrapAbilities:{combat:4}});
	add(1, {name:'Blob Carrier', faction:'The Blob', cost:6, combat:7, allyAbilities:{nextShipToTop:1, nextShipNoCost:1}});
	add(1, {name:'Mothership', faction:'The Blob', cost:7, combat:6, drawCard:1, allyAbilities:{drawCard:1}});
	add(3, {name:'Blob Wheel', faction:'The Blob', cost:3, combat:1, scrapAbilities:{trade:3}, base:5});
	add(1, {name:'The Hive', faction:'The Blob', cost:5, combat:3, allyAbilities:{drawCard:1}, base:5});
	add(1, {name:'Blob World', faction:'The Blob', cost:8, or:[{combat:5}, {drawCardForEachBlob:1}], base:7});

	// Machine Cult
	add(3, {name:'Trade Bot', faction:'Machine Cult', cost:1, trade:1, scrapCard:1, allyAbilities:{combat:2}});
	add(3, {name:'Missile Bot', faction:'Machine Cult', cost:2, combat:2, scrapCard:1, allyAbilities:{combat:2}});
	add(3, {name:'Supply Bot', faction:'Machine Cult', cost:3, trade:2, scrapCard:1, allyAbilities:{combat:2}});
	add(2, {name:'Patrol Mech', faction:'Machine Cult', cost:4, or:[{trade:3}, {combat:5}], allyAbilities:{scrapCard:1}});
	add(1, {name:'Stealth Needle', faction:'Machine Cult', cost:4, copyShip:1});
	add(1, {name:'Battle Mech', faction:'Machine Cult', cost:5, combat:4, scrapCard:1, allyAbilities:{drawCard:1}});
	add(1, {name:'Missile Mech', faction:'Machine Cult', cost:6, combat:6, destroyBase:1, allyAbilities:{drawCard:1}});
	add(2, {name:'Battle Station', faction:'Machine Cult', cost:3, scrapAbilities:{combat:5}, outpost:5});
	add(1, {name:'Mech World', faction:'Machine Cult', cost:5, allyAll:1, outpost:6});
	add(1, {name:'Junkyard', faction:'Machine Cult', cost:6, scrapCard:1, outpost:5});
	add(1, {name:'Machine Base', faction:'Machine Cult', cost:7, drawThenScrap:1, outpost:6});
	add(1, {name:'Brain World', faction:'Machine Cult', cost:8, scrapThenDraw:2, outpost:6});

	return tradeCards;
}


module.exports = {
	getTradeCards: getTradeCards
}
