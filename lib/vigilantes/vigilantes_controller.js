var express = require('express');
var router = express.Router();
var vigilantesDb = require("./vigilantes_db_mysql");

// GetVigilantes
// Devuelve una lista de objetos con todos los vigilantes de la 
// base de datos.
// Si en la url se le pasa un nombre devuelve aquellos vigilantes
// que lo contengan.
router.get('/', function(req, res) {
    var nombre = req.query.nombre;
    if (nombre) {
        vigilantesDb.getVigilantesBuscar(nombre, function(err, vigilantes) {
            if (err) {
                res.status(500).send(err.message);
            } else {
                res.json(vigilantes);
            }
        });

    } else {
        vigilantesDb.getVigilantes(function(err, vigilantes) {
            if (err) {
                res.status(500).send(err.message);
            } else {
                res.json(vigilantes);
            }
        });
    }
});

// GetVigilanteBuscarTag
// devuelve el vigilante con el tag pasado
router.get('/tags/:tag', function(req, res) {
    vigilantesDb.getVigilantesBuscarTag(req.params.tag, function(err, vigilantes) {
        if (err) {
            res.status(500).send(err.message);
        } else {
            res.json(vigilantes);
        }
    });
});

// GetVigilante
// devuelve el vigilante con el id pasado
router.get('/:vigilanteId', function(req, res) {
    vigilantesDb.getVigilante(req.params.vigilanteId, function(err, vigilante) {
        if (err) {
            res.status(500).send(err.message);
        } else {
            if (vigilante == null) {
                res.status(404).send("Vigilante no encontrado");
            } else {
                res.json(vigilante);
            }
        }
    });
});


// PostVigilante
// permite dar de alta un vigilante
router.post('/', function(req, res) {
    vigilantesDb.postVigilante(req.body.vigilante, function(err, vigilante) {
        if (err) {
            res.status(500).send(err.message);
        } else {
            res.json(vigilante);
        }
    });
});



// PutVigilante
// modifica el vigilante con el id pasado
router.put('/:vigilanteId', function(req, res) {
    // antes de modificar comprobamos que el objeto existe
    vigilantesDb.getVigilante(req.params.vigilanteId, function(err, vigilante) {
        if (err) {
            res.status(500).send(err.message);
        } else {
            if (vigilante == null) {
                res.status(404).send("Vigilante no encontrado");
            } else {
                // ya sabemos que existe y lo intentamos modificar.
                vigilantesDb.putVigilante(req.params.vigilanteId, req.body.vigilante, function(err, vigilante) {
                    if (err) {
                        res.status(500).send(err.message);
                    } else {
                        res.json(vigilante);
                    }
                });
            }
        }
    });
});

// DeleteVigilante
// elimina un vigilante de la base de datos
router.delete('/:vigilanteId', function(req, res) {
    var vigilante = req.body.vigilante;
    vigilantesDb.deleteVigilante(req.params.vigilanteId, vigilante, function(err, vigilante) {
        if (err) {
            res.status(500).send(err.message);
        } else {
            res.json(null);
        }
    });
});

// Exports
module.exports = router;
