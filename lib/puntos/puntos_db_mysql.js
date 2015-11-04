// puntos_db_mysql
// Manejo de la tabla puntos en la base de datos
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

// comprobarPunto
// comprueba que tiene la estructura de objeto mínima
// necesaria para guardarlo en la base de datos
// Por ejemplo, que es del tipo correcto y tiene los atributos 
// adecuados.
function comprobarPunto(punto) {
    // debe ser objeto del tipo que toca
    var comprobado = "object" === typeof punto;
    // en estas propiedades no se admiten valores nulos
    comprobado = (comprobado && punto.hasOwnProperty("puntoId"));
    comprobado = (comprobado && punto.hasOwnProperty("nombre"));
    comprobado = (comprobado && punto.hasOwnProperty("edificioId"));
    return comprobado;
}


// getpuntos
// lee todos los registros de la tabla puntos y
// los devuelve como una lista de objetos
module.exports.getPuntos = function(callback) {
    var connection = getConnection();
    var puntos = null;
    var sql = "SELECT p.*, g.nombre AS gnombre, e.nombre AS enombre, e.grupoId"
    sql += " FROM puntos AS p";
    sql += " LEFT JOIN edificios AS e ON e.edificioId = p.edificioId";
    sql += " LEFT JOIN grupos AS g ON g.grupoId = e.grupoId";
    connection.query(sql, function(err, result) {
        if (err) {
            callback(err, null);
            return;
        }
        puntos = result;
        callback(null, puntos);
    });
    closeConnectionCallback(connection, callback);
}


// getpuntosBuscar
// lee todos los registros de la tabla puntos cuyo
// nombre contiene la cadena de búsqueda. Si la cadena es '*'
// devuelve todos los registros
module.exports.getPuntosBuscar = function(nombre, callback) {
    var connection = getConnection();
    var puntos = null;
    var sql = "SELECT p.*, g.nombre AS gnombre, e.nombre AS enombre, e.grupoId"
    sql += " FROM puntos AS p";
    sql += " LEFT JOIN edificios AS e ON e.edificioId = p.edificioId";
    sql += " LEFT JOIN grupos AS g ON g.grupoId = e.grupoId";
    if (nombre !== "*") {
        sql += " WHERE p.nombre LIKE ?";
        sql = mysql.format(sql, '%' + nombre + '%');
    }
    connection.query(sql, function(err, result) {
        if (err) {
            callback(err, null);
            return;
        }
        puntos = result;
        callback(null, puntos);
    });
    closeConnectionCallback(connection, callback);
}


// getpuntosEdificiosBuscar
// lee todos los registros de la tabla puntos cuyo
// nombre contiene la cadena de búsqueda. Si la cadena es '*'
// devuelve todos los registros
module.exports.getPuntosEdificiosBuscar = function(id, callback) {
    var connection = getConnection();
    var puntos = null;
    var sql = "SELECT p.*, g.nombre AS gnombre, e.nombre AS enombre, e.grupoId"
    sql += " FROM puntos AS p";
    sql += " LEFT JOIN edificios AS e ON e.edificioId = p.edificioId";
    sql += " LEFT JOIN grupos AS g ON g.grupoId = e.grupoId";
    sql += " WHERE e.edificioId = ?";
    sql = mysql.format(sql, id);
    connection.query(sql, function(err, result) {
        if (err) {
            callback(err, null);
            return;
        }
        puntos = result;
        callback(null, puntos);
    });
    closeConnectionCallback(connection, callback);
}

// getPunto
// busca  el punto con id pasado
module.exports.getPunto = function(id, callback) {
    var connection = getConnection();
    var puntos = null;
    var sql = "SELECT p.*, g.nombre AS gnombre, e.nombre AS enombre, e.grupoId"
    sql += " FROM puntos AS p";
    sql += " LEFT JOIN edificios AS e ON e.edificioId = p.edificioId";
    sql += " LEFT JOIN grupos AS g ON g.grupoId = e.grupoId";
    sql += " WHERE p.puntoId = ?";
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

module.exports.getPuntoTag = function(tag, callback) {
    pool.getConnection(function(err, connection) {
        if (err) {
            callback(err, null);
            return;
        }
        var puntos = null;
        var sql = "SELECT p.*, g.nombre AS gnombre, e.nombre AS enombre, e.grupoId"
        sql += " FROM puntos AS p";
        sql += " LEFT JOIN edificios AS e ON e.edificioId = p.edificioId";
        sql += " LEFT JOIN grupos AS g ON g.grupoId = e.grupoId";
        sql += " WHERE p.tag = ?";
        sql = mysql.format(sql, tag);
        connection.query(sql, function(err, result) {
            connection.release();
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
    });
}


// postPunto
// crear en la base de datos el punto pasado
module.exports.postPunto = function(punto, callback) {
    if (!comprobarPunto(punto)) {
        var err = new Error("El punto pasado es incorrecto, no es un objeto de este tipo o le falta algún atributo olbligatorio");
        callback(err);
        return;
    }
    var connection = getConnection();
    punto.puntoId = 0; // fuerza el uso de autoincremento
    sql = "INSERT INTO puntos SET ?";
    sql = mysql.format(sql, punto);
    connection.query(sql, function(err, result) {
        if (err) {
            callback(err);
        }
        punto.puntoId = result.insertId;
        callback(null, punto);
    });
    closeConnectionCallback(connection, callback);
}

// putPunto
// Modifica el punto según los datos del objeto pasao
module.exports.putPunto = function(id, punto, callback) {
    if (!comprobarPunto(punto)) {
        var err = new Error("El punto pasado es incorrecto, no es un objeto de este tipo o le falta algún atributo olbligatorio");
        callback(err);
        return;
    }
    if (id != punto.puntoId) {
        var err = new Error("El ID del objeto y de la url no coinciden");
        callback(err);
        return;
    }
    var connection = getConnection();
    sql = "UPDATE puntos SET ? WHERE puntoId = ?";
    sql = mysql.format(sql, [punto, punto.puntoId]);
    connection.query(sql, function(err, result) {
        if (err) {
            callback(err);
        }
        callback(null, punto);
    });
    closeConnectionCallback(connection, callback);
}

// deletePunto
// Elimina el punto con el id pasado
module.exports.deletePunto = function(id, punto, callback) {
    var connection = getConnection();
    sql = "DELETE from puntos WHERE puntoId = ?";
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
