var express = require('express');
var router = express.Router();
var gruposDb = require("./grupos_db_mysql");

// GetGrupos
// Devuelve una lista de objetos con todos los grupos de la 
// base de datos.
// Si en la url se le pasa un nombre devuelve aquellos grupos
// que lo contengan.
router.get('/', function(req, res) {
    var nombre = req.query.nombre;
    if (nombre) {
        gruposDb.getGruposBuscar(nombre, function(err, grupos) {
            if (err) {
                res.status(500).send(err.message);
            } else {
                res.json(grupos);
            }
        });

    } else {
        gruposDb.getGrupos(function(err, grupos) {
            if (err) {
                res.status(500).send(err.message);
            } else {
                res.json(grupos);
            }
        });
    }
});

// GetGrupo
// devuelve el grupo con el id pasado
router.get('/:grupoId', function(req, res) {
    gruposDb.getGrupo(req.params.grupoId, function(err, grupo) {
        if (err) {
            res.status(500).send(err.message);
        } else {
            if (grupo == null) {
                res.status(404).send("Grupo no encontrado");
            } else {
                res.json(grupo);
            }
        }
    });
});

// Login
// comprueba si hay algún grupo con el login y password pasados
// si lo encuentra lo devuelve como objeto, si no devuelve nulo.
router.post('/login', function(req, res){
    gruposDb.loginGrupos(req.body.grupo, function(err, grupo){
        if (err){
            res.status(500).send(err.message);
        }else{
            if (grupo == null) {
                res.status(404).send("Login o contraseña incorrectos");
            } else {
                res.json(grupo);
            }
        }
    });
});

// PostGrupo
// permite dar de alta un grupo
router.post('/', function(req, res) {
    gruposDb.postGrupo(req.body.grupo, function(err, grupo) {
        if (err) {
            res.status(500).send(err.message);
        } else {
            res.json(grupo);
        }
    });
});



// PutGrupo
// modifica el grupo con el id pasado
router.put('/:grupoId', function(req, res) {
    // antes de modificar comprobamos que el objeto existe
    gruposDb.getGrupo(req.params.grupoId, function(err, grupo) {
        if (err) {
            res.status(500).send(err.message);
        } else {
            if (grupo == null) {
                res.status(404).send("Grupo no encontrado");
            } else {
                // ya sabemos que existe y lo intentamos modificar.
                gruposDb.putGrupo(req.params.grupoId, req.body.grupo, function(err, grupo) {
                    if (err) {
                        res.status(500).send(err.message);
                    } else {
                        res.json(grupo);
                    }
                });
            }
        }
    });
});

// DeleteGrupo
// elimina un grupo de la base de datos
router.delete('/:grupoId', function(req, res) {
    var grupo = req.body.grupo;
    gruposDb.deleteGrupo(req.params.grupoId, grupo, function(err, grupo) {
        if (err) {
            res.status(500).send(err.message);
        } else {
            res.json(null);
        }
    });
});

// Exports
module.exports = router;