var Shuffle = require('shuffle');

Array.prototype.add = function (n, card) { for (var i=0; i<n; i++) { this.push(card); }};

function initPlayer(name)
{
	return {name:name, discard:[], combat:0, deck:initPlayerDeck(), authority:50};
}

function initPlayerDeck() {
	var deck = [];
	deck.add(8, {name:'Scout', trade:1});
	deck.add(2, {name:'Viper', combat:1});
	return Shuffle.shuffle({deck: deck});
}

function play(p, notp) {
	//console.log(p.name, "'s turn!");

	//Main
	p.hand.forEach(function(card) {
		if (card.trade) { p.trade += card.trade; }
		if (card.authority) { p.authority += card.authority; }
		if (card.combat) {p.combat += card.combat; }
	});
	//console.log(p.hand.map(function(card) { return card.name; }));
	//console.log("T:", p.trade, "A:", p.authority, "C:", p.combat);
	//Main Combat
	if (p.combat) {
		notp.authority -= p.combat;
		//console.log(p.name, " attacks ", notp.name, " for ", p.combat, " authority.");
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
		//console.log("Reshuffling ", p.name);
		p.deck.putOnTopOfDeck(p.discard);
		p.discard = [];
		p.deck.shuffle();
		p.hand = p.hand.concat(p.deck.draw(5-p.hand.length));
	}
}



function runGame() 
{
	//Initializations
	var p1 = initPlayer("P1");
	var p2 = initPlayer("P2");
	var tradeDeck = Shuffle.shuffle({deck: require('./tradeCards.js').getTradeCards()});

	//Begin Game
	p1.hand = p1.deck.draw(3);
	p2.hand = p2.deck.draw(5);
	var tradeRow = tradeDeck.draw(5);

	while(p1.authority > 0 && p2.authority > 0)
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
	}

	console.log("Final score - P1:", p1.authority, " P2:", p2.authority);
	return [p1.authority, p2.authority];
}

var simulationCount = 10000;
var winCount = [0, 0];
for (var s=0; s<simulationCount; s++) {
	var result = runGame();
	if (result[0] > result[1]) {
		winCount[0]++;
	}
	else 
	{
		winCount[1]++;
	}
}
console.log("Simulation complete: ", winCount);
console.log("Ratio (p1/p2): ", winCount[0]/winCount[1]);