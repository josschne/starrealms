var Shuffle = require('shuffle');
var Readline = require('readline-sync');
var moveCard = require('./card_utils').moveCard;

module.log = {info:function() {}};

//Add functions here to expose them outside of the module
module.exports = {
	runGame: runGame,
	drawCards: drawCards,
    play: play,
    playCard: playCard,
    playBase: playBase,
	initPlayer: initPlayer,
	initTrade: initTrade,
	getFactionCount: getFactionCount,
	processCombat: processCombat,
	processTrade: processTrade,
	processPreTurn: processPreTurn,
	playCommon: playCommon,
    processScrap: processScrap,
}


function initPlayer(name, strategy)
{
	if (!strategy) {
		strategy = require('./strategies/dumb_strategy');
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
	module.log.info("Drawing ", n, " cards. ", p.deck.length, " left in the deck. ", p.discard.length, " in the discard. ");
	if (p.deck.length == 0 && p.discard.length == 0) { 
		module.log.info("Player was DECKED!");
		return undefined;
	}

	var cards = [].concat(p.deck.draw(Math.min(n, p.deck.length)) || []);

	if (cards.length < n && p.discard.length != 0)
	{
		p.deck.putOnTopOfDeck(p.discard);
		p.discard = [];
		p.deck.shuffle();

		cards = cards.concat(p.deck.draw(Math.min(n-cards.length, p.deck.length)));
	}
	
	return cards;
}

function createOrIncrement(obj, value) 
{
    obj[value] = (obj[value] || 0) + 1;
}

function getFactionCount(p) {
	var cardsInPlay = p.inPlay;
	var factionCount = cardsInPlay.reduce(function(factionCount, c){ 
        if (c.hasOwnProperty('allyAll')) {
            createOrIncrement(factionCount, 'Machine Cult');
            createOrIncrement(factionCount, 'The Blob');
            createOrIncrement(factionCount, 'Trade Federation');
            createOrIncrement(factionCount, 'Star Empire');
        }
        else
        {
            createOrIncrement(factionCount, c.faction);
        }
        return factionCount; 
    }, {});
    return factionCount;
}

function processAllyAbilities(card, p, notp) {
	var factionCount = getFactionCount(p);
	Object.keys(factionCount).forEach(function(faction) {
		//Process only this card if ally abilities already activated
		if (factionCount[faction] >= 2 && card.faction == faction && card.hasOwnProperty('allyAbilities')) {
            card.allyAbilities.name = "Ally: " + card.name;
            playCommon(card.allyAbilities, p, notp);
		}
		//Process all cards if ally abilities were just activated
		if (factionCount[faction] == 1 && (card.faction == faction || card.hasOwnProperty('allyAll'))) {
			var factionCardsWithAbilities = p.inPlay.concat(card).filter(function(c) { return c.faction == faction && c.hasOwnProperty('allyAbilities');});

			factionCardsWithAbilities.forEach(function(c) {
                c.allyAbilities.name = "Ally: " + c.name;
				playCommon(c.allyAbilities, p, notp);
			})
		}
	});
}

function processScrapCard(card, p) {
	if (card) {
		if (p.discard.indexOf(card) > -1) {
			moveCard(card, p.discard, p.scrap);
			module.log.info("Scrapping: ", card.name);
		} else if (p.hand.indexOf(card) > -1) {
			moveCard(card, p.hand, p.scrap);
			module.log.info("Scrapping: ", card.name);
		}
	}
}

function processCopyShip(p, notp) {
	var shipToCopy = p.strategy.copyShipStrategy(p.inPlay.filter(function(c){ return !c.base && !c.outpost;}));

	if (shipToCopy && !shipToCopy.base && !shipToCopy.outpost) {
		module.log.info("Copy Ship: "+shipToCopy.name);
		playCommon(shipToCopy, p, notp);
	}
}

function processOr(card, p, notp) {
	card.or.forEach(function(a) { a.name = "Or: " + card.name }); 
	var orChoice = p.strategy.orStrategy(card); 
	if (card.or.indexOf(orChoice) > -1) {
		playCommon(orChoice, p, notp);
	} else {
		console.log(p.name, ": WARN: Invalid or choice", orChoice); 
	}
}

function playCommon(card, p, notp) {
	if (!card)
		return
	if (card.hasOwnProperty('trade')) { p.trade += card.trade; module.log.info(card.name, " +", card.trade, " Trade (Trade:", p.trade,")"); }
	if (card.hasOwnProperty('authority')) { p.authority += card.authority; module.log.info(card.name, " +", card.authority, " Authority (Authority:", p.authority,")");}
	if (card.hasOwnProperty('combat')) { p.combat += card.combat; module.log.info(card.name, " +", card.combat, " Combat (Combat:", p.combat,")");}
	if (card.hasOwnProperty('drawCard')) { var drawnCards = drawCards(p, card.drawCard); if (drawnCards) {p.hand = p.hand.concat(drawnCards);} module.log.info(card.name, " Draw ", card.drawCard)}
    if (card.hasOwnProperty('or')) { processOr(card, p, notp); }
	if (card.hasOwnProperty('faction')) { processAllyAbilities(card, p, notp); }
	if (card.hasOwnProperty('opponentDiscard')) { notp.discarding += card.opponentDiscard; }
	if (card.hasOwnProperty('copyShip')) { processCopyShip(p, notp); }
	if (card.hasOwnProperty('scrapCard')) { processScrapCard(p.strategy.scrapCardStrategy(p), p); }
}

function playBase(card, p, notp) {
	module.log.info("Played ", card.name);
    playCommon(card, p, notp);
    moveCard(card, p.bases, p.inPlay);
}

function playCard(card, p, notp) {
    playCommon(card, p, notp);
	moveCard(card, p.hand, p.inPlay);
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
					module.log.info("-", outposts[0].outpost, " Combat (Combat:", p.combat, ")");
                    module.log.info("Attacked ", outposts[0].name);
					continue;
				}
				else {
					p.combat = 0;
					break;
				}
			}
		}

        notp.authority -= p.combat;
		module.log.info("Attacked ", notp.name, " for ", p.combat, " (New Authority:", notp.authority, ")");
        p.combat = 0;
	}
}

function processTrade(p, trade)
{
	var ExplorerCard = {name:"Explorer", trade:2, cost:2, scrapAbilities:{combat:2}};
	var toBuy = trade.row.concat(ExplorerCard).filter(function(card) { return (card.cost <= p.trade)});
	while(toBuy.length > 0 && trade.deck.length > 0)
	{
		var cardToBuy = p.strategy.buyStrategy(toBuy);
		if (cardToBuy === ExplorerCard) {
			p.discard = p.discard.concat(ExplorerCard);
		} else {
			moveCard(cardToBuy, trade.row, p.discard);
			trade.row.push(trade.deck.draw(1));
		}
		p.trade -= cardToBuy.cost;
		module.log.info("Aquired ", cardToBuy.name);
        module.log.info("-", cardToBuy.cost, " Trade (Trade:", p.trade,")");
		toBuy = trade.row.concat(ExplorerCard).filter(function(card) { return (card.cost <= p.trade)});
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
    p.inPlay.forEach(function(card) {
        if (card['scrapAbilities'] && p.strategy.scrapStrategy(card, p, notp))
	    {
            card.scrapAbilities.name = "Scrap: " + card.name;
	        playCommon(card.scrapAbilities, p, notp);
	 		moveCard(card, p.inPlay, p.scrap);
	 	}
	});
}

function play(p, notp, trade) {
	module.log.info("=== It is now ", p.name, "'s turn. ===");

	//Main
	module.log.info("HAND: ", p.hand.map(function(card) { return card.name; }));
	module.log.info("BASES: ", p.bases.map(function(card) { return card.name; }));

	//Pre-turn
	processPreTurn(p);

	//Play Hand
	p.bases.forEach(function(card) {
		playBase(card, p, notp);
	})
	while(p.hand.length > 0) {
		playCard(p.hand[0], p, notp);
        
        //Scrap cards
	    processScrap(p, notp);
	};

	module.log.info("T:", p.trade, "A:", p.authority, "C:", p.combat);
	
	module.log.info("TRADE: ", trade.row.map(function(card) { return card.name; }));
	

	
	//Main Combat
	processCombat(p, notp);

	//Main Trade
	processTrade(p, trade);

	//Discard
	p.discard = p.discard.concat(p.hand);
    while(p.inPlay.length > 0) {
        card = p.inPlay[0];
        if (card.base || card.outpost) {
            moveCard(card, p.inPlay, p.bases);
        } else {
            moveCard(card, p.inPlay, p.discard);
        }
    };
	p.inPlay = [];
    p.hand = [];
	//Draw
	p.hand = drawCards(p,5);
}

function initTrade()
{
	var trade = {hand:[], deck:Shuffle.shuffle({deck: require('./tradeCards.js').getTradeCards()})};
	return trade;
}

function runGame(log, strategy1, strategy2) 
{
	if (log)
	{
		module.log = log;
	}

	//Initializations
	var p1 = initPlayer("P1", strategy1);
	var p2 = initPlayer("P2", strategy2);
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
