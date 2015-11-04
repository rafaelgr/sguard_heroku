var express = require('express');
var router = express.Router();
var edificiosDb = require("./edificios_db_mysql");

// GetEdificios
// Devuelve una lista de objetos con todos los edificios de la 
// base de datos.
// Si en la url se le pasa un nombre devuelve aquellos edificios
// que lo contengan.
router.get('/', function(req, res) {
    var nombre = req.query.nombre;
    if (nombre) {
        edificiosDb.getEdificiosBuscar(nombre, function(err, edificios) {
            if (err) {
                res.status(500).send(err.message);
            } else {
                res.json(edificios);
            }
        });

    } else {
        edificiosDb.getEdificios(function(err, edificios) {
            if (err) {
                res.status(500).send(err.message);
            } else {
                res.json(edificios);
            }
        });
    }
});

// GetEdificio
// devuelve el edificio con el id pasado
router.get('/:edificioId', function(req, res) {
    edificiosDb.getEdificio(req.params.edificioId, function(err, edificio) {
        if (err) {
            res.status(500).send(err.message);
        } else {
            if (edificio == null) {
                res.status(404).send("Edificio no encontrado");
            } else {
                res.json(edificio);
            }
        }
    });
});

// GetEdificioBuscarGrupo
// devuelve los edificios del grupo pasado
router.get('/grupos/:grupoId', function(req, res) {
    edificiosDb.getEdificiosBuscarGrupo(req.params.grupoId, function(err, edificio) {
        if (err) {
            res.status(500).send(err.message);
        } else {
            if (edificio == null) {
                res.status(404).send("Edificio no encontrado");
            } else {
                res.json(edificio);
            }
        }
    });
});


// PostEdificio
// permite dar de alta un edificio
router.post('/', function(req, res) {
    edificiosDb.postEdificio(req.body.edificio, function(err, edificio) {
        if (err) {
            res.status(500).send(err.message);
        } else {
            res.json(edificio);
        }
    });
});



// PutEdificio
// modifica el edificio con el id pasado
router.put('/:edificioId', function(req, res) {
    // antes de modificar comprobamos que el objeto existe
    edificiosDb.getEdificio(req.params.edificioId, function(err, edificio) {
        if (err) {
            res.status(500).send(err.message);
        } else {
            if (edificio == null) {
                res.status(404).send("Edificio no encontrado");
            } else {
                // ya sabemos que existe y lo intentamos modificar.
                edificiosDb.putEdificio(req.params.edificioId, req.body.edificio, function(err, edificio) {
                    if (err) {
                        res.status(500).send(err.message);
                    } else {
                        res.json(edificio);
                    }
                });
            }
        }
    });
});

// DeleteEdificio
// elimina un edificio de la base de datos
router.delete('/:edificioId', function(req, res) {
    var edificio = req.body.edificio;
    edificiosDb.deleteEdificio(req.params.edificioId, edificio, function(err, edificio) {
        if (err) {
            res.status(500).send(err.message);
        } else {
            res.json(null);
        }
    });
});

// Exports
module.exports = router;