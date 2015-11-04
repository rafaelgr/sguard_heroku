/*-------------------------------------------------------------------------- 
administradorGeneral.js
Funciones js par la página AdministradorGeneral.html

---------------------------------------------------------------------------*/
var responsiveHelper_dt_basic = undefined;
var responsiveHelper_datatable_fixed_column = undefined;
var responsiveHelper_datatable_col_reorder = undefined;
var responsiveHelper_datatable_tabletools = undefined;


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
    $('#btnAceptar').click(leerNumeroTerminal);
    $('#frmLeerNum').submit(function () {
        return false
    });
}

function buscarAdministradores() {
    var mf = function () {
        if (!datosOK()) {
            return;
        }
        // obtener el n.serie del certificado para la firma.
        var aBuscar = $('#txtBuscar').val();
        // enviar la consulta por la red (AJAX)
        var data = {
            "nombre": aBuscar
        };
        $.ajax({
            type: "POST",
            url: "api/administradores-buscar",
            dataType: "json",
            contentType: "application/json",
            data: JSON.stringify(data),
            success: function (data, status) {
                // hay que mostrarlo en la zona de datos
                loadTablaAdministradores(data);
            },
            error: errorAjax
        });
    };
    return mf;
}

var leerNumeroTerminal = function(){
    var btnAceptar = $('#btnAceptar');
    btnAceptar.addClass('fa-spin');
    $.ajax({
            type: "GET",
            url: myconfig.apiUrl + "/api/terminal/read-terminal-number",
            dataType: "json",
            contentType: "application/json",
            success: function (data, status) {
                $('#txtRespuesta').val(data);
                btnAceptar.removeClass('fa-spin');
            },
            error: errorAjax
        });
};

