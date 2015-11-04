// grupos_db_mysql
// Manejo de la tabla grupos en la base de datos
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

// comprobarGrupo
// comprueba que tiene la estructura de objeto mínima
// necesaria para guardarlo en la base de datos
// Por ejemplo, que es del tipo correcto y tiene los atributos 
// adecuados.
function comprobarGrupo(grupo) {
    // debe ser objeto del tipo que toca
    var comprobado = "object" === typeof grupo;
    // en estas propiedades no se admiten valores nulos
    comprobado = (comprobado && grupo.hasOwnProperty("grupoId"));
    comprobado = (comprobado && grupo.hasOwnProperty("nombre"));
    return comprobado;
}


// getGrupos
// lee todos los registros de la tabla grupos y
// los devuelve como una lista de objetos
module.exports.getGrupos = function(callback) {
    var connection = getConnection();
    var grupos = null;
    sql = "SELECT * FROM grupos";
    connection.query(sql, function(err, result) {
        if (err) {
            callback(err, null);
            return;
        }
        grupos = result;
        callback(null, grupos);
    });
    closeConnectionCallback(connection, callback);
}

// loginGrupos
// busca un grupo con el login y contraseña pasados
// si lo encuentra lo devuelve, si no devuelve nulo.
module.exports.loginGrupos = function(grupo, callback) {
    var connection = getConnection();
    if (grupo && grupo.login && grupo.password) {
        var sql = "SELECT * FROM grupos WHERE login = ? AND password = ?";
        sql = mysql.format(sql, [grupo.login, grupo.password]);
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
            return;
        });
    } else {
        var err = new Error('API: No se ha proporcionado un objeto grupo con login y contraseña');
        callback(err, null);
        return;
    }
    return;
}

// getGruposBuscar
// lee todos los registros de la tabla grupos cuyo
// nombre contiene la cadena de búsqueda. Si la cadena es '*'
// devuelve todos los registros
module.exports.getGruposBuscar = function(nombre, callback) {
    var connection = getConnection();
    var grupos = null;
    var sql = "SELECT * FROM grupos";
    if (nombre !== "*") {
        sql = "SELECT * FROM grupos WHERE nombre LIKE ?";
        sql = mysql.format(sql, '%' + nombre + '%');
    }
    connection.query(sql, function(err, result) {
        if (err) {
            callback(err, null);
            return;
        }
        grupos = result;
        callback(null, grupos);
    });
    closeConnectionCallback(connection, callback);
}

// getGrupo
// busca  el grupo con id pasado
module.exports.getGrupo = function(id, callback) {
    var connection = getConnection();
    var grupos = null;
    sql = "SELECT * FROM grupos WHERE grupoId = ?";
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


// postGrupo
// crear en la base de datos el grupo pasado
module.exports.postGrupo = function(grupo, callback) {
    if (!comprobarGrupo(grupo)) {
        var err = new Error("El grupo pasado es incorrecto, no es un objeto de este tipo o le falta algún atributo olbligatorio");
        callback(err);
        return;
    }
    var connection = getConnection();
    grupo.grupoId = 0; // fuerza el uso de autoincremento
    sql = "INSERT INTO grupos SET ?";
    sql = mysql.format(sql, grupo);
    connection.query(sql, function(err, result) {
        if (err) {
            callback(err);
        }
        grupo.grupoId = result.insertId;
        callback(null, grupo);
    });
    closeConnectionCallback(connection, callback);
}

// putGrupo
// Modifica el grupo según los datos del objeto pasao
module.exports.putGrupo = function(id, grupo, callback) {
    if (!comprobarGrupo(grupo)) {
        var err = new Error("El grupo pasado es incorrecto, no es un objeto de este tipo o le falta algún atributo olbligatorio");
        callback(err);
        return;
    }
    if (id != grupo.grupoId) {
        var err = new Error("El ID del objeto y de la url no coinciden");
        callback(err);
        return;
    }
    var connection = getConnection();
    sql = "UPDATE grupos SET ? WHERE grupoId = ?";
    sql = mysql.format(sql, [grupo, grupo.grupoId]);
    connection.query(sql, function(err, result) {
        if (err) {
            callback(err);
        }
        callback(null, grupo);
    });
    closeConnectionCallback(connection, callback);
}

// deleteGrupo
// Elimina el grupo con el id pasado
module.exports.deleteGrupo = function(id, grupo, callback) {
    var connection = getConnection();
    sql = "DELETE from grupos WHERE grupoId = ?";
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
