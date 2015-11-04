var express = require('express');
var router = express.Router();
var descargasDb = require("./descargas_db_mysql");

// GetDescarga del terminal
router.get('/leer-terminal', function(req, res) {
    descargasDb.getDescargaDelTerminal(function(err, result) {
        if (err) {
            res.status(500).send(err.message);
        } else {
            res.json(result);
        }
    });
});

// GetDescarga del terminal
router.get('/leer-descarga/:descargaId', function(req, res) {
    descargasDb.getDescargaDetalle(req.params.descargaId, function(err, result) {
        if (err) {
            res.status(500).send(err.message);
        } else {
            res.json(result);
        }
    });
});

// GetDescarga del terminal
router.get('/procesar-descarga/:descargaId', function(req, res) {
    descargasDb.procesarDescarga(req.params.descargaId, function(err, result) {
        if (err) {
            res.status(500).send(err.message);
        } else {
            res.json(result);
        }
    });
});


router.get('/', function(req, res) {
    var numero = req.query.numero;
    if (numero) {
        descargasDb.getDescargasBuscar(numero, function(err, descargas) {
            if (err) {
                res.status(500).send(err.message);
            } else {
                res.json(descargas);
            }
        });

    } else {
        descargasDb.getDescargas(function(err, descargas) {
            if (err) {
                res.status(500).send(err.message);
            } else {
                res.json(descargas);
            }
        });
    }
});

// Exports
module.exports = router;
