// informes_db_mysql
// Acceso a la base de datos para la obtención de informes.
var mysql = require("mysql"); // librería para el acceso a bases de datos MySQL
var async = require("async"); // librería para el manejo de llamadas asíncronas en JS
var moment = require("moment"); // libreria para el manejo de fechas y horas.

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

// fromDbToJsRondas
// a partir de los registros pasados en regs
// monta un objeto con el formato necesario para devolver un informe
function fromDbToJsRondas(dfecha, hfecha, dhora, hhora, regs) {
    var inf = {
        ninforme: "Rondas entre fechas",
        dFecha: moment(new Date(dfecha)).format('DD/MM/YYYY'),
        hFecha: moment(new Date(hfecha)).format('DD/MM/YYYY'),
        rondas: [],
    };
    if (dhora != "*") {
        inf.dHora = dhora;
    }
    if (hhora != "*") {
        inf.hHora = hhora;
    }

    var antRondaRealizadaId = 0
    var rr = null;
    var fecha = null;
    // leemos secuencialmente los registros pasados.
    for (var i = 0; i < regs.length; i++) {
        reg = regs[i];
        if (reg.rondaRealizadaId != antRondaRealizadaId) {
            if (antRondaRealizadaId != 0) {
                inf.rondas.push(rr);
            }
            if (reg.rfecha) {
                rfecha = moment(new Date(reg.rfecha)).format("YYYY-MM-DD");
            } else {
                rfecha = "";
            }
            rr = {
                nronda: reg.nronda,
                vigilante: reg.vigilante,
                rfecha: moment(rfecha).format("DD/MM/YYYY"),
                rhora: reg.rhora,
                rresultado: reg.rresultado,
                tnombre: reg.tnombre,
                validada: "NO",
                obsvalida: reg.obsvalida,
                puntos: []
            };
            if (reg.validada != 0) {
                rr.validada = "SI";
            }
            antRondaRealizadaId = reg.rondaRealizadaId;
        }
        if (reg.fecha) {
            fecha = moment(new Date(reg.rfecha)).format("YYYY-MM-DD");
            fecha = moment(fecha).format("DD/MM/YYYY");
        } else {
            fecha = null;
        }
        var punto = {
            ordenleido: reg.ordenleido,
            ordenronda: reg.ordenronda,
            tagleido: reg.tagleido,
            punto: reg.punto,
            fecha: fecha,
            hora: reg.hora,
            resultado: reg.resultado
        };
        rr.puntos.push(punto);
    }
    if (rr) {
        inf.rondas.push(rr);
    }
    return inf;
}

// fromDbToJsRondasVigilante
// a partir de los registros pasados en regs
// monta un objeto con el formato necesario para devolver un informe
function fromDbToJsRondasVigilante(dfecha, hfecha, dhora, hhora, regs) {
    var inf = {
        ninforme: "Rondas por vigilante",
        dFecha: moment(new Date(dfecha)).format('DD/MM/YYYY'),
        hFecha: moment(new Date(hfecha)).format('DD/MM/YYYY'),
        vigilante: "",
        rondas: [],
    };
    if (dhora != "*") {
        inf.dHora = dhora;
    }
    if (hhora != "*") {
        inf.hHora = hhora;
    }
    if (regs.length > 0) {
        inf.vigilante = regs[0].vigilante;
    }
    var antRondaRealizadaId = 0
    var rr = null;
    // leemos secuencialmente los registros pasados.
    for (var i = 0; i < regs.length; i++) {
        reg = regs[i];
        if (reg.rondaRealizadaId != antRondaRealizadaId) {
            if (antRondaRealizadaId != 0) {
                inf.rondas.push(rr);
            }
            if (reg.rfecha) {
                rfecha = moment(new Date(reg.rfecha)).format("YYYY-MM-DD");
            } else {
                rfecha = null;
            }
            rr = {
                nronda: reg.nronda,
                rfecha: moment(rfecha).format("DD/MM/YYYY"),
                rhora: reg.rhora,
                rresultado: reg.rresultado,
                tnombre: reg.tnombre,
                validada: "NO",
                obsvalida: reg.obsvalida,
                puntos: []
            };
            if (reg.validada != 0) {
                rr.validada = "SI";
            }
            antRondaRealizadaId = reg.rondaRealizadaId;
        }
        if (reg.fecha) {
            fecha = moment(new Date(reg.rfecha)).format("YYYY-MM-DD");
            fecha = moment(fecha).format("DD/MM/YYYY");
        } else {
            fecha = null;
        }
        var punto = {
            ordenleido: reg.ordenleido,
            ordenronda: reg.ordenronda,
            tagleido: reg.tagleido,
            punto: reg.punto,
            fecha: fecha,
            hora: reg.hora,
            resultado: reg.resultado
        };

        rr.puntos.push(punto);
    }
    if (rr) {
        inf.rondas.push(rr);
    }
    return inf;
}

// fromDbToJsRondasTerminal
// a partir de los registros pasados en regs
// monta un objeto con el formato necesario para devolver un informe
function fromDbToJsRondasTerminal(dfecha, hfecha, dhora, hhora, regs) {
    var inf = {
        ninforme: "Rondas por terminal",
        dFecha: moment(new Date(dfecha)).format('DD/MM/YYYY'),
        hFecha: moment(new Date(hfecha)).format('DD/MM/YYYY'),
        terminal: "",
        rondas: [],
    };
    if (dhora != "*") {
        inf.dHora = dhora;
    }
    if (hhora != "*") {
        inf.hHora = hhora;
    }
    if (regs.length > 0) {
        inf.vigilante = regs[0].vigilante;
    }
    if (regs.length > 0) {
        inf.terminal = regs[0].terminal;
    }
    var antRondaRealizadaId = 0
    var rr = null;
    // leemos secuencialmente los registros pasados.
    for (var i = 0; i < regs.length; i++) {
        reg = regs[i];
        rr = {
            nronda: reg.nronda,
            rfecha: moment(reg.rfecha).format("DD/MM/YYYY"),
            rhora: reg.rhora,
            rresultado: reg.rresultado,
            vigilante: reg.vigilante,
            validada: "NO",
            obsvalida: reg.obsvalida
        };
        if (reg.validada != 0) {
            rr.validada = "SI";
        }
        inf.rondas.push(rr);
    }
    return inf;
}

// fromDbToJsRondasPunto
// a partir de los registros pasados en regs
// monta un objeto con el formato necesario para devolver un informe
function fromDbToJsRondasPunto(dfecha, hfecha, dhora, hhora, regs) {
    var inf = {
        ninforme: "Control de puntos",
        dFecha: moment(new Date(dfecha)).format('DD/MM/YYYY'),
        hFecha: moment(new Date(hfecha)).format('DD/MM/YYYY'),
        punto: "",
        grupo: "",
        edificio: "",
        cota: "",
        cubiculo: "",
        rondas: [],
    };
    if (dhora != "*") {
        inf.dHora = dhora;
    }
    if (hhora != "*") {
        inf.hHora = hhora;
    }
    if (regs.length > 0) {
        inf.vigilante = regs[0].vigilante;
    }
    if (regs.length > 0) {
        inf.terminal = regs[0].terminal;
    }
    if (regs.length > 0) {
        inf.punto = regs[0].punto;
        inf.grupo = regs[0].grupo;
        inf.edificio = regs[0].edificio;
        inf.cota = regs[0].cota;
        inf.cubiculo = regs[0].cubiculo;
    }
    var rr = null;
    // leemos secuencialmente los registros pasados.
    for (var i = 0; i < regs.length; i++) {
        reg = regs[i];
        rr = {
            ronda: reg.ronda,
            fecha: moment(reg.fecha).format("DD/MM/YYYY"),
            hora: reg.hora,
            resultado: reg.resultado,
            vigilante: reg.vigilante,
            terminal: reg.terminal
        };
        inf.rondas.push(rr);
    }
    return inf;
}


// getRondas
// Lee las rondas realizadas entre las fechas indicadas
module.exports.getRondas = function(dfecha, hfecha, dhora, hhora, callback) {
    var connection = getConnection();
    var grupos = null;
    var sql = "SELECT rr.rondaRealizadaId, rrp.rondaRealizadaPuntoId, t.nombre AS tnombre, rr.validada, rr.obsvalida,"
    sql += " r.nombre AS nronda, v.nombre AS vigilante, rr.fecha AS rfecha, rr.hora AS rhora, rr.resultado AS rresultado,";
    sql += " rrp.ordenleido, rrp.orden AS ordenronda, rrp.tagleido, p.nombre AS punto, rrp.fecha, rrp.hora, rrp.resultado";
    sql += " FROM rondas_realizadas AS rr";
    sql += " LEFT JOIN rondas AS r ON r.rondaId = rr.rondaId";
    sql += " LEFT JOIN vigilantes AS v ON v.vigilanteId = rr.vigilanteId";
    sql += " LEFT JOIN rondas_realizadaspuntos AS rrp ON rrp.rondaRealizadaId = rr.rondaRealizadaId";
    sql += " LEFT JOIN puntos AS p ON p.puntoId = rrp.puntoId";
    sql += " LEFT JOIN terminales AS t ON t.terminalId = rr.terminalId";
    sql += " WHERE rr.fecha >= ? AND rr.fecha <= ?"
    if (dhora != "*") {
        sql += " AND rr.hora >= '" + dhora + "'";
    }
    if (hhora != "*") {
        sql += " AND rr.hora <= '" + hhora + "'";
    }
    sql += " ORDER BY rr.fecha, rr.hora, rrp.rondaRealizadaId, rrp.orden";
    sql = mysql.format(sql, [dfecha, hfecha]);
    connection.query(sql, function(err, result) {
        if (err) {
            callback(err, null);
            return;
        }
        grupos = result;
        callback(null, fromDbToJsRondas(dfecha, hfecha, dhora, hhora, result));
    });
    closeConnectionCallback(connection, callback);
}

// getGeneral
// Lee las rondas realizadas entre las fechas indicadas
module.exports.getGeneral = function(ronda, vigilante, terminal, dfecha, hfecha, dhora, hhora, callback) {
    var connection = getConnection();
    var grupos = null;
    var sql = "SELECT rr.rondaRealizadaId, rrp.rondaRealizadaPuntoId, t.nombre AS tnombre, rr.validada, rr.obsvalida,"
    sql += " r.nombre AS nronda, v.nombre AS vigilante, rr.fecha AS rfecha, rr.hora AS rhora, rr.resultado AS rresultado,";
    sql += " rrp.ordenleido, rrp.orden AS ordenronda, rrp.tagleido, p.nombre AS punto, rrp.fecha, rrp.hora, rrp.resultado";
    sql += " FROM rondas_realizadas AS rr";
    sql += " LEFT JOIN rondas AS r ON r.rondaId = rr.rondaId";
    sql += " LEFT JOIN vigilantes AS v ON v.vigilanteId = rr.vigilanteId";
    sql += " LEFT JOIN rondas_realizadaspuntos AS rrp ON rrp.rondaRealizadaId = rr.rondaRealizadaId";
    sql += " LEFT JOIN puntos AS p ON p.puntoId = rrp.puntoId";
    sql += " LEFT JOIN terminales AS t ON t.terminalId = rr.terminalId";
    sql += " WHERE rr.fecha >= ? AND rr.fecha <= ?"
    if (ronda != "*") {
        sql += " AND r.rondaId = " + ronda;
    }
    if (vigilante != "*") {
        sql += " AND v.vigilanteId = " + vigilante;
    }
    if (terminal != "*") {
        sql += " AND t.terminalId = " + terminal;
    }
    if (dhora != "*") {
        sql += " AND rr.hora >= '" + dhora + "'";
    }
    if (hhora != "*") {
        sql += " AND rr.hora <= '" + hhora + "'";
    }
    sql += " ORDER BY rr.fecha, rr.hora, rrp.rondaRealizadaId, rrp.orden";
    sql = mysql.format(sql, [dfecha, hfecha]);
    connection.query(sql, function(err, result) {
        if (err) {
            callback(err, null);
            return;
        }
        grupos = result;
        callback(null, fromDbToJsRondas(dfecha, hfecha, dhora, hhora, result));
    });
    closeConnectionCallback(connection, callback);
}





// getRondas
// Lee las rondas realizadas entre las fechas indicadas
module.exports.getRondasVigilante = function(vigilanteId, dfecha, hfecha, dhora, hhora, callback) {
    var connection = getConnection();
    var grupos = null;
    var sql = "SELECT rr.rondaRealizadaId, rrp.rondaRealizadaPuntoId, t.nombre AS tnombre, rr.validada, rr.obsvalida,"
    sql += " r.nombre AS nronda, v.nombre AS vigilante, rr.fecha AS rfecha, rr.hora AS rhora, rr.resultado AS rresultado,";
    sql += " rrp.ordenleido, rrp.orden AS ordenronda, rrp.tagleido, p.nombre AS punto, rrp.fecha, rrp.hora, rrp.resultado";
    sql += " FROM rondas_realizadas AS rr";
    sql += " LEFT JOIN rondas AS r ON r.rondaId = rr.rondaId";
    sql += " LEFT JOIN vigilantes AS v ON v.vigilanteId = rr.vigilanteId";
    sql += " LEFT JOIN rondas_realizadaspuntos AS rrp ON rrp.rondaRealizadaId = rr.rondaRealizadaId";
    sql += " LEFT JOIN puntos AS p ON p.puntoId = rrp.puntoId";
    sql += " LEFT JOIN terminales AS t ON t.terminalId = rr.terminalId";
    sql += " WHERE rr.vigilanteId = ? AND rr.fecha >= ? AND rr.fecha <= ?"
    if (dhora != "*") {
        sql += " AND rr.hora >= '" + dhora + "'";
    }
    if (hhora != "*") {
        sql += " AND rr.hora <= '" + hhora + "'";
    }
    sql += " ORDER BY rr.fecha, rr.hora, rrp.rondaRealizadaId, rrp.orden";
    sql = mysql.format(sql, [vigilanteId, dfecha, hfecha]);
    connection.query(sql, function(err, result) {
        if (err) {
            callback(err, null);
            return;
        }
        grupos = result;
        callback(null, fromDbToJsRondasVigilante(dfecha, hfecha, dhora, hhora, result));
    });
    closeConnectionCallback(connection, callback);
}


// getRondasTerminal
// Lee las rondas realizadas entre las fechas indicadas
module.exports.getRondasTerminal = function(terminalId, dfecha, hfecha, dhora, hhora, callback) {
    var connection = getConnection();
    var grupos = null;
    var sql = "SELECT t.nombre AS terminal,";
    sql += " rr.rondaRealizadaId, r.nombre AS nronda, rr.fecha AS rfecha, rr.hora AS rhora,";
    sql += " v.nombre AS vigilante,rr.resultado AS rresultado, rr.validada, rr.obsvalida";
    sql += " FROM rondas_realizadas AS rr";
    sql += " LEFT JOIN rondas AS r ON r.rondaId = rr.rondaId";
    sql += " LEFT JOIN vigilantes AS v ON v.vigilanteId = rr.vigilanteId";
    sql += " LEFT JOIN terminales AS t ON t.terminalId = rr.terminalId";
    sql += " WHERE rr.terminalId = ? AND rr.fecha >= ? AND rr.fecha <= ?"
    if (dhora != "*") {
        sql += " AND rr.hora >= '" + dhora + "'";
    }
    if (hhora != "*") {
        sql += " AND rr.hora <= '" + hhora + "'";
    }
    sql += " ORDER BY t.nombre, rr.fecha, rr.hora";
    sql = mysql.format(sql, [terminalId, dfecha, hfecha]);
    connection.query(sql, function(err, result) {
        if (err) {
            callback(err, null);
            return;
        }
        grupos = result;
        callback(null, fromDbToJsRondasTerminal(dfecha, hfecha, dhora, hhora, result));
    });
    closeConnectionCallback(connection, callback);
}


// getRondasPunto
// Lee las rondas realizadas entre las fechas indicadas
module.exports.getRondasPunto = function(puntoId, dfecha, hfecha, dhora, hhora, callback) {
    var connection = getConnection();
    var grupos = null;
    var sql = "SELECT p. puntoId, p.nombre AS punto, g.nombre AS grupo, e.nombre AS edificio, p.cota, p.cubiculo,";
    sql += " r.nombre AS ronda, rrp.fecha, rrp.hora,";
    sql += " v.nombre AS vigilante, t.nombre AS terminal, rrp.resultado";
    sql += " FROM puntos AS p";
    sql += " LEFT JOIN edificios AS e ON e.edificioId = p.edificioId";
    sql += " LEFT JOIN grupos AS g ON g.grupoId = e.grupoId";
    sql += " LEFT JOIN rondas_realizadaspuntos AS rrp ON rrp.puntoId = p.puntoId";
    sql += " LEFT JOIN rondas_realizadas AS rr ON rr.rondaRealizadaId = rrp.rondaRealizadaId";
    sql += " LEFT JOIN rondas AS r ON r.rondaId = rr.rondaId";
    sql += " LEFT JOIN vigilantes AS v ON v.vigilanteId = rr.vigilanteId";
    sql += " LEFT JOIN terminales AS t ON t.terminalId = rr.terminalId";
    sql += " WHERE p.puntoId = ? AND rrp.fecha >= ? AND rrp.fecha <= ?";
    if (dhora != "*") {
        sql += " AND rrp.hora >= '" + dhora + "'";
    }
    if (hhora != "*") {
        sql += " AND rrp.hora <= '" + hhora + "'";
    }
    sql += " ORDER BY rrp.fecha, rrp.hora";
    sql = mysql.format(sql, [puntoId, dfecha, hfecha]);
    connection.query(sql, function(err, result) {
        if (err) {
            callback(err, null);
            return;
        }
        grupos = result;
        callback(null, fromDbToJsRondasPunto(dfecha, hfecha, dhora, hhora, result));
    });
    closeConnectionCallback(connection, callback);
}

// getComparativoRondasAnual
// devuelve un array de objetos por cada mes del año pasado
// en cada elemento se devuelve un literal del tipo 'YYYY-MM'
// el total de rondas, cuantas correctas y cuantas con incidencias
module.exports.getComparativoRondasAnual = function(ano, callback) {
    var resultados = [];
    var meses = ['01', '02', '03', '04', '05', '06', '07', '08','09','10','11', '12']
    async.eachSeries(meses, function(mes, callback2) {
            var connection = getConnection();
            var y = ano + "-" + mes;
            var sql = "SELECT R1.m AS 'y', R1.a, R2.b, R3.c";
            sql += " FROM (SELECT '" + y +  "' AS m , COUNT(*) AS a FROM rondas_realizadas WHERE YEAR(fecha) = " + ano + " AND MONTH(fecha) = " + mes + ") AS R1";
            sql += " LEFT JOIN";
            sql += " (SELECT '" + y +  "' AS m , COUNT(*) AS b FROM rondas_realizadas WHERE YEAR(fecha) = " + ano + " AND MONTH(fecha) = " + mes + " AND resultado = 'CORRECTO') AS R2 ";
            sql += " ON R2.m = R1.m";
            sql += " LEFT JOIN ";
            sql += " (SELECT '" + y +  "' AS m , COUNT(*) AS c FROM rondas_realizadas WHERE YEAR(fecha) = " + ano + " AND MONTH(fecha) = " + mes + " AND resultado <> 'CORRECTO') AS R3 ";
            sql += " ON R3.m = R1.m;";
            connection.query(sql, function(err, res){
                closeConnectionCallback(connection, callback);
                if (err){
                    callback2(err);
                    return;
                }
                resultados.push(res[0]);
                callback2();
            });

        },
        function(err) {
            if (err) {
                callback(err);
            } else {
                callback(null, resultados);
            }

        });
}
