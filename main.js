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

var args = process.argv.slice(2);

var strategies = [];
args.forEach(function(strategy, index) {
	strategies.push({name:strategy+index, strategy:require(strategy), wins:0})
});

var startTime = Date.now();
var simulationCount = 30000;

for (var s=0; s<simulationCount; s++) {
    seed = s;
    if (seed % 100 == 0)
     { log.info('Seed: ', seed); }
    
    var p1 = strategies[s%strategies.length];
    var p2 = strategies[(s+1)%strategies.length];

	var result = Starrealms.runGame(undefined, p1.strategy, p2.strategy); // Pass log into runGame() to enable debug output

	if (result[0] > result[1]) {
		p1.wins++;
	} else {
		p2.wins++;
	}
}
var endTime = Date.now();

console.log("Simulation complete");
console.log(p1.name," wins:", p1.wins);
console.log(p2.name," wins:", p2.wins);
console.log("Ratio (p1/p2): ", p1.wins/p2.wins);
console.log("Total time: ", endTime-startTime, "ms");
console.log("Games/sec: ", simulationCount / (endTime-startTime) * 1000);