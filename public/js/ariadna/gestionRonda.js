/*-------------------------------------------------------------------------- 
rondaGeneral.js
Funciones js par la página RondaGeneral.html

---------------------------------------------------------------------------*/
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
    //
    $('#btnBuscar').click(buscarRondasRealizadas());
    $('#btnAlta').click(crearRondaRealizada());
    $('#frmBuscar').submit(function () {
        return false
    });
    //$('#txtBuscar').keypress(function (e) {
    //    if (e.keyCode == 13)
    //        buscarRondas();
    //});
    //
    initTablaRondasRealizadas();
    // comprobamos parámetros
    rondaRealizadaId = gup('RondaRealizadaId');
    if (rondaRealizadaId !== '') {
        // cargar la tabla con un único valor que es el que corresponde.
        var data = {
            id: rondaRealizadaId
        }
        // hay que buscar ese elemento en concreto
        $.ajax({
            type: "GET",
            url: myconfig.apiUrl + "/api/rondas_realizadas/" + rondaRealizadaId,
            dataType: "json",
            contentType: "application/json",
            data: JSON.stringify(data),
            success: function (data, status) {
                // hay que mostrarlo en la zona de datos
                var data2 = [data];
                loadTablaRondasRealizadas(data2);
            },
            error: errorAjax
        });
    }
}

function initTablaRondasRealizadas() {
    tablaCarro = $('#dt_ronda').dataTable({
        autoWidth: true,
        "order": [[ 2, "desc" ],[ 3, "desc" ]],
        preDrawCallback: function () {
            // Initialize the responsive datatables helper once.
            if (!responsiveHelper_dt_basic) {
                responsiveHelper_dt_basic = new ResponsiveDatatablesHelper($('#dt_ronda'), breakpointDefinition);
            }
        },
        rowCallback: function (nRow) {
            responsiveHelper_dt_basic.createExpandIcon(nRow);
        },
        drawCallback: function (oSettings) {
            responsiveHelper_dt_basic.respond();
        },
        fnRowCallback: function(nRow, aData, iDisplayIndex, iDisplayIndexFull) {
            if (aData.resultado != 'CORRECTO'){
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
        },{
            data: "vnombre"
        },{
            data: "fecha",
            render: function(data, type, row){
                return moment(data).format('DD/MM/YYYY');
            }
        },{
            data: "hora"
        },{
            data: "resultado"
        }, {
            data: "rondaRealizadaId",
            render: function (data, type, row) {
                var bt2 = "<button class='btn btn-circle btn-success btn-lg' onclick='editRondaRealizada(" + data + ");' title='Editar registro'> <i class='fa fa-edit fa-fw'></i> </button>";
                var html = "<div class='pull-right'>" + bt2 + "</div>";
                return html;
            }
        }]
    });
}

function datosOK() {
    //TODO: Incluir en la validación si el certificado figura en el almacén de certificados.
    $('#frmBuscar').validate({
        rules: {
            txtBuscar: { required: true },
        },
        // Messages for form validation
        messages: {
            txtBuscar: {
                required: 'Introduzca el texto a buscar'
            }
        },
        // Do not change code below
        errorPlacement: function (error, element) {
            error.insertAfter(element.parent());
        }
    });
    return $('#frmBuscar').valid();
}

function loadTablaRondasRealizadas(data) {
    var dt = $('#dt_ronda').dataTable();
    if (data !== null && data.length === 0) {
        mostrarMensajeSmart('No se han encontrado registros');
        $("#tbRonda").hide();
    } else {
        dt.fnClearTable();
        dt.fnAddData(data);
        dt.fnDraw();
        $("#tbRonda").show();
    }
}

function buscarRondasRealizadas() {
    var mf = function () {
        if (!datosOK()) {
            return;
        }
        // obtener el n.serie del certificado para la firma.
        var aBuscar = $('#txtBuscar').val();
        // enviar la consulta por la red (AJAX)
        $.ajax({
            type: "GET",
            url: myconfig.apiUrl + "/api/rondas-realizadas/?nombre=" + aBuscar,
            dataType: "json",
            contentType: "application/json",
            success: function (data, status) {
                // hay que mostrarlo en la zona de datos
                loadTablaRondasRealizadas(data);
            },
            error: errorAjax
        });
    };
    return mf;
}

function crearRondaRealizada() {
    var mf = function () {
        var url = "GestionRondaNueva.html";
        window.open(url, '_self');
    };
    return mf;
}

function deleteRondaRealizada(id) {
    // mensaje de confirmación
    var mens = "¿Realmente desea borrar este registro?";
    $.SmartMessageBox({
        title: "<i class='fa fa-info'></i> Mensaje",
        content: mens,
        buttons: '[Aceptar][Cancelar]'
    }, function (ButtonPressed) {
        if (ButtonPressed === "Aceptar") {
            var data = {
                rondaId: id
            };
            $.ajax({
                type: "DELETE",
                url: myconfig.apiUrl + "/api/rondas-realizadas/" + id,
                dataType: "json",
                contentType: "application/json",
                data: JSON.stringify(data),
                success: function (data, status) {
                    var fn = buscarRondasRealizadas();
                    fn();
                },
                error: errorAjax
            });
        }
        if (ButtonPressed === "Cancelar") {
            // no hacemos nada (no quiere borrar)
        }
    });
}

function editRondaRealizada(id) {
    // hay que abrir la página de detalle de ronda
    // pasando en la url ese ID
    var url = "GestionRondaDetalle.html?RondaRealizadaId=" + id;
    window.open(url, '_self');
}


