var Shuffle = require('shuffle');

Array.prototype.add = function (n, card) { for (var i=0; i<n; i++) { this.push(card); }};


// Basic Cards
// (10) Explorer
// (16) Scout
// (4) Viper

var tradeCards = [];
var p1 = {};
var p2 = {};

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

function initPlayerDeck() {
	var deck = [];
	deck.add(8, {name:'Scout'});
	deck.add(2, {name:'Viper'});
	return Shuffle.shuffle({deck: deck});
}

var tradeDeck = Shuffle.shuffle({deck: tradeCards});
var tradeRow = tradeDeck.draw(5);

var p1hand = p1.deck.draw(5);
var p2hand = p2.deck.draw(5);

console.log("P1: ", p1hand);
console.log("P2: ", p2hand);
console.log("TR: ", tradeRow);