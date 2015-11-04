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
    $('#frmLeerDatos').submit(function () {
        return false
    });
}


var leerDatos = function(){
    var btnAceptar = $('#btnAceptar');
    btnAceptar.addClass('fa-spin');
    $.ajax({
            type: "GET",
            url: myconfig.apiUrl + "/api/terminal/records",
            dataType: "json",
            contentType: "application/json",
            success: function (data, status) {
                $('#txtRespuesta').val(JSON.stringify(data, null,2));
                btnAceptar.removeClass('fa-spin');
            },
            error: errorAjax
        });
};

