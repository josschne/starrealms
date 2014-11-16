var Shuffle = require('shuffle');
var Readline = require('readline-sync');
var moveCard = require('./card_utils').moveCard;

//Add functions here to expose them outside of the module
module.exports = {
	runGame: runGame,
	playCard: playCard,
	initPlayer: initPlayer,
	initTrade: initTrade,
	getFactionCount: getFactionCount,
	processCombat: processCombat,
	processTrade: processTrade,
	processPreTurn: processPreTurn,
}


function initPlayer(name, strategy)
{
	if (!strategy) {
		strategy = require('./strategy');
	}
	return {name:name, discard:[], bases:[], inPlay:[], scrap:[], discarding:0, combat:0, trade:0, deck:initPlayerDeck(), authority:50, hand:[], strategy:strategy};
}

function initPlayerDeck() {
	var deck = [];
	var add = function (n, card) { for (var i=0; i<n; i++) { deck.push(card); }};

	add(8, {name:'Scout', trade:1});
	add(2, {name:'Viper', combat:1});
	return Shuffle.shuffle({deck: deck});
}

function drawCards(p, n)
{
	var cards = [].concat(p.deck.draw(Math.min(n, p.deck.cards.length)) || []);
	if (cards.length < n)
	{
		if (n > p.discard.length) { console.log("Oh noes. Discard pile isn't big enough!"); process.exit(0); }
		p.deck.putOnTopOfDeck(p.discard);
		p.discard = [];
		p.deck.shuffle();

		cards = cards.concat(p.deck.draw(n-cards.length));
	}
	return cards;
}

function getFactionCount(p) {
	var cardsInPlay = p.inPlay.concat(p.bases);
	var factionCount = cardsInPlay.reduce(function(factionCount, c){ factionCount[c.faction] = (factionCount[c.faction] || 0) + 1; return factionCount; }, {});
	return factionCount;
}

function processAllyAbilities(card, p, notp) {
	var factionCount = getFactionCount(p);
	Object.keys(factionCount).forEach(function(faction) {
		//Process only this card if ally abilities already activated
		if (factionCount[faction] >= 2 && card.faction == faction && card.hasOwnProperty('allyAbilities')) {
			playCommon(card.allyAbilities, p, notp);
		}
		//Process all cards if ally abilities were just activated
		if (factionCount[faction] == 1 && card.faction == faction) {
			var factionCardsWithAbilities = p.inPlay.concat(p.bases).concat(card).filter(function(c) { return c.faction == faction && c.hasOwnProperty('allyAbilities');});

			factionCardsWithAbilities.forEach(function(c) {
				playCommon(c.allyAbilities, p, notp);
			})
		}
	});
}

function playCommon(card, p, notp) {
	if (card.hasOwnProperty('trade')) { p.trade += card.trade; }
	//if (card.hasOwnProperty('authority')) { p.authority += card.authority; }
	if (card.hasOwnProperty('combat')) { p.combat += card.combat; }
	//if (card.hasOwnProperty('drawCard')) { p.hand = p.hand.concat(drawCards(p, card.drawCard)); }
	//if (card.hasOwnProperty('or')) { playCommon(p.strategy.orStrategy(card), p, notp); }
	//if (card.hasOwnProperty('faction')) { processAllyAbilities(card, p, notp); }
	//if (card.hasOwnProperty('opponentDiscard')) { notp.discarding += card.opponentDiscard; }
}

function playBase(card, p, notp) {
	playCommon(card, p, notp);
}

function playCard(card, p, notp) {
	playCommon(card, p, notp);

	if (card.hasOwnProperty('base') || card.hasOwnProperty('outpost')) {
		moveCard(card, p.hand, p.bases);
	} else {
		moveCard(card, p.hand, p.inPlay);
	}
}

function processCombat(p, notp) {
	while (p.combat > 0) {
		if (notp.bases[0]) {
			var outposts = notp.bases.filter(function(b) { return b.hasOwnProperty('outpost'); }).sort(function(a, b) { return a.outpost-b.outpost; });
			if (outposts[0])
			{
				if (outposts[0].outpost <= p.combat) {
					moveCard(outposts[0], notp.bases, notp.discard);
					p.combat -= outposts[0].outpost;
					module.log.debug(p.name, " destroys outpost ", outposts[0].name);
					continue;
				}
				else {
					p.combat = 0;
					break;
				}
			}
		}

		module.log.debug(p.name, " attacks ", notp.name, " for ", p.combat, " authority.");
		notp.authority -= p.combat;
		p.combat = 0;
	}
}

function processTrade(p, trade)
{
	var toBuy = trade.row.filter(function(card) { return (card.cost <= p.trade)});
	while(toBuy.length > 0 && trade.deck.length > 0)
	{
		var cardToBuy = p.strategy.buyStrategy(toBuy);
		module.log.debug(p.name, " trades ", cardToBuy.cost, " for ", cardToBuy.name);
		moveCard(cardToBuy, trade.row, p.discard);
		trade.row.push(trade.deck.draw(1));
		p.trade -= cardToBuy.cost;
		toBuy = trade.row.filter(function(card) { return (card.cost <= p.trade)});
	}
	p.trade = 0;
}

function processPreTurn(p)
{
	for(i=0; i<p.discarding; i++)
	{
		moveCard(p.hand[0], p.hand, p.discard);
	}
	p.discarding = 0;
}

function processScrap(p, notp)
{
	// for(card in p.hand)
	// {
	// 	if (   card.hasOwnProperty('scrapAbilities') 
	// 		&& Math.random() < 0.1)
	// 	{
	// 		playCommon(card.scrapAbilities, p, notp);
	// 		moveCard(card, p.hand, p.scrap);
	// 	}
	// }
}

function play(p, notp, trade) {
	module.log.debug(p.name, "'s turn!");

	//Main
	module.log.debug("HAND: ", p.hand.map(function(card) { return card.name; }));
	module.log.debug("BASES: ", p.bases.map(function(card) { return card.name; }));

	//Pre-turn
	processPreTurn(p);

	//Play Hand
	p.bases.forEach(function(card) {
		playBase(card, p, notp);
	})
	while(p.hand.length > 0) {
		playCard(p.hand[0], p, notp);
	};

	module.log.debug("T:", p.trade, "A:", p.authority, "C:", p.combat);
	
	module.log.debug("TRADE: ", trade.row.map(function(card) { return card.name; }));
	
	//Scrap cards
	processScrap(p, notp);
	
	//Main Combat
	processCombat(p, notp);

	//Main Trade
	processTrade(p, trade);

	//Discard
	p.discard = p.discard.concat(p.inPlay);
	p.inPlay = [];
	//Draw
	p.hand = drawCards(p,5);
}

function initTrade()
{
	var trade = {hand:[], deck:Shuffle.shuffle({deck: require('./tradeCards.js').getTradeCards()})};
	return trade;
}

function runGame(log) 
{
	module.log = log;

	//Initializations
	var p1 = initPlayer("P1", require('./strategy'));
	var p2 = initPlayer("P2", require('./strategy'));
	var trade = initTrade();

	//Begin Game
	p1.hand = p1.deck.draw(3);
	p2.hand = p2.deck.draw(5);
	trade.row = trade.deck.draw(5);

	while(p1.authority > 0 && p2.authority > 0)
	{
		play(p1, p2, trade);
		if (p2.authority <=0) {
			break;
		}

		play(p2, p1, trade);
		if (p1.authority <= 0) {
			break;
		}
	}

	module.log.info("Final score - P1:", p1.authority, " P2:", p2.authority);
	return [p1.authority, p2.authority];
}