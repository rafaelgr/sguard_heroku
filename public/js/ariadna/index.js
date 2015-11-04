// de blank_ (pruebas)
var chart = null;
var responsiveHelper_dt_basic = undefined;
var responsiveHelper_datatable_fixed_column = undefined;
var responsiveHelper_datatable_col_reorder = undefined;
var responsiveHelper_datatable_tabletools = undefined;

var dataRondasRealizadas;
var rondaRealizadaId;

var breakpointDefinition = {
    tablet: 1024,
    phone: 480
};


function initForm() {
    comprobarLogin();
    // de smart admin
    pageSetUp();
    getVersionFooter();
    cargarGraficos();
    initTablaRondasRealizadas();
    buscarRondasRealizadas();
}

function cargarGraficos() {
    $.ajax({
        type: "GET",
        url: myconfig.apiUrl + "/api/informes/rondas/ano/?ano=" + moment().format('YYYY'),
        dataType: "json",
        contentType: "application/json",
        success: function(data, status) {
            Morris.Bar({
                element: 'grrondas',
                data: data,
                xkey: 'y',
                ykeys: ['a', 'b', 'c'],
                labels: ['TOTAL', 'CORRECTO', 'CON INCIDENCIA']
            });
        },
        error: errorAjax
    });
}

function initTablaRondasRealizadas() {
    tablaCarro = $('#dt_ronda').dataTable({
        autoWidth: true,
        "order": [
            [2, "desc"],
            [3, "desc"]
        ],
        preDrawCallback: function() {
            // Initialize the responsive datatables helper once.
            if (!responsiveHelper_dt_basic) {
                responsiveHelper_dt_basic = new ResponsiveDatatablesHelper($('#dt_ronda'), breakpointDefinition);
            }
        },
        rowCallback: function(nRow) {
            responsiveHelper_dt_basic.createExpandIcon(nRow);
        },
        drawCallback: function(oSettings) {
            responsiveHelper_dt_basic.respond();
        },
        fnRowCallback: function(nRow, aData, iDisplayIndex, iDisplayIndexFull) {
            if (aData.resultado != 'CORRECTO') {
                $(nRow).css('color', 'red')
            }
        },
        language: {
            processing: "Procesando...",
            info: "Mostrando registros del _START_ al _END_ de un total de _TOTAL_ registros",
            infoEmpty: "Mostrando registros del 0 al 0 de un total de 0 registros",
            infoFiltered: "(filtrado de un total de _MAX_ registros)",
            infoPostFix: "",
            loadingRecords: "Cargando...",
            zeroRecords: "No se encontraron resultados",
            emptyTable: "Ningún dato disponible en esta tabla",
            paginate: {
                first: "Primero",
                previous: "Anterior",
                next: "Siguiente",
                last: "Último"
            },
            aria: {
                sortAscending: ": Activar para ordenar la columna de manera ascendente",
                sortDescending: ": Activar para ordenar la columna de manera descendente"
            }
        },
        data: dataRondasRealizadas,
        columns: [{
            data: "rnombre"
        }, {
            data: "vnombre"
        }, {
            data: "fecha",
            render: function(data, type, row) {
                return moment(data).format('DD/MM/YYYY');
            }
        }, {
            data: "hora"
        }, {
            data: "resultado"
        }, {
            data: "rondaRealizadaId",
            render: function(data, type, row) {
                var bt2 = "<button class='btn btn-circle btn-success btn-lg' onclick='editRondaRealizada(" + data + ");' title='Editar registro'> <i class='fa fa-edit fa-fw'></i> </button>";
                var html = "<div class='pull-right'>" + bt2 + "</div>";
                return html;
            }
        }]
    });
}

function loadTablaRondasRealizadas(data) {
    var dt = $('#dt_ronda').dataTable();
    if (data !== null && data.length === 0) {
        // mostrarMensajeSmart('No se han encontrado registros');
        dt.fnClearTable();
        dt.fnDraw();
    } else {
        dt.fnClearTable();
        dt.fnAddData(data);
        dt.fnDraw();
    }
}

function buscarRondasRealizadas() {
    // enviar la consulta por la red (AJAX)
    $.ajax({
        type: "GET",
        url: myconfig.apiUrl + "/api/rondas-realizadas/novalidadas",
        dataType: "json",
        contentType: "application/json",
        success: function(data, status) {
            // hay que mostrarlo en la zona de datos
            loadTablaRondasRealizadas(data);
        },
        error: errorAjax
    });
}

function editRondaRealizada(id) {
    // hay que abrir la página de detalle de ronda
    // pasando en la url ese ID
    var url = "GestionRondaDetalle.html?RondaRealizadaId=" + id + "&llamada=index";
    window.open(url, '_self');
}


function buscarRondasRealizadas2() {
    var mf = function() {
        // obtener el n.serie del certificado para la firma.
        // enviar la consulta por la red (AJAX)
        $.ajax({
            type: "GET",
            url: myconfig.apiUrl + "/api/rondas-realizadas/?nombre=*",
            dataType: "json",
            contentType: "application/json",
            success: function(data, status) {
                // hay que mostrarlo en la zona de datos
                loadTablaRondasRealizadas(data);
            },
            error: errorAjax
        });
    };
    return mf;
}
