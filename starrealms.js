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
	return {name:name, discard:[], bases:[], inPlay:[], scrap:[], discarding:0, combat:0, trade:0, deck:initPlayerDeck(), authority:50, hand:[], strategy:strategy, nextShipToTop:false, nextShipNoCost:false};
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

function processDestroyBase(p, notp) {
	if (notp.bases.length > 0) {
		var baseToDestroy = p.strategy.destroyBaseStrategy(notp.bases);
		if (baseToDestroy && notp.bases.indexOf(baseToDestroy) > -1) {
			module.log.info("Destroy Base: "+baseToDestroy.name);
			moveCard(baseToDestroy, notp.bases, notp.discard);
		}
	}
}

function processDiscardThenDraw(card, p) {
	if (card.discardThenDraw) {
		var cardsToDiscard = p.strategy.discardThenDrawStrategy(p.hand, card.discardThenDraw);
		if (cardsToDiscard && cardsToDiscard.length > 0) {
			cardsToDiscard.forEach(function(c) {
				if (p.hand.indexOf(c) > -1) {
					moveCard(c, p.hand, p.discard);
					module.log.info("Discarded: "+c.name);
				}
			});
		}
		var drawnCards = drawCards(p, card.discardThenDraw);
		if (drawnCards) {
			p.hand = p.hand.concat(drawnCards);
			module.log.info("Drew ", card.discardThenDraw, " cards");
		}
	}
}

function processScrapTradeRow(p) {
	if (p.trade_row && p.trade_row.row.length > 0) {
		var cardToScrap = p.strategy.scrapTradeRowStrategy(p.trade_row.row);
		if (cardToScrap && p.trade_row.row.indexOf(cardToScrap) > -1) {
			module.log.info("Scrap from trade row: "+cardToScrap.name);
			// Remove from trade row and add to scrap
			p.trade_row.row.splice(p.trade_row.row.indexOf(cardToScrap), 1);
			p.scrap.push(cardToScrap);
			// Replenish trade row
			if (p.trade_row.deck.length > 0) {
				p.trade_row.row.push(p.trade_row.deck.draw(1));
			}
		}
	}
}

function processDrawCardForEachBlob(p) {
	var blobCount = p.inPlay.filter(function(c) { return c.faction === 'The Blob'; }).length;
	if (blobCount > 0) {
		var drawnCards = drawCards(p, blobCount);
		if (drawnCards) {
			p.hand = p.hand.concat(drawnCards);
			module.log.info("Drew ", blobCount, " cards for Blobs");
		}
	}
}

function processAllShipsCombat(p) {
	var ships = p.inPlay.filter(function(c) { return !c.base && !c.outpost; });
	ships.forEach(function(ship) {
		p.combat += 1;
		module.log.info(ship.name, " +1 Combat from Fleet HQ");
	});
}

function processIfAtLeastTwoBases(card, p, notp) {
	if (p.bases.length >= 2 && card.ifAtLeastTwoBases) {
		module.log.info("At least two bases - triggering ability");
		playCommon(card.ifAtLeastTwoBases, p, notp);
	}
}

function processDrawThenScrap(card, p) {
	if (card.drawThenScrap) {
		var drawnCards = drawCards(p, card.drawThenScrap);
		if (drawnCards) {
			p.hand = p.hand.concat(drawnCards);
			module.log.info("Drew ", card.drawThenScrap, " cards");
		}
		if (p.hand.length > 0) {
			var cardToScrap = p.strategy.drawThenScrapStrategy(p.hand);
			if (cardToScrap && p.hand.indexOf(cardToScrap) > -1) {
				moveCard(cardToScrap, p.hand, p.scrap);
				module.log.info("Scrapped: "+cardToScrap.name);
			}
		}
	}
}

function processScrapThenDraw(card, p) {
	if (card.scrapThenDraw) {
		if (p.hand.length > 0) {
			var cardToScrap = p.strategy.scrapThenDrawStrategy(p.hand);
			if (cardToScrap && p.hand.indexOf(cardToScrap) > -1) {
				moveCard(cardToScrap, p.hand, p.scrap);
				module.log.info("Scrapped: "+cardToScrap.name);
			}
		}
		var drawnCards = drawCards(p, card.scrapThenDraw);
		if (drawnCards) {
			p.hand = p.hand.concat(drawnCards);
			module.log.info("Drew ", card.scrapThenDraw, " cards");
		}
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
	if (card.hasOwnProperty('destroyBase')) { processDestroyBase(p, notp); }
	if (card.hasOwnProperty('nextShipToTop')) { p.nextShipToTop = true; module.log.info("Next ship to top of deck"); }
	if (card.hasOwnProperty('nextShipNoCost')) { p.nextShipNoCost = true; module.log.info("Next ship no cost"); }
	if (card.hasOwnProperty('discardThenDraw')) { processDiscardThenDraw(card, p); }
	if (card.hasOwnProperty('scrapTradeRow')) { processScrapTradeRow(p); }
	if (card.hasOwnProperty('drawCardForEachBlob')) { processDrawCardForEachBlob(p); }
	if (card.hasOwnProperty('allShipsCombat')) { processAllShipsCombat(p); }
	if (card.hasOwnProperty('ifAtLeastTwoBases')) { processIfAtLeastTwoBases(card, p, notp); }
	if (card.hasOwnProperty('drawThenScrap')) { processDrawThenScrap(card, p); }
	if (card.hasOwnProperty('scrapThenDraw')) { processScrapThenDraw(card, p); }
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
	var toBuy = trade.row.concat(ExplorerCard).filter(function(card) { return (p.nextShipNoCost || card.cost <= p.trade)});
	while(toBuy.length > 0 && trade.deck.length > 0)
	{
		var cardToBuy = p.strategy.buyStrategy(toBuy);
		var costToPay = p.nextShipNoCost ? 0 : cardToBuy.cost;

		if (cardToBuy === ExplorerCard) {
			if (p.nextShipToTop) {
				p.deck.putOnTopOfDeck([ExplorerCard]);
				p.nextShipToTop = false;
				module.log.info("Placed on top of deck");
			} else {
				p.discard = p.discard.concat(ExplorerCard);
			}
		} else {
			if (p.nextShipToTop) {
				// Remove from trade row
				trade.row.splice(trade.row.indexOf(cardToBuy), 1);
				// Put on top of deck
				p.deck.putOnTopOfDeck([cardToBuy]);
				p.nextShipToTop = false;
				module.log.info("Placed on top of deck");
				trade.row.push(trade.deck.draw(1));
			} else {
				moveCard(cardToBuy, trade.row, p.discard);
				trade.row.push(trade.deck.draw(1));
			}
		}

		if (p.nextShipNoCost) {
			p.nextShipNoCost = false;
			module.log.info("Free card!");
		}

		p.trade -= costToPay;
		module.log.info("Aquired ", cardToBuy.name);
        module.log.info("-", costToPay, " Trade (Trade:", p.trade,")");
		toBuy = trade.row.concat(ExplorerCard).filter(function(card) { return (p.nextShipNoCost || card.cost <= p.trade)});
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

	//Make trade available to player for scrapTradeRow ability
	p.trade_row = trade;

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
	//Clear trade row reference
	p.trade_row = undefined;
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
