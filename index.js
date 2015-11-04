//=======================================
// WM500V2 (index.js)
// API to communicate to WM500V2 terminals via USB
//========================================
// Author: Rafael Garcia (rafa@myariadna.com)
// 2015 [License CC-BY-NC-4.0]


// required modules
var fs = require('fs');
var express = require('express');
var bodyParser = require('body-parser');
var cors = require('cors');

// api support
var terminalApi = require('./lib/terminal/terminal-api');
var administradores_router = require('./lib/administradores/administradores_controller');
var version_router = require('./lib/version/version_controller');
var vigilantes_router = require('./lib/vigilantes/vigilantes_controller');
var puntos_router = require('./lib/puntos/puntos_controller');
var rondas_router = require('./lib/rondas/rondas_controller');
var rondas_realizadas_router = require('./lib/rondas_realizadas/rondas_realizadas_controller');
var grupos_router = require('./lib/grupos/grupos_controller');
var edificios_router = require('./lib/edificios/edificios_controller');
var descargas_router = require('./lib/descargas/descargas_controller');
var informes_router = require('./lib/informes/informes_controller');
var terminales_router = require('./lib/terminales/terminales_controller');

// read app parameters (host and port for the API)
var config = require('./config.json');


// starting express
var app = express();
// to parse body content
app.use(bodyParser.urlencoded({
    extended: true
}));

app.use(bodyParser.json());

// using cors for cross class
app.use(cors());

// servidor html estático
app.use(express.static(__dirname+"/public"));


// mounting routes
var router = express.Router();

// -- common to all routes
router.use(function(req, res, next) {
    // go on (by now)
    next();
});


// -- general GET (to know if the server is up and runnig)
router.get('/', function(req, res) {
    res.json('SGUARD API / SERVER -- runnig');
});



// -- TERMINAL --------------
router.route('/terminal/read-terminal-number')
    .get(terminalApi.readTerminalNumber);

router.route('/terminal/records')
    .get(terminalApi.getRecords)
    .delete(terminalApi.deleteRecords);

router.route('/terminal/set-date-time')
    .post(terminalApi.setDateTime);

// -- registering routes
app.use('/api', router);
app.use('/api/administradores', administradores_router);
app.use('/api/version', version_router);
app.use('/api/vigilantes', vigilantes_router);
app.use('/api/puntos', puntos_router);
app.use('/api/rondas', rondas_router);
app.use('/api/rondas-realizadas', rondas_realizadas_router);
app.use('/api/grupos', grupos_router);
app.use('/api/edificios', edificios_router);
app.use('/api/descargas', descargas_router);
app.use('/api/informes', informes_router);
app.use('/api/terminales', terminales_router);


// -- start server
app.listen(config.apiPort);

// -- console message
console.log('SGUARD API / SERVER on port: ' + config.apiPort);
