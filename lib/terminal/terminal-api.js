// terminal-api.js
var bridge = require('./terminal-bridge.js');

module.exports.readTerminalNumber = function (req, res) {
	bridge.readTerminalNumber(function(err, result){
		if (err){
			res.status(500).send(err.message);
		}else{
			res.json(result);
		}
	});
}

module.exports.getRecords = function (req, res) {
	bridge.getRecords(function(err, result){
		if (err){
			res.status(500).send(err.message);
		}else{
			res.json(result);
		}
	});
}

module.exports.deleteRecords = function (req, res) {
	bridge.deleteRecords(function(err, result){
		if (err){
			res.status(500).send(err.message);
		}else{
			res.json(result);
		}
	});
}


module.exports.setDateTime = function (req, res) {
	bridge.setDateTime(function(err, result){
		if (err){
			res.status(500).send(err.message);
		}else{
			res.json(result);
		}
	});
}
