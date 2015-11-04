var express = require('express');
var router = express.Router();
var terminalesDb = require("./terminales_db_mysql");

// GetTerminales
// Devuelve una lista de objetos con todos los terminales de la 
// base de datos.
// Si en la url se le pasa un numero devuelve aquellos que terminales
// que lo contengan.
router.get('/', function(req, res) {
    var numero = req.query.numero;
    if (numero) {
        terminalesDb.getTerminalesBuscar(numero, function(err, terminales) {
            if (err) {
                res.status(500).send(err.message);
            } else {
                res.json(terminales);
            }
        });

    } else {
        terminalesDb.getTerminales(function(err, terminales) {
            if (err) {
                res.status(500).send(err.message);
            } else {
                res.json(terminales);
            }
        });
    }
});

// GetTerminal
// devuelve el terminal con el id pasado
router.get('/:terminalId', function(req, res) {
    terminalesDb.getTerminal(req.params.terminalId, function(err, terminal) {
        if (err) {
            res.status(500).send(err.message);
        } else {
            if (terminal == null) {
                res.status(404).send("Terminal no encontrado");
            } else {
                res.json(terminal);
            }
        }
    });
});

// PostTerminal
// permite dar de alta un terminal
router.post('/', function(req, res) {
    terminalesDb.postTerminal(req.body.terminal, function(err, terminal) {
        if (err) {
            res.status(500).send(err.message);
        } else {
            res.json(terminal);
        }
    });
});



// PutTerminal
// modifica el terminal con el id pasado
router.put('/:terminalId', function(req, res) {
    // antes de modificar comprobamos que el objeto existe
    terminalesDb.getTerminal(req.params.terminalId, function(err, terminal) {
        if (err) {
            res.status(500).send(err.message);
        } else {
            if (terminal == null) {
                res.status(404).send("Terminal no encontrado");
            } else {
                // ya sabemos que existe y lo intentamos modificar.
                terminalesDb.putTerminal(req.params.terminalId, req.body.terminal, function(err, terminal) {
                    if (err) {
                        res.status(500).send(err.message);
                    } else {
                        res.json(terminal);
                    }
                });
            }
        }
    });
});

// DeleteTerminal
// elimina un terminal de la base de datos
router.delete('/:terminalId', function(req, res) {
    var terminal = req.body.terminal;
    terminalesDb.deleteTerminal(req.params.terminalId, terminal, function(err, terminal) {
        if (err) {
            res.status(500).send(err.message);
        } else {
            res.json(null);
        }
    });
});

// Exports
module.exports = router;