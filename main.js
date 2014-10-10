var Starrealms = require("./starrealms");

var simulationCount = 1000;
var winCount = [0, 0];
for (var s=0; s<simulationCount; s++) {
	var result = Starrealms.runGame();
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