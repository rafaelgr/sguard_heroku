// administradores_db_mysql
// Manejo de la tabla administradores en la base de datos
var mysql = require("mysql"); // librería para el acceso a bases de datos MySQL
var async = require("async"); // librería para el manejo de llamadas asíncronas en JS
var moment = require("moment"); // librería para formateo de fechas y horas
var terminalBridge = require("../terminal/terminal-bridge.js");
// 
var vigilanteDb = require("../vigilantes/vigilantes_db_mysql");
var rondaDb = require("../rondas/rondas_db_mysql");
var puntoDb = require("../puntos/puntos_db_mysql");
var rondaRealizadaDb = require("../rondas_realizadas/rondas_realizadas_db_mysql")

//  leer la configurción de MySQL
var config = require("../../configMySQL.json");
var sql = "";

//
var descarga;
var lecturas;
var vigilanteId = null;
var rondaRealizada = null;
var resultadoRonda = "CORRECTO";
var resultadoLinea = "CORRECTO";
var logMens = "";
var ordenEnRonda = 0;

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


// getDescargasBuscar
// lee todos los registros de la tabla puntos cuyo
// nombre contiene la cadena de búsqueda. Si la cadena es '*'
// devuelve todos los registros
module.exports.getDescargasBuscar = function(numero, callback) {
    var connection = getConnection();
    var descargas = null;
    var sql = "SELECT * FROM descargas";
    if (numero != '*') {
        sql += " WHERE descargaId = ?";
        sql = mysql.format(sql, numero);
    }
    connection.query(sql, function(err, result) {
        if (err) {
            callback(err, null);
            return;
        }
        descargas = result;
        callback(null, descargas);
    });
    closeConnectionCallback(connection, callback);
}

module.exports.getDescargas = function(callback) {
    var connection = getConnection();
    var descargas = null;
    var sql = "SELECT * FROM descargas";
    connection.query(sql, function(err, result) {
        if (err) {
            callback(err, null);
            return;
        }
        descargas = result;
        callback(null, descargas);
    });
    closeConnectionCallback(connection, callback);
}


module.exports.getDescargaDelTerminal = function(callback) {
    // hay que obtener el númer del terminal lo primero
    terminalBridge.readTerminalNumber(function(err, result) {
        if (err) {
            callback(err, null);
            return;
        }
        var descarga = {
            cabecera: {
                descargaId: 0,
                nterminal: result,
                fecha: moment().format('YYYY-MM-DD'),
                hora: moment().format('HH:mm:ss'),
                resultado: "CARGA SIMPLE TERMINAL []"
            },
            lecturas: []
        };
        terminalBridge.getRecords(function(err, result) {
            if (err) {
                callback(err, null);
                return;
            }
            if (result.length == 0) {
                callback(null, null);
                return;
            }
            descarga.lecturas = result;
            guardaDescarga(descarga, function(err, result) {
                if (err) {
                    callback(err, null);
                    return;
                }
                callback(null, result);
                // lanzamos el borre de los registros procesados
                terminalBridge.deleteRecords(function(err, result) {
                    // no hacemos nada porque el callback lo hemos lanzado
                    // antes.
                });
            });
        });
    });
}

var fnGetDescargaDetalle = function(descargaId, callback) {
    var connection = getConnection();
    var descarga = {
        cabecera: null,
        lecturas: []
    };
    var sql = "SELECT d.descargaId, d.nterminal, d.fecha, d.hora, d.resultado,";
    sql += " t.terminalId,";
    sql += " dl.descargaLineaId, dl.tag, dl.fecha AS lfecha, dl.hora AS lhora, dl.tipo, dl.tipoId, dl.nombre";
    sql += " FROM descargas AS d";
    sql += " LEFT JOIN descargas_lineas AS dl ON dl.descargaId = d.descargaId";
    sql += " LEFT JOIN terminales AS t ON t.numero = d.nterminal";
    sql += " WHERE d.descargaId = ?";
    sql += " ORDER BY dl.fecha, dl.hora"
    sql = mysql.format(sql, descargaId);
    connection.query(sql, function(err, result) {
        closeConnectionCallback(connection, callback);
        if (err) {
            callback(err, null);
            return;
        }
        callback(null, fromDbToJsDescarga(descarga, result));
    });
}
module.exports.getDescargaDetalle = fnGetDescargaDetalle;


var fnProcesarDescarga = function(descargaId, callback) {
    fnGetDescargaDetalle(descargaId, function(err, res) {
        if (err) {
            callback(err);
            return;
        }
        if (!res) {
            callback(null, "** NO hay lecturas en la desarga NR:" + descargaId);
            return;
        }
        var descarga = res;
        var lecturas = descarga.lecturas;
        var vigilanteId = null;
        var rondaRealizada = null;
        var resultadoRonda = "CORRECTO";
        var resultadoLinea = "CORRECTO";
        var logMens = "-- PROCESAMIENTO DE LECTURA NUMERO:" + descargaId + "<br>";
        var ordenEnRonda = 0;
        // procesamos una a una las lecturas y actuamos en consecuencia
        async.eachSeries(lecturas,
            function(lectura, callback2) {
                var tipo = lectura.tipo;
                var tipoId = lectura.tipoId;
                // actuamos según el tipo
                switch (tipo) {
                    case "VIGILANTE":
                        logMens += "VIGILANTE TAG:" + lectura.tag + " Fecha: " + lectura.fecha + " Hora: " + lectura.hora + " ID: " + tipoId + " NOMBRE:" + lectura.nombre + "<br/>";
                        // ahora el vigilante ya no es nulo, simplemente eso
                        vigilanteId = tipoId;
                        callback2();
                        break;
                    case "RONDA":
                        logMens += "RONDA TAG:" + lectura.tag + " Fecha: " + lectura.fecha + " Hora: " + lectura.hora + " ID: " + tipoId + " NOMBRE:" + lectura.nombre + "<br/>";
                        if (rondaRealizada) {
                            // si había una ronda previa hay que actualizarla
                            var rr = {
                                resultado: resultadoRonda,
                                terminalId: descarga.cabecera.terminalId
                            }
                            if (resultadoRonda == "CORRECTO") {
                                rr.validada = 1;
                                rr.obsvalida = "VALIDACION AUTOMÁTICA";
                            }
                            rondaRealizadaDb.putRondaRealizadaCarga(rondaRealizada.rondaRealizadaId, rr, function(err, res) {
                                if (err) {
                                    logMens += "ERROR: " + err.Message + "<br/>";
                                    callback2(err);
                                    return;
                                }
                                // Ahora hay que crear la nueva
                                resultadoRonda = "CORRECTO"; // por defecto OK
                                if (!vigilanteId) {
                                    resultadoRonda = "SIN VIGILANTE";
                                }
                                // no hay ronda previa (creamos una nueva)
                                rondaRealizadaDb.postRondaRealizadaDesdeTag(lectura.tag, lectura.fecha, lectura.hora, vigilanteId, descarga.cabecera.terminalId, function(err, res) {
                                    if (err) {
                                        logMens += "ERROR: " + err.Message + "<br/>";
                                        callback2(err);
                                        return;
                                    }
                                    rondaRealizada = res;
                                    logMens += "** CREADA RONDA REALIZADA ID:" + rondaRealizada.rondaRealizadaId + " NOMBRE:" + lectura.nombre + "<br/>";
                                    ordenEnRonda = 0;
                                    callback2(); // seguimos
                                });
                            });
                        } else {
                            if (!vigilanteId) {
                                resultadoRonda = "SIN VIGILANTE";
                            }
                            // no hay ronda previa (creamos una nueva)
                            rondaRealizadaDb.postRondaRealizadaDesdeTag(lectura.tag, lectura.fecha, lectura.hora, vigilanteId, descarga.cabecera.terminalId, function(err, res2) {
                                if (err) {
                                    logMens += "ERROR: " + err.Message + "<br/>";
                                    callback2(err);
                                    return;
                                }
                                rondaRealizada = res2;
                                logMens += "** CREADA RONDA REALIZADA ID:" + rondaRealizada.rondaRealizadaId + " NOMBRE:" + lectura.nombre + "<br/>";
                                ordenEnRonda = 0;
                                callback2(); // seguimos
                            });
                        }
                        break;
                    case "PUNTO":
                        logMens += "PUNTO TAG:" + lectura.tag + " Fecha: " + lectura.fecha + " Hora: " + lectura.hora + " ID: " + tipoId + " NOMBRE:" + lectura.nombre + "<br/>";
                        ordenEnRonda++;
                        // controlamos si no hay ronda previa
                        if (!rondaRealizada) {
                            // crearemos una ronda realizada que no pertenece a ninguna existente
                            resultadoRonda = "R. DESCONOCIDA";
                            // al compartir rondas entre puntos no podemos asegurar a cual pertenece
                            if (!vigilanteId) {
                                resultadoRonda += " / SIN VIGILANTE";
                            }
                            var rr = {
                                rondaRealizadaId: 0,
                                rondaId: null,
                                vigilanteId: vigilanteId,
                                fecha: lectura.fecha,
                                hora: lectura.hora,
                                terminalId: descarga.cabecera.terminalId
                            };
                            // no hay ronda previa (creamos una nueva)
                            rondaRealizadaDb.postRondaRealizada(rr, function(err, res2) {
                                if (err) {
                                    logMens += "ERROR: " + err.Message + "<br/>";
                                    callback2(err);
                                    return;
                                }
                                rondaRealizada = res2;
                                logMens += "** CREADA RONDA REALIZADA DESCONOCIDA ID:" + rondaRealizada.rondaRealizadaId + " NOMBRE:" + lectura.nombre + "<br/>";
                                ordenEnRonda = 0;
                                fnProcesarPuntoLeido(lectura, rondaRealizada, ordenEnRonda, function(err) {
                                    if (err) {
                                        return callback2(err);
                                    }
                                    return callback2();
                                });
                            });
                        } else {
                            fnProcesarPuntoLeido(lectura, rondaRealizada, ordenEnRonda, function(err) {
                                if (err) {
                                    return callback2(err);
                                }
                                return callback2();
                            });
                        }
                        break;
                    default:
                        logMens += "DESCONOCIDO TAG:" + lectura.tag + " Fecha: " + lectura.fecha + " Hora: " + lectura.hora + "<br/>";
                        ordenEnRonda++;
                        // controlamos si no hay ronda previa
                        if (!rondaRealizada) {
                            // crearemos una ronda realizada que no pertenece a ninguna existente
                            resultadoRonda = "R. DESCONOCIDA";
                            // al compartir rondas entre puntos no podemos asegurar a cual pertenece
                            if (!vigilanteId) {
                                resultadoRonda += " / SIN VIGILANTE";
                            }
                            var rr = {
                                rondaRealizadaId: 0,
                                rondaId: null,
                                vigilanteId: vigilanteId,
                                fecha: lectura.fecha,
                                hora: lectura.hora
                            };
                            // no hay ronda previa (creamos una nueva)
                            rondaRealizadaDb.postRondaRealizada(rr, function(err, res2) {
                                if (err) {
                                    logMens += "ERROR: " + err.Message + "<br/>";
                                    callback2(err);
                                    return;
                                }
                                rondaRealizada = res2;
                                logMens += "** CREADA RONDA REALIZADA DESCONOCIDA ID:" + rondaRealizada.rondaRealizadaId + " NOMBRE:" + lectura.nombre + "<br/>";
                                ordenEnRonda = 0;
                                fnProcesarPuntoLeido(lectura, rondaRealizada, ordenEnRonda, function(err) {
                                    if (err) {
                                        return callback2(err);
                                    }
                                    return callback2();
                                });
                            });
                        } else {
                            fnProcesarPuntoLeido(lectura, rondaRealizada, ordenEnRonda, function(err) {
                                if (err) {
                                    return callback2(err);
                                }
                                return callback2();
                            });
                        }
                        break;
                }
                // a por la siguiente lectura
                //callback2();
            },
            function(err) {
                if (err) {
                    callback(err);
                    return;
                }
                logMens += "--- PROCESO FINALIZADO SIN ERRORES (pueden haber incidencias) --";
                if (rondaRealizada) {
                    // si había una ronda previa hay que actualizarla
                    var rr = {
                        resultado: resultadoRonda,
                        terminalId: descarga.cabecera.terminalId
                    }
                    if (resultadoRonda == "CORRECTO") {
                        rr.validada = 1;
                        rr.obsvalida = "VALIDACION AUTOMÁTICA";
                    }

                    rondaRealizadaDb.putRondaRealizadaCarga(rondaRealizada.rondaRealizadaId, rr, function(err, res) {
                        if (err) {
                            logMens += "ERROR: " + err.Message + "<br/>";
                            callback(err);
                            return;
                        }
                        callback(null, logMens);
                    });
                } else {
                    callback(null, logMens);
                }
            });
    });

};
module.exports.procesarDescarga = fnProcesarDescarga;

var fnProcesarPuntoLeido = function(lectura, rondaRealizada, ordenEnRonda, callback) {
    // lo buscamos en la base de datos
    var id = rondaRealizada.rondaRealizadaId;
    rondaRealizadaDb.getPuntoRondaRealizadaCarga(id, lectura.tipoId, function(err, res) {
        if (err) {
            logMens += "ERROR: " + err.Message + "<br/>";
            callback(err);
            return;
        }
        var puntos = res;
        if (puntos.length > 0 && !puntos[0].fecha) {
            // ha encontrado el punto
            var punto = puntos[0];
            var prr = {
                fecha: lectura.fecha,
                hora: lectura.hora,
                resultado: "CORRECTO",
                tagleido: lectura.tag,
                ordenleido: ordenEnRonda,
                nombre: lectura.nombre
            };
            if (punto.orden == ordenEnRonda) {
                prr.resultado = "CORRECTO";
                logMens += "PUNTO ID:" + lectura.tipoId + " ENCONTRADO EN SECUENCIA CORRECTA" + " NOMBRE:" + lectura.nombre + "<br/>";
            } else {
                prr.resultado = "FUERA DE SECUENCIA";
                resultadoRonda = "PUNTOS FUERA DE SECUENCIA";
                logMens += "PUNTO ID:" + lectura.tipoId + " ENCONTRADO FUERA DE SECUENCIA" + " NOMBRE:" + lectura.nombre + "<br/>";
            }
            rondaRealizadaDb.putPuntoRondaRealizadaCarga(punto.rondaRealizadaPuntoId, prr, function(err, res) {
                if (err) {
                    logMens += "ERROR: " + err.Message + "<br/>";
                    callback(err);
                    return;
                }
                callback();
                return;
            });
        } else {
            // no ha encontrado el punto
            // lo creamos en la ronda activa
            var prr = {
                rondaRealizadaPuntoId: 0,
                rondaRealizadaId: rondaRealizada.rondaRealizadaId,
                orden: null,
                puntoId: lectura.tipoId,
                fecha: lectura.fecha,
                hora: lectura.hora,
                tagleido: lectura.tag,
                ordenleido: ordenEnRonda,
                nombre: lectura.nombre,
                resultado: "NO EN ESTA RONDA"
            }
            if (!lectura.tipoId) {
                prr.resultado = "TAG DESCONOCIDO";
            }
            if (puntos.length > 0 && puntos[0].fecha) {
                prr.resultado = "PUNTO REPETIDO";
            }
            rondaRealizadaDb.postPuntoRondaRealizada(prr, function(err, res) {
                if (err) {
                    logMens += "ERROR: " + err.Message + "<br/>";
                    callback(err);
                    return;
                }
                logMens += "*************** PUNTO ID:" + lectura.tipoId + " NO PERTENECE A ESTA RONDA " + " NOMBRE:" + lectura.nombre + "<br/>";
                callback();
                return;
            });
        }
    });

}

function fromDbToJsDescarga(descarga, registros) {
    if (registros.length == 0) {
        return null;
    }
    var registro = registros[0];
    descarga.cabecera = {
        descargaId: registro.descargaId,
        nterminal: registro.nterminal,
        terminalId: registro.terminalId,
        fecha: registro.fecha,
        hora: registro.hora
    };
    for (var i = 0; i < registros.length; i++) {
        var r = registros[i];
        var l = {
            tag: r.tag,
            fecha: moment(r.lfecha).format('YYYY-MM-DD'),
            hora: r.lhora,
            tipo: r.tipo,
            tipoId: r.tipoId,
            nombre: r.nombre
        }
        descarga.lecturas.push(l);
    }
    return descarga;
}

// Verifica TAG
// Conmprueba si el tag leido corresponde a una roda, vigilante o punto
// devuelve una cadena con el tipo y el identificador del registro en la base de datos.
// VIGIN, VIGFN (Vigilante inicio y final)
// RNDIN, RDNFN (Ronda inicio y final)
// PUNTO (Punto)
function verificaTAG(tag, callback_serie) {
    async.series([
            function(callback) {
                vigilanteDb.getVigilantesBuscarTag(tag, function(err, result) {
                    if (err) {
                        callback(err, null);
                        return;
                    }
                    if (result.length == 0) {
                        callback(null, null);
                        return;
                    }
                    var vigilante = result[0];
                    var tipo = "VIGILANTE";
                    if (vigilante.tagf && tag == vigilante.tagf) {
                        tipo = "VIGILANTEF";
                    }
                    callback(null, {
                        tipo: tipo,
                        id: vigilante.vigilanteId,
                        nombre: vigilante.nombre
                    });
                });
            },
            function(callback) {
                rondaDb.getRondaDetalleTag(tag, function(err, result) {
                    if (err) {
                        callback(err, null);
                        return;
                    }
                    if (!result) {
                        callback(null, null);
                        return;
                    }
                    var ronda = result;
                    var tipo = "RONDA";
                    if (ronda.tagf && tag == ronda.tagf) {
                        tipo = "RONDAF";
                    }
                    callback(null, {
                        tipo: tipo,
                        id: ronda.rondaId,
                        nombre: ronda.nombre
                    });
                });
            },
            function(callback) {
                puntoDb.getPuntoTag(tag, function(err, result) {
                    if (err) {
                        callback(err, null);
                        return;
                    }
                    if (!result) {
                        callback(null, null);
                        return;
                    }
                    var punto = result;
                    var tipo = "PUNTO";
                    callback(null, {
                        tipo: tipo,
                        id: punto.puntoId,
                        nombre: punto.nombre
                    });
                });
            }
        ],
        function(err, results) {
            if (err) {
                callback_serie(err, null);
            }
            var mresult = null;
            for (var i = 0; i < results.length; i++) {
                if (results[i]) {
                    mresult = results[i];
                }
            }
            callback_serie(null, mresult);
        });
}

//--- Montaje para llamada síncrona en los insert
function procesarLecturas(descargaId, lecturas, callback_procesar) {
    var i = 0;
    async.eachSeries(lecturas,
        function(lectura, callback) {
            verificaTAG(lectura.tag, function(err, result) {
                if (err) {
                    callback(err);
                    return;
                }
                var fecha = lectura.stamp.substr(0, 4) + "-" + lectura.stamp.substr(4, 2) + "-" + lectura.stamp.substr(6, 2);
                var hora = lectura.stamp.substr(8, 2) + ":" + lectura.stamp.substr(10, 2) + ":" + lectura.stamp.substr(12, 2);
                var descargaLinea = {
                    descargaId: descargaId,
                    tag: lectura.tag,
                    fecha: fecha,
                    hora: hora,
                    tipo: null,
                    tipoId: null,
                    nombre: null
                };
                descargaLinea.descargaId = descargaId;
                if (result) {
                    descargaLinea.tipo = result.tipo;
                    descargaLinea.tipoId = result.id;
                    descargaLinea.nombre = result.nombre;
                }
                lectura.fecha = fecha;
                lectura.hora = hora;
                lectura.tipo = descargaLinea.tipo;
                lectura.tipoId = descargaLinea.tipoId;
                lectura.nombre = descargaLinea.nombre;
                var connection = getConnection();
                var sql = "INSERT INTO descargas_lineas SET ?";
                sql = mysql.format(sql, descargaLinea);
                connection.query(sql, function(err, result) {
                    closeConnectionCallback(connection, callback);
                    if (err) {
                        callback(err);
                    } else {
                        callback();
                    }
                });

            });
        },
        function(err) {
            callback_procesar(err)
        });
}

function guardaDescarga(descarga, callback) {
    var connection = getConnection();
    sql = "INSERT INTO descargas SET ?";
    sql = mysql.format(sql, descarga.cabecera);
    connection.query(sql, function(err, result) {
        closeConnectionCallback(connection, callback);
        if (err) {
            callback(err);
            return;
        }
        descarga.cabecera.descargaId = result.insertId;
        //
        var lecturas = descarga.lecturas;
        procesarLecturas(descarga.cabecera.descargaId, lecturas, function(err) {
            if (err) {
                callback(err);
                return;
            }
            callback(null, descarga);
        });
    });
}
