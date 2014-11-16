var Starrealms = require("./starrealms");
var winston = require('winston');
var log = new (winston.Logger)({  
    transports: [
        new (winston.transports.Console)({ level: 'info' }),
        new (winston.transports.File)({ filename: 'game.log', level: 'debug', json:false})
    ]
});

//process.on('SIGINT', function() {
//    log.error('Caught interrupt signal');
//    process.exit(1);
//});

var simulationCount = 2000;
var winCount = [0, 0];
for (var s=0; s<simulationCount; s++) {
	var result = Starrealms.runGame(log);
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