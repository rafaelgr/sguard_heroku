/*-------------------------------------------
Controlador encargado de los informes
--------------------------------------------*/
var express = require('express');
var router = express.Router();
var informesDb = require("./informes_db_mysql");

router.get('/rondas', function(req, res) {
    var dFecha = req.query.dfecha;
    var hFecha = req.query.hfecha;
    var dHora = req.query.dhora;
    var hHora = req.query.hhora;
    if (!dHora) {
        dHora = "*";
    }
    if (!hHora) {
        hHora = "*";
    }
    // comprobamos que nos han pasado los parámetros que corresponden
    if (!dFecha || !hFecha) {
        // si no es así devolvemos un error indicándolo
        res.status(401).send("Parámetros incorrectos");
        return;
    }
    informesDb.getRondas(dFecha, hFecha, dHora, hHora, function(err, reg) {
        if (err) {
            res.status(500).send(err.message);
        } else {
            res.json(reg);
        }
    });
});

router.get('/rondas/ano', function(req, res) {
    var ano = req.query.ano;
    if (!ano) {
        // si no es así devolvemos un error indicándolo
        res.status(400).send("Parámetros incorrectos");
        return;
    }
    informesDb.getComparativoRondasAnual(ano, function(err, reg) {
        if (err) {
            res.status(500).send(err.message);
        } else {
            res.json(reg);
        }
    });
});

router.get('/rondas/general', function(req, res) {
    var dFecha = req.query.dfecha;
    var hFecha = req.query.hfecha;
    var ronda = req.query.ronda;
    var vigilante = req.query.vigilante;
    var terminal = req.query.terminal;
    var dHora = req.query.dhora;
    var hHora = req.query.hhora;
    if (!dHora) {
        dHora = "*";
    }
    if (!hHora) {
        hHora = "*";
    }
    // comprobamos que nos han pasado los parámetros que corresponden
    if (!dFecha || !hFecha) {
        // si no es así devolvemos un error indicándolo
        res.status(401).send("Parámetros incorrectos");
        return;
    }
    if (!ronda) {
        ronda = "*";
    }
    if (!vigilante) {
        vigilante = "*";
    }
    if (!terminal) {
        terminal = "*";
    }
    informesDb.getGeneral(ronda, vigilante, terminal, dFecha, hFecha, dHora, hHora, function(err, reg) {
        if (err) {
            res.status(500).send(err.message);
        } else {
            res.json(reg);
        }
    });
});

router.get('/rondas/vigilante', function(req, res) {
    var vigilanteId = req.query.vigilanteId;
    var dFecha = req.query.dfecha;
    var hFecha = req.query.hfecha;
    var dHora = req.query.dhora;
    var hHora = req.query.hhora;
    if (!dHora) {
        dHora = "*";
    }
    if (!hHora) {
        hHora = "*";
    }
    // comprobamos que nos han pasado los parámetros que corresponden
    if (!dFecha || !hFecha || !vigilanteId) {
        // si no es así devolvemos un error indicándolo
        res.status(401).send("Parámetros incorrectos");
        return;
    }
    informesDb.getRondasVigilante(vigilanteId, dFecha, hFecha, dHora, hHora, function(err, reg) {
        if (err) {
            res.status(500).send(err.message);
        } else {
            res.json(reg);
        }
    });
});

router.get('/rondas/terminal', function(req, res) {
    var terminalId = req.query.terminalId;
    var dFecha = req.query.dfecha;
    var hFecha = req.query.hfecha;
    var dHora = req.query.dhora;
    var hHora = req.query.hhora;
    if (!dHora) {
        dHora = "*";
    }
    if (!hHora) {
        hHora = "*";
    }    
    // comprobamos que nos han pasado los parámetros que corresponden
    if (!dFecha || !hFecha || !terminalId) {
        // si no es así devolvemos un error indicándolo
        res.status(401).send("Parámetros incorrectos");
        return;
    }
    informesDb.getRondasTerminal(terminalId, dFecha, hFecha, dHora, hHora, function(err, reg) {
        if (err) {
            res.status(500).send(err.message);
        } else {
            res.json(reg);
        }
    });
});


router.get('/rondas/punto', function(req, res) {
    var puntoId = req.query.puntoId;
    var dFecha = req.query.dfecha;
    var hFecha = req.query.hfecha;
    var dHora = req.query.dhora;
    var hHora = req.query.hhora;
    if (!dHora) {
        dHora = "*";
    }
    if (!hHora) {
        hHora = "*";
    }    
    // comprobamos que nos han pasado los parámetros que corresponden
    if (!dFecha || !hFecha || !puntoId) {
        // si no es así devolvemos un error indicándolo
        res.status(401).send("Parámetros incorrectos");
        return;
    }
    informesDb.getRondasPunto(puntoId, dFecha, hFecha, dHora, hHora, function(err, reg) {
        if (err) {
            res.status(500).send(err.message);
        } else {
            res.json(reg);
        }
    });
});

// Exports
module.exports = router;
