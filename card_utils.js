module.exports = {
	moveCard: moveCard,
}

function moveCard(card, src, dst) {
	dst.push(card);
	src.splice(src.indexOf(card), 1);
}