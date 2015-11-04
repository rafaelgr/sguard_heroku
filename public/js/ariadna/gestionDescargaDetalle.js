/*-------------------------------------------------------------------------- 
gestionDescargaDetalle.js
Funciones js par la página GestionDescargaDetalle.html
---------------------------------------------------------------------------*/
var responsiveHelper_dt_basic = undefined;
var responsiveHelper_datatable_fixed_column = undefined;
var responsiveHelper_datatable_col_reorder = undefined;
var responsiveHelper_datatable_tabletools = undefined;

var dataPuntos;

var breakpointDefinition = {
    tablet: 1024,
    phone: 480
};

var rondId = 0;

function initForm() {
    comprobarLogin();
    // de smart admin
    pageSetUp();
    // 
    getVersionFooter();
    vm = new admData();
    ko.applyBindings(vm);
    // asignación de eventos al clic
    $("#btnSalir").click(salir());
    $("#frmDescarga").submit(function() {
        return false;
    });


    // inicializar la tabla asociada.
    initTablaPuntos();

    rondId = gup('DescargaRealizadaId');
    if (rondId != 0) {
        var data = {
                rondaId: rondId
            }
            // hay que buscar ese elemento en concreto
        $.ajax({
            type: "GET",
            url: myconfig.apiUrl + "/api/descargas/leer-descarga/" + rondId,
            dataType: "json",
            contentType: "application/json",
            data: JSON.stringify(data),
            success: function(data, status) {
                // hay que mostrarlo en la zona de datos
                loadData(data);
            },
            error: errorAjax
        });
    } else {
        // se trata de un alta ponemos el id a cero para indicarlo.
        vm.rondaRealizadaId(0);
    }
}

function admData() {
    var self = this;
    self.numero = ko.observable();
    self.fecha = ko.observable();
    self.hora = ko.observable();
    self.terminal = ko.observable();
}

function loadData(data) {
    vm.numero(data.cabecera.descargaId);
    vm.fecha(moment(data.cabecera.fecha).format('DD/MM/YYYY'));    
    vm.hora(data.cabecera.hora);
    vm.terminal(data.cabecera.nterminal);
    loadTablaPuntos(data.lecturas);
}


function initTablaPuntos() {
    tablaCarro = $('#dt_rondapuntos').dataTable({
        autoWidth: true,
        "order": [
            [0, "desc"],
            [1, "desc"]
        ],
        preDrawCallback: function() {
            // Initialize the responsive datatables helper once.
            if (!responsiveHelper_dt_basic) {
                responsiveHelper_dt_basic = new ResponsiveDatatablesHelper($('#dt_rondapuntos'), breakpointDefinition);
            }
        },
        rowCallback: function(nRow) {
            responsiveHelper_dt_basic.createExpandIcon(nRow);
        },
        drawCallback: function(oSettings) {
            responsiveHelper_dt_basic.respond();
        },
        fnRowCallback: function(nRow, aData, iDisplayIndex, iDisplayIndexFull) {

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
        data: dataPuntos,
        columns: [{
            data: "tag"
        }, {
            data: "fecha",
            render: function(data, type, row) {
                if (!data) {
                    return "";
                }
                return moment(data).format('DD/MM/YYYY');
            }
        }, {
            data: "hora"
        }, {
            data: "tipo"
        }, {
            data: "nombre"
        }]
    });
}

function loadTablaPuntos(data) {
    var dt = $('#dt_rondapuntos').dataTable();
    if (data !== null && data.length === 0) {
        //mostrarMensajeSmart('No se han encontrado registros');
        //$("#tbAsgObjetivoPA").hide();
        dt.fnClearTable();
        dt.fnDraw();
    } else {
        dt.fnClearTable();
        dt.fnAddData(data);
        dt.fnDraw();
    }
}


function salir() {
    var mf = function() {
        var url = "GestionDescarga.html";
        window.open(url, '_self');
    }
    return mf;
}


function aceptar() {
    var mf = function() {
        // solo se puede cambiar el check de validación y las observaciones
        var fecha = moment(vm.fecha(), "DD/MM/YYYY").format('YYYY-MM-DD');
        var data = {
            rondaRealizada: {
                "rondaRealizadaId": rondId,
                "fecha": fecha,
                "hora": vm.hora(),
                "validada": vm.validada(),
                "obsvalida": vm.obsvalida()
            }
        };
        $.ajax({
            type: "PUT",
            url: myconfig.apiUrl + "/api/rondas-realizadas/" + rondId,
            dataType: "json",
            contentType: "application/json",
            data: JSON.stringify(data),
            success: function(data, status) {
                // Nos volvemos al general
                var url = "GestionDescarga.html?rondaRealizadaId=" + rondId;
                window.open(url, '_self');
            },
            error: errorAjax
        });
    };
    return mf;
}
