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
    $('#btnAceptar').click(leerDatos);
    $('#frmLeerDatos').submit(function() {
        return false
    });
}


var leerDatos = function() {
    var btnAceptar = $('#btnAceptar');
    btnAceptar.addClass('fa-spin');
    $.ajax({
        type: "GET",
        url: myconfig.apiUrl + "/api/descargas/leer-terminal",
        dataType: "json",
        contentType: "application/json",
        success: function(data, status) {
            //$('#txtRespuesta').val(JSON.stringify(data, null,2));
            if (data) {
                $.ajax({
                    type: "GET",
                    url: myconfig.apiUrl + "/api/descargas/procesar-descarga/" + data.cabecera.descargaId,
                    dataType: "json",
                    contentType: "application/json",
                    success: function(data, status) {
                        $('#txtRespuesta').html(data);
                        btnAceptar.removeClass('fa-spin');
                    },
                    error: errorAjax
                });
            }else{
                $('#txtRespuesta').html("No hay lecturas en el terminal");
                btnAceptar.removeClass('fa-spin');
            }

        },
        error: errorAjax
    });
};
