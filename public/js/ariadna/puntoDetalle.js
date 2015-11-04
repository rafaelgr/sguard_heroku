/*-------------------------------------------------------------------------- 
puntoDetalle.js
Funciones js par la página PuntoDetalle.html
---------------------------------------------------------------------------*/
var puntId = 0;

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
    $("#btnTag").click(tag());
    $("#frmPunto").submit(function() {
        return false;
    });

    loadPosiblesGrupos();


    $("#cmbGrupos").change(cambioGrupo());

    puntId = gup('PuntoId');
    if (puntId != 0) {
        var data = {
                puntoId: puntId
            }
            // hay que buscar ese elemento en concreto
        $.ajax({
            type: "GET",
            url: myconfig.apiUrl + "/api/puntos/" + puntId,
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
        vm.puntoId(0);
    }
}

function admData() {
    var self = this;
    self.puntoId = ko.observable();
    self.nombre = ko.observable();
    self.tag = ko.observable();
    self.bloque = ko.observable();
    self.edificioId = ko.observable();
    self.cota = ko.observable();
    self.cubiculo = ko.observable();
    self.observaciones = ko.observable();
    // -- apoyo de combos
    self.posiblesGrupos = ko.observableArray([]);
    self.grupo = ko.observable();
    self.posiblesEdificios = ko.observableArray([]);
    self.edificio = ko.observable();
}

function loadData(data) {
    vm.puntoId(data.puntoId);
    vm.edificioId(data.edificioId);
    loadPosiblesGrupos(data.grupoId)
    loadPosiblesEdificios(data.edificioId);
    vm.nombre(data.nombre);
    vm.tag(data.tag);
    vm.cota(data.cota);
    vm.cubiculo(data.cubiculo);
    vm.observaciones(data.observaciones);
    //

}

function datosOK() {
    $('#frmPunto').validate({
        rules: {
            cmbEdificios: {
                required: true
            },
            txtNombre: {
                required: true
            },
            txtTag: {
                required: true
            }
        },
        // Messages for form validation
        messages: {
            txtNombre: {
                required: 'Introduzca el nombre'
            },
            txtTag: {
                required: 'Introduzca el login'
            }
        },
        // Do not change code below
        errorPlacement: function(error, element) {
            error.insertAfter(element.parent());
        }
    });
    var opciones = $("#frmPunto").validate().settings;
    if (vm.edificio()) {
        opciones.rules.cmbEdificios.required = false;
    } else {
        opciones.rules.cmbEdificios.required = true;
    }
    return $('#frmPunto').valid();
}

function aceptar() {
    var mf = function() {
        if (!datosOK())
            return;
        var data = {
            punto: {
                "puntoId": vm.puntoId(),
                "nombre": vm.nombre(),
                "edificioId": vm.edificio().edificioId,
                "tag": vm.tag(),
                "cota": vm.cota(),
                "cubiculo": vm.cubiculo(),
                "observaciones": vm.observaciones()
            }
        };
        if (puntId == 0) {
            $.ajax({
                type: "POST",
                url: myconfig.apiUrl + "/api/puntos",
                dataType: "json",
                contentType: "application/json",
                data: JSON.stringify(data),
                success: function(data, status) {
                    // hay que mostrarlo en la zona de datos
                    loadData(data);
                    // Nos volvemos al general
                    var url = "PuntoControlGeneral.html?PuntoId=" + vm.puntoId();
                    window.open(url, '_self');
                },
                error: errorAjax
            });
        } else {
            $.ajax({
                type: "PUT",
                url: myconfig.apiUrl + "/api/puntos/" + puntId,
                dataType: "json",
                contentType: "application/json",
                data: JSON.stringify(data),
                success: function(data, status) {
                    // hay que mostrarlo en la zona de datos
                    loadData(data);
                    // Nos volvemos al general
                    var url = "PuntoControlGeneral.html?PuntoId=" + vm.puntoId();
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
        var url = "PuntoControlGeneral.html";
        window.open(url, '_self');
    }
    return mf;
}

function loadPosiblesGrupos(id) {
    $.ajax({
        type: "GET",
        url: myconfig.apiUrl + "/api/grupos",
        dataType: "json",
        contentType: "application/json",
        success: function(data, status) {
            // hay que mostrarlo en la zona de datos
            vm.posiblesGrupos(data);
            if (id) {
                for (var i = 0; i < data.length; i++) {
                    if (data[i].grupoId == id) {
                        vm.grupo(data[i]);
                    }
                }
            }
        },

        error: errorAjax
    });
}

function loadPosiblesEdificios(id, grupoId) {
    if (grupoId) {
        $.ajax({
            type: "GET",
            url: myconfig.apiUrl + "/api/edificios/grupos/" + grupoId,
            dataType: "json",
            contentType: "application/json",
            success: function(data, status) {
                // hay que mostrarlo en la zona de datos
                vm.posiblesEdificios(data);
            },
            error: errorAjax
        });
    } else {
        $.ajax({
            type: "GET",
            url: myconfig.apiUrl + "/api/edificios",
            dataType: "json",
            contentType: "application/json",
            success: function(data, status) {
                // hay que mostrarlo en la zona de datos
                vm.posiblesEdificios(data);
                if (id) {
                    for (var i = 0; i < data.length; i++) {
                        if (data[i].edificioId == id) {
                            vm.edificio(data[i]);
                        }
                    }
                }
            },
            error: errorAjax
        });
    }
}

function cambioGrupo() {
    var mf = function() {
        loadPosiblesEdificios(0, vm.grupo().grupoId);
    }
    return mf;
}

function tag() {
    var mf = function() {
        var mens = "Para la leer la etiqueta con el terminal, páselo por él hasta que la luz parpadee, luego pulse 'ACEPTAR'.";
        mens += "<br/> IMPORTANTE: Este proceso borra los datos en el terminal, si tiene rondas pendientes descárgelas antes.";

        $.SmartMessageBox({
            title: "<i class='fa fa-info'></i> Mensaje",
            content: mens,
            buttons: '[Aceptar][Cancelar]'
        }, function(ButtonPressed) {
            if (ButtonPressed === "Aceptar") {
                $("#btnTag").addClass('fa-spin');
                $.ajax({
                    type: "GET",
                    url: myconfig.apiUrl + "/api/terminal/records",
                    dataType: "json",
                    contentType: "application/json",
                    success: function(data, status) {
                        if (data.length == 0) {
                            mostrarMensajeSmart('No hay datos para leer');
                            $("#btnTag").removeClass('fa-spin');
                        } else {
                            var lectura = data[data.length - 1];
                            vm.tag(lectura.tag);
                            $("#btnTag").removeClass('fa-spin');
                            $.ajax({
                                type: "DELETE",
                                url: myconfig.apiUrl + "/api/terminal/records",
                                dataType: "json",
                                contentType: "application/json",
                                success: function(data, status) {},
                                error: errorAjax
                            });
                        }
                    },
                    error: errorAjax
                });
            }
        });
    }
    return mf;
}
