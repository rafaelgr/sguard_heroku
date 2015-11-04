// version controller
// simplemente muestra la versión de programa
var express = require('express');
var router = express.Router();
var package = require('../../package.json')

router.get('/', function(req, res) {
    var message = "VRS: " + package.version;
    var version = {
    	version: message
    };
    res.json(version);
});

module.exports = router;
