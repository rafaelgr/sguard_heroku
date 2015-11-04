var express = require('express');
var router = express.Router();
var puntosDb = require("./puntos_db_mysql");

// GetPuntos
// Devuelve una lista de objetos con todos los puntos de la 
// base de datos.
// Si en la url se le pasa un nombre devuelve aquellos puntos
// que lo contengan.
router.get('/', function(req, res) {
    var nombre = req.query.nombre;
    if (nombre) {
        puntosDb.getPuntosBuscar(nombre, function(err, puntos) {
            if (err) {
                res.status(500).send(err.message);
            } else {
                res.json(puntos);
            }
        });

    } else {
        puntosDb.getPuntos(function(err, puntos) {
            if (err) {
                res.status(500).send(err.message);
            } else {
                res.json(puntos);
            }
        });
    }
});

// GetPunto
// devuelve el punto con el id pasado
router.get('/:puntoId', function(req, res) {
    puntosDb.getPunto(req.params.puntoId, function(err, punto) {
        if (err) {
            res.status(500).send(err.message);
        } else {
            if (punto == null) {
                res.status(404).send("Punto no encontrado");
            } else {
                res.json(punto);
            }
        }
    });
});


// GetPuntosEdificios
// devuelve el punto con el id pasado
router.get('/edificios/:edificioId', function(req, res) {
    puntosDb.getPuntosEdificiosBuscar(req.params.edificioId, function(err, puntos) {
        if (err) {
            res.status(500).send(err.message);
        } else {
            res.json(puntos);
        }
    });
});

// PostPunto
// permite dar de alta un punto
router.post('/', function(req, res) {
    puntosDb.postPunto(req.body.punto, function(err, punto) {
        if (err) {
            res.status(500).send(err.message);
        } else {
            res.json(punto);
        }
    });
});



// PutPunto
// modifica el punto con el id pasado
router.put('/:puntoId', function(req, res) {
    // antes de modificar comprobamos que el objeto existe
    puntosDb.getPunto(req.params.puntoId, function(err, punto) {
        if (err) {
            res.status(500).send(err.message);
        } else {
            if (punto == null) {
                res.status(404).send("Punto no encontrado");
            } else {
                // ya sabemos que existe y lo intentamos modificar.
                puntosDb.putPunto(req.params.puntoId, req.body.punto, function(err, punto) {
                    if (err) {
                        res.status(500).send(err.message);
                    } else {
                        res.json(punto);
                    }
                });
            }
        }
    });
});

// DeletePunto
// elimina un punto de la base de datos
router.delete('/:puntoId', function(req, res) {
    var punto = req.body.punto;
    puntosDb.deletePunto(req.params.puntoId, punto, function(err, punto) {
        if (err) {
            res.status(500).send(err.message);
        } else {
            res.json(null);
        }
    });
});

// Exports
module.exports = router;
