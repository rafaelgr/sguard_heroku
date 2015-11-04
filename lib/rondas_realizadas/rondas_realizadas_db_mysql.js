// rondas_realizadas__db_mysql
// Manejo de la tabla rondas en la base de datos
var mysql = require("mysql"); // librería para el acceso a bases de datos MySQL
var async = require("async"); // librería para el manejo de llamadas asíncronas en JS

var rondasDb = require("../rondas/rondas_db_mysql");
//  leer la configurción de MySQL
var config = require("../../configMySQL.json");
var sql = "";

// getConnection 
// función auxiliar para obtener una conexión al servidor
// de base de datos.
function getConnection() {
    var connection = mysql.createConnection({
        host: config.host,
        user: config.user,
        password: config.password,
        database: config.database,
        port: config.port
    });
    connection.connect(function(err) {
        if (err) throw err;
    });
    return connection;
}

// closeConnection
// función auxiliar para cerrar una conexión
function closeConnection(connection) {
    connection.end(function(err) {
        if (err) {
            throw err;
        }
    });
}

function closeConnectionCallback(connection, callback) {
    connection.end(function(err) {
        if (err) callback(err);
    });
}

// comprobarRondaRealizada
// comprueba que tiene la estructura de objeto mínima
// necesaria para guardarlo en la base de datos
// Por ejemplo, que es del tipo correcto y tiene los atributos 
// adecuados.
function comprobarRondaRealizada(rondaRealizada) {
    // debe ser objeto del tipo que toca
    var comprobado = "object" === typeof rondaRealizada;
    // en estas propiedades no se admiten valores nulos
    comprobado = (comprobado && rondaRealizada.hasOwnProperty("rondaRealizadaId"));
    comprobado = (comprobado && rondaRealizada.hasOwnProperty("fecha"));
    comprobado = (comprobado && rondaRealizada.hasOwnProperty("hora"));
    return comprobado;
}


// comprobarPuntoRondaRealizada
// comprueba que tiene la estructura de objeto mínima
// necesaria para guardarlo en la base de datos
// Por ejemplo, que es del tipo correcto y tiene los atributos 
// adecuados.
function comprobarPuntoRondaRealizada(puntoRondaRealizada) {
    // debe ser objeto del tipo que toca
    var comprobado = "object" === typeof puntoRondaRealizada;
    // en estas propiedades no se admiten valores nulos
    comprobado = (comprobado && puntoRondaRealizada.hasOwnProperty("rondaRealizadaPuntoId"));
    comprobado = (comprobado && puntoRondaRealizada.hasOwnProperty("fecha"));
    comprobado = (comprobado && puntoRondaRealizada.hasOwnProperty("hora"));
    return comprobado;
}

// getrondasRealizadas
// lee todos los registros de la tabla rondas realizdas y
// los devuelve como una lista de objetos
module.exports.getRondasRealizadas = function(callback) {
    var connection = getConnection();
    var rondas = null;
    sql = "SELECT * FROM rondas_realizadas";
    connection.query(sql, function(err, result) {
        if (err) {
            callback(err, null);
            return;
        }
        rondas = result;
        callback(null, rondas);
    });
    closeConnectionCallback(connection, callback);
}


// getrondasRealizdasBuscar
// lee todos los registros de la tabla rondas cuyo
// nombre contiene la cadena de búsqueda. Si la cadena es '*'
// devuelve todos los registros
module.exports.getRondasRealizadasBuscar = function(nombre, callback) {
    var connection = getConnection();
    var rondas = null;
    sql = "SELECT rr.*, r.nombre AS rnombre, v.nombre AS vnombre";
    sql += " FROM rondas_realizadas AS rr";
    sql += " LEFT JOIN rondas AS r ON r.rondaId = rr.rondaId";
    sql += " LEFT JOIN vigilantes AS v ON v.vigilanteId = rr.vigilanteId";
    if (nombre !== "*") {
        sql += " WHERE rnombre LIKE ?";
        sql = mysql.format(sql, '%' + nombre + '%');
    }
    sql += " ORDER BY rr.fecha DESC, rr.hora"
    connection.query(sql, function(err, result) {
        if (err) {
            callback(err, null);
            return;
        }
        rondas = result;
        callback(null, rondas);
    });
    closeConnectionCallback(connection, callback);
}

// getrondasRealizdasNoValiadadas
// lee todos los registros de la tabla rondas
// con valor validada = 0
module.exports.getRondasRealizadasNoValidadas = function(callback) {
    var connection = getConnection();
    var rondas = null;
    sql = "SELECT rr.*, r.nombre AS rnombre, v.nombre AS vnombre";
    sql += " FROM rondas_realizadas AS rr";
    sql += " LEFT JOIN rondas AS r ON r.rondaId = rr.rondaId";
    sql += " LEFT JOIN vigilantes AS v ON v.vigilanteId = rr.vigilanteId";
    sql += " WHERE rr.validada = 0";
    sql += " ORDER BY rr.fecha DESC, rr.hora"
    connection.query(sql, function(err, result) {
        if (err) {
            callback(err, null);
            return;
        }
        rondas = result;
        callback(null, rondas);
    });
    closeConnectionCallback(connection, callback);
}

// getRondaRealizada
// busca  el ronda con id pasado
module.exports.getRondaRealizada = function(id, callback) {
    var connection = getConnection();
    var rondas = null;
    sql = "SELECT rr.*, r.nombre AS rnombre, v.nombre AS vnombre";
    sql += " FROM rondas_realizadas AS rr";
    sql += " LEFT JOIN rondas AS r ON r.rondaId = rr.rondaId";
    sql += " LEFT JOIN vigilantes AS v ON v.vigilanteId = rr.vigilanteId";
    sql += " WHERE rr.rondaRealizadaId = ?";
    sql = mysql.format(sql, id);
    connection.query(sql, function(err, result) {
        if (err) {
            callback(err, null);
            return;
        }
        if (result.length == 0) {
            callback(null, null);
            return;
        }
        callback(null, result[0]);
    });
    closeConnectionCallback(connection, callback);
}

// getRondaRealizadaDetalle
// busca la ronda con el id pasado y devuelve la ronda
// con el detalle de sus puntos

module.exports.getRondaRealizadaDetalle = function(id, callback) {
    var connection = getConnection();
    var rondas = null;
    sql = "SELECT rr.*, r.nombre AS rnombre, v.nombre AS vnombre, rrp.rondaRealizadaPuntoId, rrp.orden, rrp.puntoId, rrp.tagleido, rrp.ordenleido,";
    sql += " p.nombre AS pnombre, rrp.fecha AS pfecha, rrp.hora AS phora, rrp.resultado AS presultado, t.terminalId, t.nombre as tnombre";
    sql += " FROM rondas_realizadas AS rr";
    sql += " LEFT JOIN rondas AS r ON r.rondaId = rr.rondaId";
    sql += " LEFT JOIN vigilantes AS v ON v.vigilanteId = rr.vigilanteId";
    sql += " LEFT JOIN rondas_realizadaspuntos AS rrp ON rrp.rondaRealizadaId = rr.rondaRealizadaId";
    sql += " LEFT JOIN puntos AS p ON p.puntoId = rrp.puntoId";
    sql += " LEFT JOIN terminales AS t ON t.terminalId = rr.terminalId";
    sql += " WHERE rr.rondaRealizadaId = ?"
    sql += " ORDER BY rrp.ordenleido"
    sql = mysql.format(sql, id);
    connection.query(sql, function(err, result) {
        if (err) {
            callback(err, null);
            return;
        }
        callback(null, fromDbtoJsRondaRealizada(result));
    });
    closeConnectionCallback(connection, callback);
}



// postRondaRealizada
// crear en la base de datos el ronda pasado
var fnPostPuntoRondaRealizada = function(puntoRondaRealizada, callback) {
    if (!comprobarPuntoRondaRealizada(puntoRondaRealizada)) {
        var err = new Error("La punto de ronda pasado es incorrecto, no es un objeto de este tipo o le falta algún atributo olbligatorio");
        callback(err);
        return;
    }
    var connection = getConnection();
    sql = "INSERT INTO rondas_realizadaspuntos SET ?";
    sql = mysql.format(sql, puntoRondaRealizada);
    connection.query(sql, function(err, result) {
        closeConnectionCallback(connection, callback);
        if (err) {
            callback(err);
            return;
        }
        puntoRondaRealizada.puntoRondaRealizadaId = result.insertId;
        callback(null, puntoRondaRealizada);
    });
};
module.exports.postPuntoRondaRealizada = fnPostPuntoRondaRealizada;


// postPuntoRondaRealizada
// crear en la base de datos el ronda pasado
var fnPostRondaRealizada = function(rondaRealizada, callback) {
    if (!comprobarRondaRealizada(rondaRealizada)) {
        var err = new Error("La ronda pasada es incorrecto, no es un objeto de este tipo o le falta algún atributo olbligatorio");
        callback(err);
        return;
    }
    var connection = getConnection();
    rondaRealizada.rondaRealizadaId = 0; // fuerza el uso de autoincremento
    sql = "INSERT INTO rondas_realizadas SET ?";
    sql = mysql.format(sql, rondaRealizada);
    connection.query(sql, function(err, result) {
        closeConnectionCallback(connection, callback);
        if (err) {
            callback(err);
            return;
        }
        rondaRealizada.rondaRealizadaId = result.insertId;
        callback(null, rondaRealizada);
    });
}

module.exports.postRondaRealizada = fnPostRondaRealizada;


// putRondaRealizada
// Modifica el ronda según los datos del objeto pasao
module.exports.putRondaRealizada = function(id, rondaRealizada, callback) {
    if (!comprobarRondaRealizada(rondaRealizada)) {
        var err = new Error("La ronda pasada es incorrecta, no es un objeto de este tipo o le falta algún atributo olbligatorio");
        callback(err);
        return;
    }
    if (id != rondaRealizada.rondaRealizadaId) {
        var err = new Error("El ID del objeto y de la url no coinciden");
        callback(err);
        return;
    }
    var connection = getConnection();
    sql = "UPDATE rondas_realizadas SET ? WHERE rondaRealizadaId = ?";
    sql = mysql.format(sql, [rondaRealizada, rondaRealizada.rondaRealizadaId]);
    connection.query(sql, function(err, result) {
        closeConnectionCallback(connection, callback);
        if (err) {
            callback(err);
        }
        callback(null, rondaRealizada);
    });
}

// deleteRondaRealizada
// Elimina el ronda con el id pasado
module.exports.deleteRondaRealizada = function(id, rondaRealizada, callback) {
    var connection = getConnection();
    sql = "DELETE from rondas_realizadas WHERE rondaRealizadaId = ?";
    sql = mysql.format(sql, id);
    connection.query(sql, function(err, result) {
        if (err) {
            callback(err);
            return;
        }
        callback(null);
        closeConnectionCallback(connection, callback);
    });
}


module.exports.postRondaRealizadaDesdeTag = function(tag, fecha, hora, vigilanteId, terminalId, callbackR) {
    // lo primero será obtener una ronda con los detalles
    rondasDb.getRondaDetalleTag(tag, function(err, result) {
        if (err) {
            return callbackR(err);
        }
        if (!result) {
            return callbackR(null, null);
        }
        var ronda = result;
        // preparamos el objeto completo que daremos de alta
        var rondaRealizada = {
            rondaRealizadaId: 0,
            rondaId: ronda.rondaId,
            vigilanteId: vigilanteId,
            terminalId: terminalId,
            fecha: fecha,
            hora: hora,
            resultado: null,
        };
        // dar de lata la cabecera
        fnPostRondaRealizada(rondaRealizada, function(err, result) {
            if (err) {
                return callbackR(err);
            }
            // machacamos nuestro objeto con el debvuelto, así tenemos la id
            rondaRealizada = result;
            rondaRealizada.puntos = [];
            // ahora las líneas, como son varios sql utilizamos el apoyo de async
            async.eachSeries(ronda.puntos,
                function(puntoRonda, callback3) {
                    // montar el punto de alta en base de datos
                    puntoRondaRealizada = {
                        rondaRealizadaPuntoId: 0,
                        rondaRealizadaId: rondaRealizada.rondaRealizadaId,
                        orden: puntoRonda.orden,
                        puntoId: puntoRonda.puntoId,
                        fecha: null,
                        hora: null,
                        resultado: "NO LEIDO"
                    };
                    fnPostPuntoRondaRealizada(puntoRondaRealizada, function(err, result) {
                        if (err) {
                            return callback3(err);
                        }
                        rondaRealizada.puntos.push(result); // conocer el id
                        callback3();
                    })

                },
                function(err) {
                    if (err) {
                        return callbackR(err);
                    }
                    return callbackR(null, rondaRealizada);
                });
        });
    })

    // luego la daremos de alta en el sistema y devolvemos el objeto que la representa.
}

module.exports.putRondaRealizadaCarga = function(id, rondaRealizada, callback) {
    fnRondaRealizadaConPuntosFaltantes(id, function(err, res) {
        if (err) {
            return callback(err);
        }
        if (res.length > 0) {
            // hay puntos faltantes
            if (rondaRealizada.resultado == "CORRECTO") {
                rondaRealizada.resultado = "PUNTOS SIN CONTROLAR";
                rondaRealizada.validada = 0;
                rondaRealizada.obsvalida = "";
            } else {
                rondaRealizada.resultado += " / PUNTOS SIN CONTROLAR";
            }
        }
        var connection = getConnection();
        sql = "UPDATE rondas_realizadas SET ? WHERE rondaRealizadaId = ?";
        sql = mysql.format(sql, [rondaRealizada, id]);
        connection.query(sql, function(err, result) {
            closeConnectionCallback(connection, callback);
            if (err) {
                callback(err);
            }
            callback(null, rondaRealizada);
        });
    });

}

module.exports.putPuntoRondaRealizadaCarga = function(id, puntoRondaRealizada, callback) {
    var connection = getConnection();
    sql = "UPDATE rondas_realizadaspuntos SET ? WHERE rondaRealizadaPuntoId = ?";
    sql = mysql.format(sql, [puntoRondaRealizada, id]);
    connection.query(sql, function(err, result) {
        closeConnectionCallback(connection, callback);
        if (err) {
            return callback(err);
        }
        callback(null, result);
    });
}

module.exports.getPuntoRondaRealizadaCarga = function(rondaRealizadaId, puntoId, callback) {
    var connection = getConnection();
    sql = "SELECT * FROM rondas_realizadaspuntos WHERE rondaRealizadaId= ? and puntoId = ?";
    sql = mysql.format(sql, [rondaRealizadaId, puntoId]);
    connection.query(sql, function(err, result) {
        closeConnectionCallback(connection, callback);
        if (err) {
            callback(err);
        }
        callback(null, result);
    });
}

module.exports.getPuntosRondaRealizadaCheck = function(puntoId, callback) {
    var connection = getConnection();
    var sql = "SELECT rrp.fecha, rrp.hora, v.nombre AS vnombre, r.nombre AS rnombre, rrp.resultado";
    sql += " FROM rondas_realizadaspuntos AS rrp";
    sql += " LEFT JOIN rondas_realizadas AS rr ON rr.rondaRealizadaId = rrp.rondaRealizadaId";
    sql += " LEFT JOIN rondas AS r ON r.rondaId = rr.rondaId";
    sql += " LEFT JOIN vigilantes AS v ON v.vigilanteId = rr.vigilanteId"
    sql += " WHERE puntoId = ?";
    sql += " AND NOT rrp.fecha IS NULL";
    sql = mysql.format(sql, puntoId);
    connection.query(sql, function(err, result) {
        closeConnectionCallback(connection, callback);
        if (err) {
            callback(err);
        }
        callback(null, result);
    });
}



var fnRondaRealizadaConPuntosFaltantes = function(id, callback) {
    var connection = getConnection();
    sql = "SELECT * FROM rondas_realizadaspuntos WHERE rondaRealizadaId = ? AND fecha IS NULL";
    sql = mysql.format(sql, id);
    connection.query(sql, function(err, result) {
        closeConnectionCallback(connection, callback);
        if (err) {
            callback(err);
        }
        callback(null, result);
    });
};

function fromDbtoJsRondaRealizada(registros) {
    var rondaRealizada = {};
    var puntos = [];
    // si no hay registros, devovemos objeto nulo
    if (registros.length == 0) return null;
    // rellenamos los datos de la ronda
    rondaRealizada.rondaRealizadaId = registros[0].rondaRealizadaId;
    rondaRealizada.rondaId = registros[0].rondaId;
    rondaRealizada.vigilanteId = registros[0].vigilanteId;
    rondaRealizada.fecha = registros[0].fecha;
    rondaRealizada.hora = registros[0].hora;
    rondaRealizada.resultado = registros[0].resultado;
    rondaRealizada.rnombre = registros[0].rnombre;
    rondaRealizada.vnombre = registros[0].vnombre;
    rondaRealizada.validada = registros[0].validada;
    rondaRealizada.obsvalida = registros[0].obsvalida;
    rondaRealizada.terminalId = registros[0].terminalId;
    rondaRealizada.tnombre = registros[0].tnombre;

    // montaje de los puntos relacionados
    for (var i = 0; i < registros.length; i++) {
        registro = registros[i];
        if (!registro.rondaRealizadaPuntoId) {
            continue;
        }
        var punto = {
            rondaRealizadaPuntoId: registro.rondaRealizadaPuntoId,
            orden: registro.orden,
            puntoId: registro.puntoId,
            pnombre: registro.pnombre,
            pfecha: registro.pfecha,
            phora: registro.phora,
            presultado: registro.presultado,
            ordenleido: registro.ordenleido,
            tagleido: registro.tagleido
        };
        puntos.push(punto);
    }
    rondaRealizada.puntos = puntos;
    return rondaRealizada;
}
