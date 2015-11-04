// vigilantes_db_mysql
// Manejo de la tabla vigilantes en la base de datos
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

// comprobarVigilante
// comprueba que tiene la estructura de objeto mínima
// necesaria para guardarlo en la base de datos
// Por ejemplo, que es del tipo correcto y tiene los atributos 
// adecuados.
function comprobarVigilante(vigilante) {
    // debe ser objeto del tipo que toca
    var comprobado = "object" === typeof vigilante;
    // en estas propiedades no se admiten valores nulos
    comprobado = (comprobado && vigilante.hasOwnProperty("vigilanteId"));
    comprobado = (comprobado && vigilante.hasOwnProperty("nombre"));
    return comprobado;
}


// getvigilantes
// lee todos los registros de la tabla vigilantes y
// los devuelve como una lista de objetos
module.exports.getVigilantes = function(callback) {
    var connection = getConnection();
    var vigilantes = null;
    sql = "SELECT * FROM vigilantes";
    connection.query(sql, function(err, result) {
        closeConnectionCallback(connection, callback);
        if (err) {
            callback(err, null);
            return;
        }
        vigilantes = result;
        callback(null, vigilantes);
    });
}


// getvigilantesBuscar
// lee todos los registros de la tabla vigilantes cuyo
// nombre contiene la cadena de búsqueda. Si la cadena es '*'
// devuelve todos los registros
module.exports.getVigilantesBuscar = function(nombre, callback) {
    var connection = getConnection();
    var vigilantes = null;
    var sql = "SELECT * FROM vigilantes";
    if (nombre !== "*") {
        sql = "SELECT * FROM vigilantes WHERE nombre LIKE ?";
        sql = mysql.format(sql, '%' + nombre + '%');
    }
    connection.query(sql, function(err, result) {
        if (err) {
            callback(err, null);
            return;
        }
        vigilantes = result;
        callback(null, vigilantes);
    });
    closeConnectionCallback(connection, callback);
}

// getvigilantesBuscarTag
// lee todos los registros de la tabla vigilantes con un tag
// igual al pasado
module.exports.getVigilantesBuscarTag = function(tag, callback) {
    pool.getConnection(function(err, connection) {
        if (err) {
            callback(err, null);
            return;
        }
        var vigilantes = null;
        var sql = "SELECT * FROM vigilantes";
        sql += " WHERE tag = ? OR tagf = ?";
        sql = mysql.format(sql, [tag, tag]);
        connection.query(sql, function(err, result) {
            connection.release();
            if (err) {
                callback(err, null);
                return;
            }
            vigilantes = result;
            callback(null, vigilantes);
        });
    });
}

// getVigilante
// busca  el vigilante con id pasado
module.exports.getVigilante = function(id, callback) {
    var connection = getConnection();
    var vigilantes = null;
    sql = "SELECT * FROM vigilantes WHERE vigilanteId = ?";
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


// postVigilante
// crear en la base de datos el vigilante pasado
module.exports.postVigilante = function(vigilante, callback) {
    if (!comprobarVigilante(vigilante)) {
        var err = new Error("El vigilante pasado es incorrecto, no es un objeto de este tipo o le falta algún atributo olbligatorio");
        callback(err);
        return;
    }
    var connection = getConnection();
    vigilante.vigilanteId = 0; // fuerza el uso de autoincremento
    sql = "INSERT INTO vigilantes SET ?";
    sql = mysql.format(sql, vigilante);
    connection.query(sql, function(err, result) {
        if (err) {
            callback(err);
        }
        vigilante.vigilanteId = result.insertId;
        callback(null, vigilante);
    });
    closeConnectionCallback(connection, callback);
}

// putVigilante
// Modifica el vigilante según los datos del objeto pasao
module.exports.putVigilante = function(id, vigilante, callback) {
    if (!comprobarVigilante(vigilante)) {
        var err = new Error("El vigilante pasado es incorrecto, no es un objeto de este tipo o le falta algún atributo olbligatorio");
        callback(err);
        return;
    }
    if (id != vigilante.vigilanteId) {
        var err = new Error("El ID del objeto y de la url no coinciden");
        callback(err);
        return;
    }
    var connection = getConnection();
    sql = "UPDATE vigilantes SET ? WHERE vigilanteId = ?";
    sql = mysql.format(sql, [vigilante, vigilante.vigilanteId]);
    connection.query(sql, function(err, result) {
        if (err) {
            callback(err);
        }
        callback(null, vigilante);
    });
    closeConnectionCallback(connection, callback);
}

// deleteVigilante
// Elimina el vigilante con el id pasado
module.exports.deleteVigilante = function(id, vigilante, callback) {
    var connection = getConnection();
    sql = "DELETE from vigilantes WHERE vigilanteId = ?";
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
