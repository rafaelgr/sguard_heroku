// edificios_db_mysql
// Manejo de la tabla edificios en la base de datos
var mysql = require("mysql"); // librería para el acceso a bases de datos MySQL
var async = require("async"); // librería para el manejo de llamadas asíncronas en JS

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

// comprobarEdificio
// comprueba que tiene la estructura de objeto mínima
// necesaria para guardarlo en la base de datos
// Por ejemplo, que es del tipo correcto y tiene los atributos 
// adecuados.
function comprobarEdificio(edificio) {
    // debe ser objeto del tipo que toca
    var comprobado = "object" === typeof edificio;
    // en estas propiedades no se admiten valores nulos
    comprobado = (comprobado && edificio.hasOwnProperty("edificioId"));
    comprobado = (comprobado && edificio.hasOwnProperty("nombre"));
    comprobado = (comprobado && edificio.hasOwnProperty("grupoId"));
    return comprobado;
}


// getEdificios
// lee todos los registros de la tabla edificios y
// los devuelve como una lista de objetos
module.exports.getEdificios = function(callback) {
    var connection = getConnection();
    var edificios = null;
    sql = "SELECT * FROM edificios";
    connection.query(sql, function(err, result) {
        if (err) {
            callback(err, null);
            return;
        }
        edificios = result;
        callback(null, edificios);
    });
    closeConnectionCallback(connection, callback);
}


// getEdificiosBuscar
// lee todos los registros de la tabla edificios cuyo
// nombre contiene la cadena de búsqueda. Si la cadena es '*'
// devuelve todos los registros
module.exports.getEdificiosBuscar = function(nombre, callback) {
    var connection = getConnection();
    var edificios = null;
    var sql = "SELECT e.*, g.nombre as gnombre FROM edificios as e";
    sql += " LEFT JOIN grupos as g on g.grupoId = e.grupoId"
    if (nombre !== "*") {
        sql += " WHERE e.nombre LIKE ?";
        sql = mysql.format(sql, '%' + nombre + '%');
    }
    connection.query(sql, function(err, result) {
        if (err) {
            callback(err, null);
            return;
        }
        edificios = result;
        callback(null, edificios);
    });
    closeConnectionCallback(connection, callback);
}

// getEdificiosBuscarGrupo
// lee todos los registros de la tabla edificios cuyo
// nombre contiene la cadena de búsqueda. Si la cadena es '*'
// devuelve todos los registros
module.exports.getEdificiosBuscarGrupo = function(id, callback) {
    var connection = getConnection();
    var edificios = null;
    var sql = "SELECT e.*, g.nombre as gnombre FROM edificios as e";
    sql += " LEFT JOIN grupos as g on g.grupoId = e.grupoId"
    sql += " WHERE g.grupoId = ?";
    sql = mysql.format(sql, id);

    connection.query(sql, function(err, result) {
        if (err) {
            callback(err, null);
            return;
        }
        edificios = result;
        callback(null, edificios);
    });
    closeConnectionCallback(connection, callback);
}


// getEdificio
// busca  el edificio con id pasado
module.exports.getEdificio = function(id, callback) {
    var connection = getConnection();
    var edificios = null;
    var sql = "SELECT e.*, g.nombre as gnombre FROM edificios as e";
    sql += " LEFT JOIN grupos as g on g.grupoId = e.grupoId"
    sql += " WHERE e.edificioId = ?";
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


// postEdificio
// crear en la base de datos el edificio pasado
module.exports.postEdificio = function(edificio, callback) {
    if (!comprobarEdificio(edificio)) {
        var err = new Error("El edificio pasado es incorrecto, no es un objeto de este tipo o le falta algún atributo olbligatorio");
        callback(err);
        return;
    }
    var connection = getConnection();
    edificio.edificioId = 0; // fuerza el uso de autoincremento
    sql = "INSERT INTO edificios SET ?";
    sql = mysql.format(sql, edificio);
    connection.query(sql, function(err, result) {
        if (err) {
            callback(err);
        }
        edificio.edificioId = result.insertId;
        callback(null, edificio);
    });
    closeConnectionCallback(connection, callback);
}

// putEdificio
// Modifica el edificio según los datos del objeto pasao
module.exports.putEdificio = function(id, edificio, callback) {
    if (!comprobarEdificio(edificio)) {
        var err = new Error("El edificio pasado es incorrecto, no es un objeto de este tipo o le falta algún atributo olbligatorio");
        callback(err);
        return;
    }
    if (id != edificio.edificioId) {
        var err = new Error("El ID del objeto y de la url no coinciden");
        callback(err);
        return;
    }
    var connection = getConnection();
    sql = "UPDATE edificios SET ? WHERE edificioId = ?";
    sql = mysql.format(sql, [edificio, edificio.edificioId]);
    connection.query(sql, function(err, result) {
        if (err) {
            callback(err);
        }
        callback(null, edificio);
    });
    closeConnectionCallback(connection, callback);
}

// deleteEdificio
// Elimina el edificio con el id pasado
module.exports.deleteEdificio = function(id, edificio, callback) {
    var connection = getConnection();
    sql = "DELETE from edificios WHERE edificioId = ?";
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
