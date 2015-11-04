// terminales_db_mysql
// Manejo de la tabla terminales en la base de datos
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

function closeConnectionCallback(connection, callback){
	connection.end(function(err){
		if (err) callback(err);
	});
}

// comprobarTerminal
// comprueba que tiene la estructura de objeto mínima
// necesaria para guardarlo en la base de datos
// Por ejemplo, que es del tipo correcto y tiene los atributos 
// adecuados.
function comprobarTerminal(terminal){
	// debe ser objeto del tipo que toca
	var comprobado = "object" === typeof terminal;
	// en estas propiedades no se admiten valores nulos
	comprobado = (comprobado && terminal.hasOwnProperty("terminalId"));
	comprobado = (comprobado && terminal.hasOwnProperty("numero"));
	comprobado = (comprobado && terminal.hasOwnProperty("numero"));
	comprobado = (comprobado && terminal.hasOwnProperty("fechaAlta"));
	return comprobado;
}


// getTerminales
// lee todos los registros de la tabla terminales y
// los devuelve como una lista de objetos
module.exports.getTerminales = function(callback){
	var connection = getConnection();
	var terminales = null;
	sql = "SELECT * FROM terminales";
	connection.query(sql, function(err, result){
		if (err){
			callback(err, null);
			return;
		}
		terminales = result;
		callback(null, terminales);
	});	
	closeConnectionCallback(connection, callback);
}

// getTerminalesBuscar
// lee todos los registros de la tabla terminales cuyo
// numero contiene la cadena de búsqueda. Si la cadena es '*'
// devuelve todos los registros
module.exports.getTerminalesBuscar = function (numero, callback) {
    var connection = getConnection();
    var terminales = null;
    var sql = "SELECT * FROM terminales";
    if (numero !== "*") {
        sql = "SELECT * FROM terminales WHERE numero LIKE ?";
        sql = mysql.format(sql, '%' + numero + '%');
    }
    connection.query(sql, function (err, result) {
        if (err) {
            callback(err, null);
            return;
        }
        terminales = result;
        callback(null, terminales);
    });
    closeConnectionCallback(connection, callback);
}

// getTerminal
// busca  el terminal con id pasado
module.exports.getTerminal = function(id, callback){
	var connection = getConnection();
	var terminales = null;
	sql = "SELECT * FROM terminales WHERE terminalId = ?";
	sql = mysql.format(sql, id);
	connection.query(sql, function(err, result){
		if (err){
			callback(err, null);
			return;
		}
		if (result.length == 0){
			callback(null, null);
			return;
		}
		callback(null, result[0]);
	});
	closeConnectionCallback(connection, callback);
}


// postTerminal
// crear en la base de datos el terminal pasado
module.exports.postTerminal = function (terminal, callback){
	if (!comprobarTerminal(terminal)){
		var err = new Error("El terminal pasado es incorrecto, no es un objeto de este tipo o le falta algún atributo olbligatorio");
		callback(err);
		return;
	}
	var connection = getConnection();
	terminal.terminalId = 0; // fuerza el uso de autoincremento
	sql = "INSERT INTO terminales SET ?";
	sql = mysql.format(sql, terminal);
	connection.query(sql, function(err, result){
		if (err){
			callback(err);
		}
		terminal.terminalId = result.insertId;
		callback(null, terminal);
	});
	closeConnectionCallback(connection, callback);
}

// putTerminal
// Modifica el terminal según los datos del objeto pasao
module.exports.putTerminal = function(id, terminal, callback){
	if (!comprobarTerminal(terminal)){
		var err = new Error("El terminal pasado es incorrecto, no es un objeto de este tipo o le falta algún atributo olbligatorio");
		callback(err);
		return;
    }
    if (id != terminal.terminalId) {
        var err = new Error("El ID del objeto y de la url no coinciden");
        callback(err);
        return;
    }
	var connection = getConnection();
	sql = "UPDATE terminales SET ? WHERE terminalId = ?";
	sql = mysql.format(sql, [terminal, terminal.terminalId]);
	connection.query(sql, function(err, result){
		if (err){
			callback(err);
		}
		callback(null, terminal);
	});
	closeConnectionCallback(connection, callback);
}

// deleteTerminal
// Elimina el terminal con el id pasado
module.exports.deleteTerminal = function(id, terminal, callback){
	var connection = getConnection();
	sql = "DELETE from terminales WHERE terminalId = ?";
	sql = mysql.format(sql, id);
	connection.query(sql, function(err, result){
		if (err){
			callback(err);
			return;
		}
		callback(null);
		closeConnectionCallback(connection, callback);
	});
}