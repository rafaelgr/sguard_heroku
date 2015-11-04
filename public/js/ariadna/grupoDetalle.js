/*-------------------------------------------------------------------------- 
grupoDetalle.js
Funciones js par la página GrupoDetalle.html
---------------------------------------------------------------------------*/
var adminId = 0;

function initForm() {
    comprobarLogin();
    // de smart admin
    pageSetUp();
    // 
    getVersionFooter();
    vm = new admData();
    ko.applyBindings(vm);
    // asignación de eventos al clic
    $("#btnAceptar").click(aceptar());
    $("#btnSalir").click(salir());
    $("#frmGrupo").submit(function() {
        return false;
    });

    adminId = gup('GrupoId');
    if (adminId != 0) {
        var data = {
                grupoId: adminId
            }
            // hay que buscar ese elemento en concreto
        $.ajax({
            type: "GET",
            url: myconfig.apiUrl + "/api/grupos/" + adminId,
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
        vm.grupoId(0);
    }
}

function admData() {
    var self = this;
    self.grupoId = ko.observable();
    self.nombre = ko.observable();
}

function loadData(data) {
    vm.grupoId(data.grupoId);
    vm.nombre(data.nombre);
}

function datosOK() {
    return $('#frmGrupo').valid();
}

function aceptar() {
    var mf = function() {
        if (!datosOK())
            return;
        var data = {
            grupo: {
                "grupoId": vm.grupoId(),
                "nombre": vm.nombre()
            }
        };
        if (adminId == 0) {
            $.ajax({
                type: "POST",
                url: myconfig.apiUrl + "/api/grupos",
                dataType: "json",
                contentType: "application/json",
                data: JSON.stringify(data),
                success: function(data, status) {
                    // hay que mostrarlo en la zona de datos
                    loadData(data);
                    // Nos volvemos al general
                    var url = "GrupoGeneral.html?GrupoId=" + vm.grupoId();
                    window.open(url, '_self');
                },
                error: errorAjax
            });
        } else {
            $.ajax({
                type: "PUT",
                url: myconfig.apiUrl + "/api/grupos/" + adminId,
                dataType: "json",
                contentType: "application/json",
                data: JSON.stringify(data),
                success: function(data, status) {
                    // hay que mostrarlo en la zona de datos
                    loadData(data);
                    // Nos volvemos al general
                    var url = "GrupoGeneral.html?GrupoId=" + vm.grupoId();
                    window.open(url, '_self');
                },
                error: errorAjax
            });
        }
    };
    return mf;
}

function salir() {
    var mf = function() {
        var url = "GrupoGeneral.html";
        window.open(url, '_self');
    };
    return mf;
}
