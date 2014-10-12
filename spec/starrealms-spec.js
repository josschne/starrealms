var main = require("../starrealms");

describe("A played card", function() {
	var p;

	beforeEach(function() {
		p = main.initPlayer();
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
		main.playCard(card, p);

		expect(p.hand.length).toEqual(1);
	});

	it("triggers its own ally abilities when appropriate", function() {
		cardA = {faction:'A', allyAbilities:{trade:1}};
		cardB = {faction:'B', allyAbilities:{trade:1}};
		p.hand = [ {faction:'A'} ];

		//Only one of the two cards' ally abilities should be triggered
		main.playCard(cardA, p);
		main.playCard(cardB, p);

		expect(p.trade).toEqual(1);
	});

	it("is added to the bases if it is a base or an outpost", function() {
		card = {base:5};

		main.playCard(card, p);

		expect(p.bases.length).toEqual(1);
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

describe("A player", function() {
	it("can calculate the factions in play", function() {
		var p = main.initPlayer();
		p.hand = [ {faction:'A'} ];

		expect(main.getFactionsInPlay(p)).toEqual(['A']);
	});
});

describe("A game", function() {
	it("can be played without crashing", function() {
		main.runGame();
	});
});