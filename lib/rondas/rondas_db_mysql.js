// rondas_db_mysql
// Manejo de la tabla rondas en la base de datos
var mysql = require("mysql"); // librería para el acceso a bases de datos MySQL
var async = require("async"); // librería para el manejo de llamadas asíncronas en JS

//  leer la configurción de MySQL
var config = require("../../configMySQL.json");
var sql = "";

var pool = mysql.createPool({
    connectionLimit: 10,
    host: config.host,
    user: config.user,
    password: config.password,
    database: config.database,
    port: config.port
});

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

// comprobarRonda
// comprueba que tiene la estructura de objeto mínima
// necesaria para guardarlo en la base de datos
// Por ejemplo, que es del tipo correcto y tiene los atributos 
// adecuados.
function comprobarRonda(ronda) {
    // debe ser objeto del tipo que toca
    var comprobado = "object" === typeof ronda;
    // en estas propiedades no se admiten valores nulos
    comprobado = (comprobado && ronda.hasOwnProperty("rondaId"));
    comprobado = (comprobado && ronda.hasOwnProperty("nombre"));
    return comprobado;
}


// comprobarPuntoRonda
// comprueba que tiene la estructura de objeto mínima
// necesaria para guardarlo en la base de datos
// Por ejemplo, que es del tipo correcto y tiene los atributos 
// adecuados.
function comprobarPuntoRonda(puntoRonda) {
    // debe ser objeto del tipo que toca
    var comprobado = "object" === typeof puntoRonda;
    // en estas propiedades no se admiten valores nulos
    comprobado = (comprobado && puntoRonda.hasOwnProperty("orden"));
    comprobado = (comprobado && puntoRonda.hasOwnProperty("rondaId"));
    comprobado = (comprobado && puntoRonda.hasOwnProperty("puntoId"));
    return comprobado;
}

// getrondas
// lee todos los registros de la tabla rondas y
// los devuelve como una lista de objetos
module.exports.getRondas = function(callback) {
    var connection = getConnection();
    var rondas = null;
    sql = "SELECT * FROM rondas";
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


// getrondasBuscar
// lee todos los registros de la tabla rondas cuyo
// nombre contiene la cadena de búsqueda. Si la cadena es '*'
// devuelve todos los registros
module.exports.getRondasBuscar = function(nombre, callback) {
    var connection = getConnection();
    var rondas = null;
    var sql = "SELECT * FROM rondas";
    if (nombre !== "*") {
        sql = "SELECT * FROM rondas WHERE nombre LIKE ?";
        sql = mysql.format(sql, '%' + nombre + '%');
    }
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

// getRonda
// busca  el ronda con id pasado
module.exports.getRonda = function(id, callback) {
    var connection = getConnection();
    var rondas = null;
    sql = "SELECT * FROM rondas WHERE rondaId = ?";
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

// getRondaDetalle
// busca la ronda con el id pasado y devuelve la ronda
// con el detalle de sus puntos
module.exports.getRondaDetalle = function(id, callback) {
    var connection = getConnection();
    var rondas = null;
    sql = "SELECT r.rondaId, r.nombre AS rnombre, r.tag as tagi, r.tagf, rp.rondaPuntoId, rp.orden, p.*";
    sql += " FROM rondas AS r";
    sql += " LEFT JOIN rondaspuntos AS rp ON rp.rondaId = r.rondaId";
    sql += " LEFT JOIN puntos AS p ON p.puntoId = rp.puntoId"
    sql += " WHERE r.rondaId = ?"
    sql = mysql.format(sql, id);
    connection.query(sql, function(err, result) {
        if (err) {
            callback(err, null);
            return;
        }
        callback(null, fromDbtoJsRonda(result));
    });
    closeConnectionCallback(connection, callback);
}

// getRondasDetalleTag
// busca la ronda con el id pasado y devuelve la ronda
// con el detalle de sus puntos
module.exports.getRondaDetalleTag = function(tag, callback) {
    pool.getConnection(function(err, connection) {
        if (err) {
            callback(err, null);
            return;
        }
        var rondas = null;
        sql = "SELECT r.rondaId, r.nombre AS rnombre, r.tag as tagi, r.tagf, rp.rondaPuntoId, rp.orden, p.*";
        sql += " FROM rondas AS r";
        sql += " LEFT JOIN rondaspuntos AS rp ON rp.rondaId = r.rondaId";
        sql += " LEFT JOIN puntos AS p ON p.puntoId = rp.puntoId"
        sql += " WHERE r.tag = ? OR r.tagf= ?"
        sql = mysql.format(sql, [tag, tag]);
        connection.query(sql, function(err, result) {
            connection.release();
            if (err) {
                callback(err, null);
                return;
            }
            callback(null, fromDbtoJsRonda(result));
        });
    });
}



// postRonda
// crear en la base de datos el ronda pasado
module.exports.postRonda = function(ronda, callback) {
    if (!comprobarRonda(ronda)) {
        var err = new Error("La ronda pasada es incorrecto, no es un objeto de este tipo o le falta algún atributo olbligatorio");
        callback(err);
        return;
    }
    var connection = getConnection();
    ronda.rondaId = 0; // fuerza el uso de autoincremento
    sql = "INSERT INTO rondas SET ?";
    sql = mysql.format(sql, ronda);
    connection.query(sql, function(err, result) {
        if (err) {
            callback(err);
        }
        ronda.rondaId = result.insertId;
        callback(null, ronda);
    });
    closeConnectionCallback(connection, callback);
}

// postPuntoRonda
// crear en la base de datos el punto-ronda pasado
module.exports.postPuntoRonda = function(puntoRonda, callback) {
    if (!comprobarPuntoRonda(puntoRonda)) {
        var err = new Error("La punto de ronda pasada es incorrecto, no es un objeto de este tipo o le falta algún atributo olbligatorio");
        callback(err);
        return;
    }
    var connection = getConnection();
    // renumermos siempre orden igual y posteriores por si acaso
    var sql = "UPDATE rondaspuntos SET orden = orden + 1 WHERE rondaId = ? AND orden >= ?";
    sql = mysql.format(sql, [puntoRonda.rondaId, puntoRonda.orden]);
    connection.query(sql, function(err, result) {
        if (err) {
            callback(err);
            return;
        }
        puntoRonda.rondaPuntoId = 0; // fuerza el uso de autoincremento
        sql = "INSERT INTO rondaspuntos SET ?";
        sql = mysql.format(sql, puntoRonda);
        connection.query(sql, function(err, result) {
            if (err) {
                callback(err);
            }
            puntoRonda.rondaPuntoId = result.insertId;
            callback(null, puntoRonda);
        });
        closeConnectionCallback(connection, callback);
    });
}

// getPuntoRondaPorOrden
module.exports.getPuntoRondaPorOrden = function(rondaId, orden, callback) {
    var connection = getConnection();
    var sql = "SELECT * FROM rondaspuntos WHERE rondaId = ? AND orden = ?";
    sql = mysql.format(sql, [rondaId, orden]);
    connection.query(sql, function(err, result) {
        if (err) {
            callback(err);
        }
        if (result.length == 0) {
            callback(null, null);
        }
        callback(null, result[0]);
    });
}

// putRonda
// Modifica el ronda según los datos del objeto pasao
module.exports.putRonda = function(id, ronda, callback) {
    if (!comprobarRonda(ronda)) {
        var err = new Error("La ronda pasada es incorrecta, no es un objeto de este tipo o le falta algún atributo olbligatorio");
        callback(err);
        return;
    }
    if (id != ronda.rondaId) {
        var err = new Error("El ID del objeto y de la url no coinciden");
        callback(err);
        return;
    }
    var connection = getConnection();
    sql = "UPDATE rondas SET ? WHERE rondaId = ?";
    sql = mysql.format(sql, [ronda, ronda.rondaId]);
    connection.query(sql, function(err, result) {
        if (err) {
            callback(err);
        }
        callback(null, ronda);
    });
    closeConnectionCallback(connection, callback);
}

// deleteRonda
// Elimina el ronda con el id pasado
module.exports.deleteRonda = function(id, ronda, callback) {
    var connection = getConnection();
    sql = "DELETE from rondas WHERE rondaId = ?";
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

// deletePuntoRonda
// Elimina el ronda con el id pasado
module.exports.deletePuntoRonda = function(id, rondaId, orden, callback) {
    var connection = getConnection();
    var sql = "DELETE from rondaspuntos WHERE rondaPuntoId = ?";
    sql = mysql.format(sql, id);
    connection.query(sql, function(err, result) {
        if (err) {
            callback(err);
            return;
        }
        // ahora hay que tener en cuenta la reaordenación de este punto
        sql = "UPDATE rondaspuntos SET orden = orden-1 WHERE rondaId = ? AND orden >= ?";
        sql = mysql.format(sql, [rondaId, orden]);
        connection.query(sql, function(err, result) {
            if (err) {
                callback(err);
                return;
            }
            callback(null);
            closeConnectionCallback(connection, callback);
        });
    });
}

// Funciones de soporte

// fromDbtoJsRonda
// desde el registro de búsqueda referencial de una ronda
// devuelve un objeto montado con el detalle de sus puntos
function fromDbtoJsRonda(registros) {
    var ronda = {};
    var puntos = [];
    // si no hay registros, devovemos objeto nulo
    if (registros.length == 0) return null;
    // rellenamos los datos de la ronda
    ronda.rondaId = registros[0].rondaId;
    ronda.nombre = registros[0].rnombre;
    ronda.tag = registros[0].tagi;
    ronda.tagf = registros[0].tagf;
    // montaje de los puntos relacionados
    for (var i = 0; i < registros.length; i++) {
        registro = registros[i];
        if (!registro.rondaPuntoId || !registro.puntoId) {
            continue;
        }
        var punto = {
            rondaId: registro.rondaId,
            rondaPuntoId: registro.rondaPuntoId,
            orden: registro.orden,
            puntoId: registro.puntoId,
            nombre: registro.nombre,
            edificioId: registro.edificioId,
            tag: registro.tag,
            cota: registro.cota,
            cubiculo: registro.cubiculo,
            observaciones: registro.observaciones
        };
        puntos.push(punto);
    }
    ronda.puntos = puntos;
    return ronda;
}
