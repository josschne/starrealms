var main = require("../starrealms");

describe("A played card", function() {

	beforeEach(function() {
		p = main.initPlayer();
		notp = main.initPlayer();
	});

	it("increases the player's trade", function() {
		card = {trade:1};
		p.hand = [card];
		main.playCard(card, p);

		expect(p.trade).toEqual(1);
	});

	it("increases the player's authority", function() {
		card = {authority:1};
		p.hand = [card];
		main.playCard(card, p);

		expect(p.authority).toEqual(51);
	});

	it("increases the player's combat", function() {
		card = {combat:1};
		p.hand = [card];
		main.playCard(card, p);

		expect(p.combat).toEqual(1);
	});

	it("draws a new card when instructed", function() {
		card = {drawCard:1};
		p.hand = [ card ];
		main.playCard(card, p);

		expect(p.hand.length).toEqual(1);
	});

	it("triggers its own ally abilities when appropriate", function() {
		cardA = {faction:'A', allyAbilities:{trade:1}};
		cardB = {faction:'B', allyAbilities:{trade:1}};
		p.inPlay = [ {faction:'A'} ];

		//Only one of the two cards' ally abilities should be triggered
		p.hand = [cardA, cardB];
		main.playCard(cardA, p);
		main.playCard(cardB, p);

		expect(p.trade).toEqual(1);
	});

	it("triggers other cards' ally abilities", function() {
		cardA = {faction:'A', allyAbilities:{trade:1}};
		cardB = {faction:'A', allyAbilities:{trade:1}};

		p.hand = [ cardA, cardB ];

		main.playCard(cardA, p);
		main.playCard(cardB, p);

		expect(p.trade).toEqual(2);
	})

	it("triggers ally abilities after drawing a card", function() {
		cardA = {faction:'A', drawCard:1, allyAbilities:{trade:1}};
		cardB = {faction:'A'};

		p.hand = [ cardA ];
		p.deck.putOnTopOfDeck([cardB]);

		main.playCard(cardA, p);
		main.playCard(cardB, p);

		expect(p.trade).toEqual(1);
	})
    
    it("does not trigger ally abilities for a single outpost", function() {
        outpost = {faction:'A', allyAbilities:{trade:1}, outpost:4};
        
        p.bases = [ outpost ];
        main.playBase(outpost, p, notp);
        
        expect(p.trade).toEqual(0);
    });

	it("is added to the bases if it is a base or an outpost", function() {
		card = {base:5};

        p.hand = [card];
        trade = {row:[]};
		main.play(p, notp, trade);

		expect(p.bases.length).toEqual(1);
	});

	it("handles 'or' conditions", function() {
		card = {or:[{trade:1}, {combat:2}]};

		p.hand = [card];
		main.playCard(card, p);

		expect(p.trade).toEqual(1);
		expect(p.combat).toEqual(0);
	});

	it("handles opponent discard", function() {
		card = {opponentDiscard:1};

		p.hand = [card];
		main.playCard(card, p, notp);

		expect(notp.discarding).toEqual(1);
	});

	it("handles stealth needle", function() {
		stealthNeedle = {copyShip:1};
		inPlayCard = {combat:2}

		p.hand = [ stealthNeedle ];
		p.inPlay = [ inPlayCard ];

		main.playCard(stealthNeedle, p, notp);

		expect(p.combat).toEqual(2)
	});

	it("does not allow stealth needle to copy a base or outpost", function() {
		stealthNeedle = {copyShip:1};
		inPlayOutpost = {combat:2, outpost:2};
		inPlayBase = {combat:2, base:2};

		p.hand = [ stealthNeedle, stealthNeedle ];
		p.inPlay = [inPlayOutpost, inPlayBase];

		p.strategy.copyShipStrategy = function() { return inPlayOutpost; };
		main.playCard(stealthNeedle, p, notp);

		p.strategy.copyShipStrategy = function() { return inPlayBase; };
		main.playCard(stealthNeedle, p, notp);

		expect(p.combat).toEqual(0);
	});
    
    it("can be scrapped", function() {
        scrapCard = {scrapAbilities:{combat:1}};
        
        p.inPlay = [scrapCard];
        p.strategy.scrapStrategy = function(card) { return card; } // Always scrap for the purpose of this test
        
        main.processScrap(p, notp);
        
        expect(p.scrap.length).toEqual(1);
        expect(p.combat).toEqual(1);
    });

    it("can scrap a card in the discard pile when allowed", function() {
    	cardWithScrapAbility = {scrapCard:1};
    	viper = {name:"Viper"};

    	p.hand = [cardWithScrapAbility];
    	p.discard = [viper];
    	p.strategy.scrapCardStrategy = function(p) { return viper; }; //Silly strategy that only scraps Vipers

    	main.playCard(cardWithScrapAbility, p, notp);

    	expect(p.discard.length).toEqual(0);
    	expect(p.scrap.length).toEqual(1);
    })


    it("can scrap a card in your hand when allowed", function() {
    	cardWithScrapAbility = {scrapCard:1};
    	viper = {name:"Viper"};

    	p.hand = [cardWithScrapAbility, viper];
    	p.strategy.scrapCardStrategy = function(p) { return viper; }; //Silly strategy that only scraps Vipers

    	main.playCard(cardWithScrapAbility, p, notp);

    	expect(p.hand.length).toEqual(0);
    	expect(p.scrap.length).toEqual(1);
    })

});

describe("Drawing cards", function() {
	it("returns undefined if no cards are available to draw", function() {
		p = main.initPlayer();
		p.deck = [];
		p.discard = [];

		expect(main.drawCards(p, 1)).toEqual(undefined);
	});

	it("returns remaining cards in deck when there are not enough cards to draw", function() {
		var Shuffle = require('shuffle');
		var lastCard = {name:"LastCard"};

		p = main.initPlayer();
		p.deck = Shuffle.shuffle({deck:[lastCard]});
		p.discard = [lastCard];

		expect(main.drawCards(p, 3)).toEqual([lastCard, lastCard]);
	});

	it("returns remaining cards when there are not enough cards to draw and the discard pile is empty", function() {
		var Shuffle = require('shuffle');
		var lastCard = {name:"LastCard"};

		p = main.initPlayer();
		p.deck = Shuffle.shuffle({deck:[lastCard]});
		p.discard = [];

		expect(main.drawCards(p, 3)).toEqual([lastCard]);
	})

})

describe("Mech World", function() {
    it("is an ally for every faction", function() {
        p = main.initPlayer();
		notp = main.initPlayer();
        
        allyCard1 = { faction:"The Blob",         allyAbilities:{combat:1}};
        allyCard2 = { faction:"Star Empire",      allyAbilities:{combat:1}};
        allyCard3 = { faction:"Trade Federation", allyAbilities:{combat:1}};
        allyCard4 = { faction:"Machine Cult",     allyAbilities:{combat:1}};
        mechWorld = { faction:"Machine Cult",     allyAll:1 };
        p.hand = [allyCard1, allyCard2, mechWorld, allyCard3, allyCard4];
        
        main.playCard(allyCard1, p, notp);
        main.playCard(allyCard2, p, notp);
        main.playCard(mechWorld, p, notp);
        main.playCard(allyCard3, p, notp);
        main.playCard(allyCard4, p, notp);
        
        expect(p.combat).toEqual(4);        
    });
});

describe("Defending against stupid strategy", function() {

	it("ignores undefined cards", function() {
		p = main.initPlayer();
		notp = main.initPlayer();

		main.playCommon(undefined, p, notp);
	});

});

describe("Combat processing", function() {
	beforeEach(function(){
		p = main.initPlayer();
		notp = main.initPlayer();
	});

	it("handles a simple no-bases combat scenario", function() {
		p.combat = 5;
		main.processCombat(p, notp);
		expect(notp.authority).toEqual(45);
		expect(p.combat).toEqual(0);
	});

	it("requires outposts to be attacked when present", function() {
		p.combat = 5;
		notp.bases = [ {outpost: 5} ];
		main.processCombat(p, notp);
		expect(notp.authority).toEqual(50);
	});

	it("moves destroyed bases to the discard pile", function() {
		p.combat = 5;
		notp.bases = [ {outpost:5} ];
		main.processCombat(p, notp);
		expect(notp.discard.length).toEqual(1);
	});

	it("uses remaining combat after attacking an outpost to attack the player", function() {
		p.combat = 5;
		notp.bases = [ {outpost: 3} ];
		main.processCombat(p, notp);
		expect(notp.authority).toEqual(48);
	});

	it("stops combat if the opponent has an outpost with more health than the player has combat", function() {
		p.combat = 3;
		notp.bases = [ {outpost: 4} ];
		main.processCombat(p, notp);
		expect(notp.authority).toEqual(50);
	})
});

describe("Trade processing", function() {
	it("buys a card", function() {
		p = main.initPlayer();
		p.trade = 3;
		trade = main.initTrade();
		trade.row = [ {cost:3}, {cost:4}, {cost:5} ];

		main.processTrade(p, trade);

		expect(p.discard.length).toEqual(1);
		expect(p.discard[0].cost).toEqual(3);
	});

	it("offers an Explorer for purchase", function() {
		p = main.initPlayer();
		p.trade = 2;
		trade = main.initTrade();
		trade.row = [ {cost:3} ];

		main.processTrade(p, trade);

		expect(p.discard.length).toEqual(1);
		expect(p.discard[0].name).toEqual("Explorer");
	});

});

describe("A turn", function() {
	beforeEach(function(){
		p = main.initPlayer();
	});

	it("will not play cards that need to be discarded", function() {
		p.hand = [{}, {}, {}, {}, {}];  //A hand with 5 cards
		p.discarding = 1;

		main.processPreTurn(p);

		expect(p.discard.length).toBe(1);
	});
});

describe("A player", function() {
	it("can calculate the factions in play", function() {
		var p = main.initPlayer();
		p.inPlay = [ {faction:'A'} ];

		expect(main.getFactionCount(p)).toEqual({'A':1});
	});
});

describe("destroyBase ability", function() {
	beforeEach(function() {
		p = main.initPlayer();
		notp = main.initPlayer();
	});

	it("destroys an opponent's base", function() {
		var baseToDestroy = {name:'Base1', base:5};
		var destroyBaseCard = {destroyBase:1};

		p.hand = [destroyBaseCard];
		notp.bases = [baseToDestroy];

		main.playCard(destroyBaseCard, p, notp);

		expect(notp.bases.length).toEqual(0);
		expect(notp.discard.length).toEqual(1);
		expect(notp.discard[0]).toBe(baseToDestroy);
	});

	it("destroys an opponent's outpost", function() {
		var outpostToDestroy = {name:'Outpost1', outpost:4};
		var destroyBaseCard = {destroyBase:1};

		p.hand = [destroyBaseCard];
		notp.bases = [outpostToDestroy];

		main.playCard(destroyBaseCard, p, notp);

		expect(notp.bases.length).toEqual(0);
		expect(notp.discard.length).toEqual(1);
		expect(notp.discard[0]).toBe(outpostToDestroy);
	});

	it("does nothing if opponent has no bases", function() {
		var destroyBaseCard = {destroyBase:1};

		p.hand = [destroyBaseCard];
		notp.bases = [];

		main.playCard(destroyBaseCard, p, notp);

		expect(notp.bases.length).toEqual(0);
		expect(notp.discard.length).toEqual(0);
	});

	it("works as a scrap ability", function() {
		var baseToDestroy = {name:'Base1', base:5};
		var cardWithScrapAbility = {name:'Battlecruiser', scrapAbilities:{destroyBase:1}};

		p.inPlay = [cardWithScrapAbility];
		p.strategy.scrapStrategy = function(card) { return card; };
		notp.bases = [baseToDestroy];

		main.processScrap(p, notp);

		expect(notp.bases.length).toEqual(0);
		expect(notp.discard.length).toEqual(1);
		expect(p.scrap.length).toEqual(1);
	});

	it("works as an ally ability", function() {
		var baseToDestroy = {name:'Base1', base:5};
		var allyCard1 = {faction:'A'};
		var allyCard2 = {faction:'A', allyAbilities:{destroyBase:1}};

		p.hand = [allyCard1, allyCard2];
		notp.bases = [baseToDestroy];

		main.playCard(allyCard1, p, notp);
		main.playCard(allyCard2, p, notp);

		expect(notp.bases.length).toEqual(0);
		expect(notp.discard.length).toEqual(1);
	});
});

describe("nextShipToTop ability", function() {
	beforeEach(function() {
		p = main.initPlayer();
		notp = main.initPlayer();
	});

	it("places the next bought card on top of the deck", function() {
		var Shuffle = require('shuffle');
		var nextShipCard = {nextShipToTop:1};
		var cardToBuy = {name:'ToBuy', cost:2};
		var existingCard = {name:'Existing'};

		p.hand = [nextShipCard];
		p.trade = 2;
		p.deck = Shuffle.shuffle({deck: [existingCard]});
		trade = main.initTrade();
		trade.row = [cardToBuy];

		main.playCard(nextShipCard, p, notp);
		main.processTrade(p, trade);

		// The bought card should be on top, so draw it first
		expect(p.deck.draw(1)).toBe(cardToBuy);
		// The existing card should be below it
		expect(p.deck.draw(1)).toBe(existingCard);
		expect(p.discard.length).toEqual(0);
	});

	it("places Explorer on top of deck when flag is set", function() {
		var Shuffle = require('shuffle');
		var nextShipCard = {nextShipToTop:1};
		var existingCard = {name:'Existing'};

		p.hand = [nextShipCard];
		p.trade = 2;
		p.deck = Shuffle.shuffle({deck: [existingCard]});
		trade = main.initTrade();
		trade.row = [{cost:100}]; // Too expensive, so Explorer will be bought

		main.playCard(nextShipCard, p, notp);
		main.processTrade(p, trade);

		var topCard = p.deck.draw(1);
		expect(topCard.name).toEqual("Explorer");
		expect(p.discard.length).toEqual(0);
	});

	it("only affects the next ship bought", function() {
		var Shuffle = require('shuffle');
		var nextShipCard = {nextShipToTop:1};
		var card1 = {name:'Card1', cost:1};
		var card2 = {name:'Card2', cost:1};
		var existingCard = {name:'Existing'};

		p.hand = [nextShipCard];
		p.trade = 2;
		p.deck = Shuffle.shuffle({deck: [existingCard]});
		trade = main.initTrade();
		trade.row = [card1, card2];

		main.playCard(nextShipCard, p, notp);
		main.processTrade(p, trade);

		// First card should be on top of deck
		expect(p.deck.draw(1).name).toEqual('Card1');
		// Second card should be in discard
		expect(p.discard.length).toEqual(1);
		expect(p.discard[0].name).toEqual('Card2');
	});

	it("works as an ally ability", function() {
		var Shuffle = require('shuffle');
		var allyCard1 = {faction:'A', trade:2};
		var allyCard2 = {faction:'A', allyAbilities:{nextShipToTop:1}};
		var cardToBuy = {name:'ToBuy', cost:2};
		var existingCard = {name:'Existing'};

		p.hand = [allyCard1, allyCard2];
		p.deck = Shuffle.shuffle({deck: [existingCard]});
		trade = main.initTrade();
		trade.row = [cardToBuy];

		main.playCard(allyCard1, p, notp);
		main.playCard(allyCard2, p, notp);
		main.processTrade(p, trade);

		expect(p.deck.draw(1)).toBe(cardToBuy);
	});
});

describe("discardThenDraw ability", function() {
	beforeEach(function() {
		var Shuffle = require('shuffle');
		p = main.initPlayer();
		notp = main.initPlayer();
	});

	it("discards then draws the specified number of cards", function() {
		var Shuffle = require('shuffle');
		var discardCard = {discardThenDraw:2};
		var handCard1 = {name:'Hand1'};
		var handCard2 = {name:'Hand2'};
		var deckCard1 = {name:'Deck1'};
		var deckCard2 = {name:'Deck2'};

		p.hand = [discardCard, handCard1, handCard2];
		p.deck = Shuffle.shuffle({deck: [deckCard1, deckCard2]});
		p.strategy.discardThenDrawStrategy = function(hand, count) {
			return [handCard1, handCard2];
		};

		main.playCard(discardCard, p, notp);

		// Should have 2 cards in hand (the 2 drawn cards)
		expect(p.hand.length).toEqual(2);
		// Should have discarded 2 cards
		expect(p.discard.length).toEqual(2);
		expect(p.discard.indexOf(handCard1)).toBeGreaterThan(-1);
		expect(p.discard.indexOf(handCard2)).toBeGreaterThan(-1);
	});

	it("draws cards after discarding", function() {
		var Shuffle = require('shuffle');
		var discardCard = {discardThenDraw:1};
		var handCard = {name:'Hand'};
		var deckCard = {name:'Deck'};

		p.hand = [discardCard, handCard];
		p.deck = Shuffle.shuffle({deck: [deckCard]});
		p.strategy.discardThenDrawStrategy = function(hand, count) {
			return [handCard];
		};

		main.playCard(discardCard, p, notp);

		// The deck card should now be in hand
		expect(p.hand.indexOf(deckCard)).toBeGreaterThan(-1);
	});

	it("works in an or ability context", function() {
		var Shuffle = require('shuffle');
		var card = {or: [{trade:1}, {discardThenDraw:2}]};
		var handCard1 = {name:'Hand1'};
		var handCard2 = {name:'Hand2'};
		var deckCard = {name:'Deck'};

		p.hand = [card, handCard1, handCard2];
		p.deck = Shuffle.shuffle({deck: [deckCard, deckCard]});
		p.strategy.orStrategy = function(c) { return c.or[1]; }; // Choose discardThenDraw
		p.strategy.discardThenDrawStrategy = function(hand, count) {
			return [handCard1, handCard2];
		};

		main.playCard(card, p, notp);

		expect(p.discard.length).toEqual(2);
		expect(p.hand.length).toEqual(2);
	});
});

describe("scrapTradeRow ability", function() {
	beforeEach(function() {
		p = main.initPlayer();
		notp = main.initPlayer();
	});

	it("removes a card from the trade row and scraps it", function() {
		var scrapCard = {scrapTradeRow:1};
		var tradeCard1 = {name:'Trade1', cost:3};
		var tradeCard2 = {name:'Trade2', cost:4};
		var replacementCard = {name:'Replacement', cost:5};

		p.hand = [scrapCard];
		trade = main.initTrade();
		trade.row = [tradeCard1, tradeCard2];
		trade.deck.putOnTopOfDeck([replacementCard]);

		p.strategy.scrapTradeRowStrategy = function(row) { return tradeCard1; };

		main.play(p, notp, trade);

		// Trade row should still have 2 cards (one scrapped, one added)
		expect(trade.row.length).toEqual(2);
		// The scrapped card should not be in trade row
		expect(trade.row.indexOf(tradeCard1)).toEqual(-1);
		// The replacement card should be in trade row
		expect(trade.row.indexOf(replacementCard)).toBeGreaterThan(-1);
		// The scrapped card should be in player's scrap pile
		expect(p.scrap.indexOf(tradeCard1)).toBeGreaterThan(-1);
	});

	it("works as an ally ability", function() {
		var allyCard1 = {faction:'A'};
		var allyCard2 = {faction:'A', allyAbilities:{scrapTradeRow:1}};
		var tradeCard = {name:'Trade', cost:3};
		var replacementCard = {name:'Replacement', cost:5};

		p.hand = [allyCard1, allyCard2];
		trade = main.initTrade();
		trade.row = [tradeCard];
		trade.deck.putOnTopOfDeck([replacementCard]);

		p.strategy.scrapTradeRowStrategy = function(row) { return tradeCard; };

		main.play(p, notp, trade);

		expect(p.scrap.indexOf(tradeCard)).toBeGreaterThan(-1);
		expect(trade.row.indexOf(replacementCard)).toBeGreaterThan(-1);
	});

	it("does nothing if trade row is empty", function() {
		var scrapCard = {scrapTradeRow:1};

		p.hand = [scrapCard];
		trade = main.initTrade();
		trade.row = [];

		main.play(p, notp, trade);

		expect(p.scrap.length).toEqual(0);
	});
});

describe("nextShipNoCost ability", function() {
	beforeEach(function() {
		p = main.initPlayer();
		notp = main.initPlayer();
	});

	it("makes the next purchased card free", function() {
		var Shuffle = require('shuffle');
		var freeCard = {nextShipNoCost:1};
		var expensiveCard = {name:'Expensive', cost:10};

		p.hand = [freeCard];
		p.trade = 0;
		p.deck = Shuffle.shuffle({deck: []});
		trade = main.initTrade();
		trade.row = [expensiveCard];

		main.playCard(freeCard, p, notp);
		main.processTrade(p, trade);

		// Should have bought the card despite having 0 trade
		expect(p.discard.length).toEqual(1);
		expect(p.discard[0]).toBe(expensiveCard);
		expect(p.trade).toEqual(0);
	});

	it("only affects the next ship bought", function() {
		var Shuffle = require('shuffle');
		var freeCard = {nextShipNoCost:1, trade:5};
		var card1 = {name:'Card1', cost:10};
		var card2 = {name:'Card2', cost:5};

		p.hand = [freeCard];
		p.deck = Shuffle.shuffle({deck: []});
		trade = main.initTrade();
		trade.row = [card1, card2];

		main.playCard(freeCard, p, notp);
		main.processTrade(p, trade);

		// Should have bought both cards (first free, second costs 5)
		expect(p.discard.length).toEqual(2);
		expect(p.trade).toEqual(0);
	});

	it("works as an ally ability", function() {
		var Shuffle = require('shuffle');
		var allyCard1 = {faction:'A', trade:0};
		var allyCard2 = {faction:'A', allyAbilities:{nextShipNoCost:1}};
		var expensiveCard = {name:'Expensive', cost:10};

		p.hand = [allyCard1, allyCard2];
		p.deck = Shuffle.shuffle({deck: []});
		trade = main.initTrade();
		trade.row = [expensiveCard];

		main.playCard(allyCard1, p, notp);
		main.playCard(allyCard2, p, notp);
		main.processTrade(p, trade);

		expect(p.discard.length).toEqual(1);
		expect(p.discard[0]).toBe(expensiveCard);
	});
});

describe("drawCardForEachBlob ability", function() {
	beforeEach(function() {
		var Shuffle = require('shuffle');
		p = main.initPlayer();
		notp = main.initPlayer();
	});

	it("draws cards equal to number of Blobs in play", function() {
		var Shuffle = require('shuffle');
		var card = {drawCardForEachBlob:1};
		var blob1 = {name:'Blob1', faction:'The Blob'};
		var blob2 = {name:'Blob2', faction:'The Blob'};
		var deckCard = {name:'Deck'};

		p.hand = [card];
		p.inPlay = [blob1, blob2];
		p.deck = Shuffle.shuffle({deck: [deckCard, deckCard]});

		main.playCard(card, p, notp);

		expect(p.hand.length).toEqual(2); // Drew 2 cards for 2 Blobs
	});
});

describe("allShipsCombat ability", function() {
	beforeEach(function() {
		p = main.initPlayer();
		notp = main.initPlayer();
	});

	it("gives +1 combat to all ships in play", function() {
		var card = {allShipsCombat:1};
		var ship1 = {name:'Ship1'};
		var ship2 = {name:'Ship2'};
		var base = {name:'Base', base:5};

		p.hand = [card];
		p.inPlay = [ship1, ship2, base];

		main.playCard(card, p, notp);

		expect(p.combat).toEqual(2); // 2 ships * 1 combat each
	});
});

describe("ifAtLeastTwoBases ability", function() {
	beforeEach(function() {
		p = main.initPlayer();
		notp = main.initPlayer();
	});

	it("triggers ability when player has 2+ bases", function() {
		var card = {ifAtLeastTwoBases:{drawCard:2}};
		var base1 = {name:'Base1', base:5};
		var base2 = {name:'Base2', base:5};

		p.hand = [card];
		p.bases = [base1, base2];
		p.deck.putOnTopOfDeck([{name:'Deck1'}, {name:'Deck2'}]);

		main.playCard(card, p, notp);

		expect(p.hand.length).toEqual(2); // Drew 2 cards
	});

	it("does not trigger when player has fewer than 2 bases", function() {
		var card = {ifAtLeastTwoBases:{drawCard:2}};
		var base1 = {name:'Base1', base:5};

		p.hand = [card];
		p.bases = [base1];

		main.playCard(card, p, notp);

		expect(p.hand.length).toEqual(0); // Did not draw
	});
});

describe("drawThenScrap ability", function() {
	beforeEach(function() {
		var Shuffle = require('shuffle');
		p = main.initPlayer();
		notp = main.initPlayer();
	});

	it("draws cards then scraps one from hand", function() {
		var Shuffle = require('shuffle');
		var card = {drawThenScrap:2};
		var deckCard1 = {name:'Deck1'};
		var deckCard2 = {name:'Deck2'};

		p.hand = [card];
		p.deck = Shuffle.shuffle({deck: [deckCard1, deckCard2]});
		p.strategy.drawThenScrapStrategy = function(hand) { return deckCard1; };

		main.playCard(card, p, notp);

		// Drew 2, then scrapped 1, so should have 1 in hand
		expect(p.hand.length).toEqual(1);
		expect(p.scrap.length).toEqual(1);
		expect(p.scrap[0]).toBe(deckCard1);
	});
});

describe("scrapThenDraw ability", function() {
	beforeEach(function() {
		var Shuffle = require('shuffle');
		p = main.initPlayer();
		notp = main.initPlayer();
	});

	it("scraps cards from hand/discard then draws equal number", function() {
		var Shuffle = require('shuffle');
		var card = {scrapThenDraw:2};
		var handCard = {name:'Hand'};
		var discardCard = {name:'Discard'};
		var deckCard = {name:'Deck'};

		p.hand = [card, handCard];
		p.discard = [discardCard];
		p.deck = Shuffle.shuffle({deck: [deckCard, deckCard]});
		// Strategy scraps 2 cards: one from hand, one from discard
		p.strategy.scrapThenDrawStrategy = function(hand, discard, maxCount) {
			return [handCard, discardCard];
		};

		main.playCard(card, p, notp);

		// Scrapped 2 cards, drew 2, so should have 2 in hand
		expect(p.hand.length).toEqual(2);
		expect(p.scrap.length).toEqual(2);
		expect(p.scrap.indexOf(handCard)).toBeGreaterThan(-1);
		expect(p.scrap.indexOf(discardCard)).toBeGreaterThan(-1);
	});

	it("draws based on number of cards actually scrapped", function() {
		var Shuffle = require('shuffle');
		var card = {scrapThenDraw:2};
		var handCard = {name:'Hand'};
		var deckCard = {name:'Deck'};

		p.hand = [card, handCard];
		p.discard = [];
		p.deck = Shuffle.shuffle({deck: [deckCard]});
		// Strategy only scraps 1 card
		p.strategy.scrapThenDrawStrategy = function(hand, discard, maxCount) {
			return [handCard];
		};

		main.playCard(card, p, notp);

		// Scrapped 1 card, drew 1, so should have 1 in hand
		expect(p.hand.length).toEqual(1);
		expect(p.scrap.length).toEqual(1);
	});

	it("allows scrapping zero cards", function() {
		var Shuffle = require('shuffle');
		var card = {scrapThenDraw:2};
		var handCard = {name:'Hand'};

		p.hand = [card, handCard];
		p.discard = [];
		// Strategy scraps nothing
		p.strategy.scrapThenDrawStrategy = function(hand, discard, maxCount) {
			return [];
		};

		main.playCard(card, p, notp);

		// Scrapped 0, drew 0, so should have 1 card still in hand
		expect(p.hand.length).toEqual(1);
		expect(p.scrap.length).toEqual(0);
	});
});

describe("A game", function() {
	it("can be played without crashing", function() {
		main.runGame(undefined, require('./strategy'), require('./strategy'));
	});
});