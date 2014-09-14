var Shuffle = require('shuffle');

Array.prototype.add = function (n, card) { for (var i=0; i<n; i++) { this.push(card); }};


// Basic Cards
// (10) Explorer
// (16) Scout
// (4) Viper

var tradeCards = [];
var p1 = {name:"P1", discard:[], combat:0};
var p2 = {name:"P2", discard:[], combat:0};

//Star Empire
tradeCards.add(3, {name:'Imperial Fighter', faction:'Star Empire'});
tradeCards.add(2, {name:'Corvette', faction:'Star Empire'});
tradeCards.add(3, {name:'Imperial Frigate', faction:'Star Empire'});
tradeCards.add(3, {name:'Survey Ship', faction:'Star Empire'});
tradeCards.add(1, {name:'Battlecruiser', faction:'Star Empire'});
tradeCards.add(1, {name:'Dreadnaught', faction:'Star Empire'});
tradeCards.add(2, {name:'Recycling Station', faction:'Star Empire'});
tradeCards.add(2, {name:'Space Station', faction:'Star Empire'});
tradeCards.add(1, {name:'War World', faction:'Star Empire'});
tradeCards.add(1, {name:'Royal Redoubt', faction:'Star Empire'});
tradeCards.add(1, {name:'Fleet HQ', faction:'Star Empire'});

// Trade Federation
tradeCards.add(3, {name:'Federation Shuttle', faction:'Trade Federation'});
tradeCards.add(3, {name:'Cutter', faction:'Trade Federation'});
tradeCards.add(2, {name:'Embassy Yacht', faction:'Trade Federation'});
tradeCards.add(2, {name:'Freighter', faction:'Trade Federation'});
tradeCards.add(1, {name:'Trade Escort', faction:'Trade Federation'});
tradeCards.add(1, {name:'Flagship', faction:'Trade Federation'});
tradeCards.add(1, {name:'Command Ship', faction:'Trade Federation'});
tradeCards.add(2, {name:'Trading Post', faction:'Trade Federation'});
tradeCards.add(2, {name:'Barter World', faction:'Trade Federation'});
tradeCards.add(1, {name:'Defense Center', faction:'Trade Federation'});
tradeCards.add(1, {name:'Port of Call', faction:'Trade Federation'});
tradeCards.add(1, {name:'Central Office', faction:'Trade Federation'});

// The Blob
tradeCards.add(3, {name:'Blob Fighter', faction:'The Blob'});
tradeCards.add(2, {name:'Battle Pod', faction:'The Blob'});
tradeCards.add(3, {name:'Trade Pod', faction:'The Blob'});
tradeCards.add(2, {name:'Ram', faction:'The Blob'});
tradeCards.add(2, {name:'Blob Destroyer', faction:'The Blob'});
tradeCards.add(1, {name:'Battle Blob', faction:'The Blob'});
tradeCards.add(1, {name:'Blob Carrier', faction:'The Blob'});
tradeCards.add(1, {name:'Mothership', faction:'The Blob'});
tradeCards.add(3, {name:'Blob Wheel', faction:'The Blob'});
tradeCards.add(1, {name:'The Hive', faction:'The Blob'});
tradeCards.add(1, {name:'Blob World', faction:'The Blob'});

// Machine Cult
tradeCards.add(3, {name:'Trade Bot', faction:'Machine Cult'});
tradeCards.add(3, {name:'Missile Bot', faction:'Machine Cult'});
tradeCards.add(3, {name:'Supply Bot', faction:'Machine Cult'});
tradeCards.add(2, {name:'Patrol Mech', faction:'Machine Cult'});
tradeCards.add(1, {name:'Stealth Needle', faction:'Machine Cult'});
tradeCards.add(1, {name:'Battle Mech', faction:'Machine Cult'});
tradeCards.add(1, {name:'Missile Mech', faction:'Machine Cult'});
tradeCards.add(2, {name:'Battle Station', faction:'Machine Cult'});
tradeCards.add(1, {name:'Mech World', faction:'Machine Cult'});
tradeCards.add(1, {name:'Junkyard', faction:'Machine Cult'});
tradeCards.add(1, {name:'Machine Base', faction:'Machine Cult'});
tradeCards.add(1, {name:'Brain World', faction:'Machine Cult'});

p1.deck = initPlayerDeck();
p2.deck = initPlayerDeck();
p1.authority = 50;
p2.authority = 50;

function initPlayerDeck() {
	var deck = [];
	deck.add(8, {name:'Scout', trade:1});
	deck.add(2, {name:'Viper', combat:1});
	return Shuffle.shuffle({deck: deck});
}

var tradeDeck = Shuffle.shuffle({deck: tradeCards});
var tradeRow = tradeDeck.draw(5);


p1.hand = p1.deck.draw(3);
p2.hand = p2.deck.draw(5);

function play(p, notp) {
	console.log(p.name, "'s turn!");

	//Main
	p.hand.forEach(function(card) {
		if (card.trade) { p.trade += card.trade; }
		if (card.authority) { p.authority += card.authority; }
		if (card.combat) {p.combat += card.combat; }
	});
	console.log(p.hand.map(function(card) { return card.name; }));
	console.log("T:", p.trade, "A:", p.authority, "C:", p.combat);
	//Main Combat
	if (p.combat) {
		notp.authority -= p.combat;
		console.log(p.name, " attacks ", notp.name, " for ", p.combat, " authority.");
		p.combat = 0;
	}
	//Main Trade
	p.trade = 0;
	//Discard
	p.discard = p.discard.concat(p.hand);
	//Draw
	p.hand = p.deck.draw(Math.min(5, p.deck.cards.length)) || [];
	if (p.hand.length < 5)
	{
		console.log("Reshuffling ", p.name);
		p.deck.putOnTopOfDeck(p.discard);
		p.discard = [];
		p.deck.shuffle();
		p.hand = p.hand.concat(p.deck.draw(5-p.hand.length));
	}
}

var turnlimit = 3;
var turns =0;
while(p1.authority > 0 && p2.authority > 0) // && turns < turnlimit)
{
	play(p1, p2);
	if (p2.authority <=0) {
		console.log("P1 wins!");
		break;
	}
	play(p2, p1);
	if (p1.authority <= 0) {
		console.log("P2 wins!");
		break;
	}
	turns++;
}

console.log("Final score - P1:", p1.authority, " P2:", p2.authority);

//console.log("TR: ", tradeRow);