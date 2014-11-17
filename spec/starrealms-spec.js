var main = require("../starrealms");

describe("A played card", function() {

	beforeEach(function() {
		p = main.initPlayer();
		notp = main.initPlayer();
	});

	it("increases the player's trade", function() {
		card = {trade:1};
		main.playCard(card, p);

		expect(p.trade).toEqual(1);
	});

	it("increases the player's authority", function() {
		card = {authority:1};
		main.playCard(card, p);

		expect(p.authority).toEqual(51);
	});

	it("increases the player's combat", function() {
		card = {combat:1};
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
		p.deck.putOnTopOfDeck(cardB);

		main.playCard(cardA, p);
		main.playCard(cardB, p);

		expect(p.trade).toEqual(1);
	})

	it("is added to the bases if it is a base or an outpost", function() {
		card = {base:5};

		main.playCard(card, p);

		expect(p.bases.length).toEqual(1);
	});

	it("handles 'or' conditions", function() {
		card = {or:[{trade:1}, {combat:2}]};

		main.playCard(card, p);

		expect(p.trade).toEqual(1);
		expect(p.combat).toEqual(0);
	});

	it("handles opponent discard", function() {
		card = {opponentDiscard:1};

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

});

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

describe("A game", function() {
	it("can be played without crashing", function() {
		main.runGame();
	});
});