var express = require('express');
var router = express.Router();
var rondasDb = require("./rondas_db_mysql");

// GetRondas
// Devuelve una lista de objetos con todos los rondas de la 
// base de datos.
// Si en la url se le pasa un nombre devuelve aquellos rondas
// que lo contengan.
router.get('/', function(req, res) {
    var nombre = req.query.nombre;
    if (nombre) {
        rondasDb.getRondasBuscar(nombre, function(err, rondas) {
            if (err) {
                res.status(500).send(err.message);
            } else {
                res.json(rondas);
            }
        });

    } else {
        rondasDb.getRondas(function(err, rondas) {
            if (err) {
                res.status(500).send(err.message);
            } else {
                res.json(rondas);
            }
        });
    }
});

// GetRonda
// devuelve el ronda con el id pasado
router.get('/:rondaId', function(req, res) {
    rondasDb.getRonda(req.params.rondaId, function(err, ronda) {
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


// getRondaDetalleTag
// devuelve el ronda con con el tag pasado
router.get('/tags/:tag', function(req, res) {
    rondasDb.getRondaDetalleTag(req.params.tag, function(err, ronda) {
        if (err) {
            res.status(500).send(err.message);
        } else {
            res.json(ronda);
        }
    });
});

// GetRondaDetalle
// devuelve el ronda con el id pasado
// junto con sus puntos asociados
router.get('/detalle/:rondaId', function(req, res) {
    rondasDb.getRondaDetalle(req.params.rondaId, function(err, ronda) {
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

// GetPuntoRondaPorOrden
// sirveo para conocer si en la ronda ya hay un punto conn ese orden
router.get('/puntos/:rondaId/:orden', function(req,res){
    var rondaId = req.params.rondaId;
    var orden = req.params.orden;
    rondasDb.getPuntoRondaPorOrden(rondaId, orden, function(err, punto){
        if (err) {
            res.status(500).send(err.message);
        } else {
            res.json(punto);
        }        
    });
});
// PostRonda
// permite dar de alta un ronda
router.post('/', function(req, res) {
    rondasDb.postRonda(req.body.ronda, function(err, ronda) {
        if (err) {
            res.status(500).send(err.message);
        } else {
            res.json(ronda);
        }
    });
});

// PostPuntoRonda
// permite dar el punto en una ronda
router.post('/puntos', function(req, res) {
    rondasDb.postPuntoRonda(req.body.puntoRonda, function(err, puntoRonda) {
        if (err) {
            res.status(500).send(err.message);
        } else {
            res.json(puntoRonda);
        }
    });
});



// PutRonda
// modifica el ronda con el id pasado
router.put('/:rondaId', function(req, res) {
    // antes de modificar comprobamos que el objeto existe
    rondasDb.getRonda(req.params.rondaId, function(err, ronda) {
        if (err) {
            res.status(500).send(err.message);
        } else {
            if (ronda == null) {
                res.status(404).send("Ronda no encontrado");
            } else {
                // ya sabemos que existe y lo intentamos modificar.
                rondasDb.putRonda(req.params.rondaId, req.body.ronda, function(err, ronda) {
                    if (err) {
                        res.status(500).send(err.message);
                    } else {
                        res.json(ronda);
                    }
                });
            }
        }
    });
});

// DeleteRonda
// elimina un ronda de la base de datos
router.delete('/:rondaId', function(req, res) {
    var ronda = req.body.ronda;
    rondasDb.deleteRonda(req.params.rondaId, ronda, function(err, ronda) {
        if (err) {
            res.status(500).send(err.message);
        } else {
            res.json(null);
        }
    });
});

// DeletePuntoRonda
// elimina un punto de una ronda en la base de datos
router.delete('/puntos/:rondaPuntoId/:rondaId/:orden', function(req, res) {
    var rondaPuntoId = req.params.rondaPuntoId;
    var rondaId = req.params.rondaId;
    var orden = req.params.orden;
    if (!rondaPuntoId || !rondaId || !orden){
        res.status(400).send("Parámetros incorrectos");
    }
    rondasDb.deletePuntoRonda(rondaPuntoId, rondaId, orden, function(err, puntoRonda) {
        if (err) {
            res.status(500).send(err.message);
        } else {
            res.json(null);
        }
    });
});


// Exports
module.exports = router;
