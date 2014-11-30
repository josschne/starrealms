var seed = 1;

Math.random = function myRandom() {
    var x = Math.sin(seed++) * 10000;
    return x - Math.floor(x);
}

var Starrealms = require("./starrealms");
var winston = require('winston');
var log = new (winston.Logger)({  
    transports: [
        new (winston.transports.Console)({ level: 'info' })
    ]
});

var startTime = Date.now();
var simulationCount = 5000;
var winCount = [0, 0];
for (var s=0; s<simulationCount; s++) {
    seed = s;
    log.info('Seed: ', seed);
	var result = Starrealms.runGame(); // Pass log into runGame() to enable debug outpu
	if (result[0] > result[1]) {
		winCount[0]++;
	}
	else 
	{
		winCount[1]++;
	}
}
var endTime = Date.now();

console.log("Simulation complete");
console.log("Win count: ", winCount);
console.log("Ratio (p1/p2): ", winCount[0]/winCount[1]);
console.log("Total time: ", endTime-startTime, "ms");
console.log("Games/sec: ", simulationCount / (endTime-startTime) * 1000);