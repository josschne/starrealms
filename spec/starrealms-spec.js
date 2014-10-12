var main = require("../starrealms");

describe("A played card", function() {
	it("increases the player's trade", function() {
		p = {trade:0, hand: []};
		card = {trade:1};
		main.playCommon(card, p);

		expect(p.trade).toEqual(1);
	});
});

describe("A game", function() {
	it("can be played without crashing", function() {
		main.runGame();
	});
});