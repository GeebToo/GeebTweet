var winston = require('winston');
var config = require('./../config.json');

module.exports = {
	createLogger : function() {
		var transports = [];
		transports.push(new (winston.transports.Console)({
		    timestamp: true,
		    colorize: true,
		    handleExceptions: false
		}));

		return new (winston.Logger)({
		    level: config.logLevel,
		    transports: transports
		});
	}
}
