var express = require('express');
var router = express.Router();
var rondasDb = require("./rondas_realizadas_db_mysql");

// GetRondasRealizadas
// Devuelve una lista de objetos con todos los rondas de la 
// base de datos.
// Si en la url se le pasa un nombre devuelve aquellos rondas
// que lo contengan.
router.get('/', function(req, res) {
    var nombre = req.query.nombre;
    if (nombre) {
        rondasDb.getRondasRealizadasBuscar(nombre, function(err, rondas) {
            if (err) {
                res.status(500).send(err.message);
            } else {
                res.json(rondas);
            }
        });

    } else {
        rondasDb.getRondasRealizadas(function(err, rondas) {
            if (err) {
                res.status(500).send(err.message);
            } else {
                res.json(rondas);
            }
        });
    }
});

router.get('/novalidadas', function(req, res) {
    rondasDb.getRondasRealizadasNoValidadas(function(err, rondas) {
        if (err) {
            res.status(500).send(err.message);
        } else {
            res.json(rondas);
        }
    });
});


// GetRondaRealizada
// devuelve el ronda con el id pasado
router.get('/:rondaRealizadaId', function(req, res) {
    rondasDb.getRondaRealizada(req.params.rondaRealizadaId, function(err, ronda) {
        if (err) {
            res.status(500).send(err.message);
        } else {
            if (ronda == null) {
                res.status(404).send("Ronda no encontrado");
            } else {
                res.json(ronda);
            }
        }
    });
});

// GetRondaRealizadaDetalle
// devuelve el ronda con el id pasado
// junto con sus puntos asociados
router.get('/detalle/:rondaRealizadaId', function(req, res) {
    rondasDb.getRondaRealizadaDetalle(req.params.rondaRealizadaId, function(err, rondaRealizada) {
        if (err) {
            res.status(500).send(err.message);
        } else {
            if (rondaRealizada == null) {
                res.status(404).send("Ronda no encontrado");
            } else {
                res.json(rondaRealizada);
            }
        }
    });
});


// GetRondaRealizadaDetalle
// devuelve el ronda con el id pasado
// junto con sus puntos asociados
router.get('/punto-check/:puntoId', function(req, res) {
    rondasDb.getPuntosRondaRealizadaCheck(req.params.puntoId, function(err, checks) {
        if (err) {
            res.status(500).send(err.message);
        } else {
            res.json(checks);
        }
    });
});

// PostRondaRealizada
// permite dar de alta un ronda
router.post('/', function(req, res) {
    rondasDb.postRondaRealizada(req.body.rondaRealizada, function(err, rondaRealizada) {
        if (err) {
            res.status(500).send(err.message);
        } else {
            res.json(rondaRealizada);
        }
    });
});

// PostRondaRealizadaDesdeTag
// permite dar de alta un ronda realizada con sus puntos pasando su tag, fecha, hora y vigilanteId
router.post('/tags/:tag', function(req, res) {
    var tag = req.params.tag;
    var fecha = req.query.fecha;
    var hora = req.query.hora;
    var vigilanteId = req.query.vigilanteId;
    if (!tag || !fecha || !hora || !vigilanteId) {
        res.status(500).send("Faltan parámetros en la peticion");
        return;
    }
    rondasDb.postRondaRealizadaDesdeTag(tag, fecha, hora, vigilanteId, null, function(err, rondaRealizada) {
        if (err) {
            res.status(500).send(err.message);
        } else {
            res.json(rondaRealizada);
        }
    });
});


// PostPuntoRonda
// permite dar el punto en una ronda
/* --
router.post('/puntos', function(req, res) {
    rondasDb.postPuntoRonda(req.body.puntoRonda, function(err, puntoRonda) {
        if (err) {
            res.status(500).send(err.message);
        } else {
            res.json(puntoRonda);
        }
    });
});
--*/



// PutRondaRealizada
// modifica el ronda con el id pasado
router.put('/:rondaRealizadaId', function(req, res) {
    // antes de modificar comprobamos que el objeto existe
    rondasDb.getRondaRealizada(req.params.rondaRealizadaId, function(err, rondaRealizada) {
        if (err) {
            res.status(500).send(err.message);
        } else {
            if (rondaRealizada == null) {
                res.status(404).send("Ronda no encontrado");
            } else {
                // ya sabemos que existe y lo intentamos modificar.
                rondasDb.putRondaRealizada(req.params.rondaRealizadaId, req.body.rondaRealizada, function(err, rondaRealizada) {
                    if (err) {
                        res.status(500).send(err.message);
                    } else {
                        res.json(rondaRealizada);
                    }
                });
            }
        }
    });
});

// DeleteRondaRealizada
// elimina un ronda de la base de datos
router.delete('/:rondaRealizadaId', function(req, res) {
    var rondaRealizada = req.body.rondaRealizada;
    rondasDb.deleteRondaRealizada(req.params.rondaRealizadaId, rondaRealizada, function(err, rondaRealizada) {
        if (err) {
            res.status(500).send(err.message);
        } else {
            res.json(null);
        }
    });
});

// DeletePuntoRonda
// elimina un punto de una ronda en la base de datos
/* --
router.delete('/puntos/:rondaPuntoId', function(req, res) {
    var ronda = req.body.puntoRonda;
    rondasDb.deletePuntoRonda(req.params.rondaPuntoId, function(err, puntoRonda) {
        if (err) {
            res.status(500).send(err.message);
        } else {
            res.json(null);
        }
    });
});
--*/

// Exports
module.exports = router;
