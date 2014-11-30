module.exports = {
	moveCard: moveCard,
}

function moveCard(card, src, dst) {
	if (card) {
		if (src.indexOf(card) < 0) {
			throw "Could not move card: " + JSON.stringify(card);
		} else {
			dst.push(card);
			src.splice(src.indexOf(card), 1);
		}
	}
}