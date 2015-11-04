/*-------------------------------------------------------------------------- 
terminalDetalle.js
Funciones js par la página TerminalDetalle.html
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
    $("#frmTerminal").submit(function() {
        return false;
    });

    $.validator.addMethod("greaterThan",
        function(value, element, params) {
            var fv = moment(value, "DD/MM/YYYY").format("YYYY-MM-DD");
            var fp = moment($(params).val(), "DD/MM/YYYY").format("YYYY-MM-DD");
            if (!/Invalid|NaN/.test(new Date(fv))) {
                return new Date(fv) >= new Date(fp);
            } else {
                // esto es debido a que permitimos que la segunda fecha nula
                return true;
            }
        }, 'La fecha final debe ser mayor que la inicial.');


    $.datepicker.regional['es'] = {
        closeText: 'Cerrar',
        prevText: '&#x3C;Ant',
        nextText: 'Sig&#x3E;',
        currentText: 'Hoy',
        monthNames: ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'],
        monthNamesShort: ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'],
        dayNames: ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado'],
        dayNamesShort: ['dom', 'lun', 'mar', 'mié', 'jue', 'vie', 'sáb'],
        dayNamesMin: ['D', 'L', 'M', 'X', 'J', 'V', 'S'],
        weekHeader: 'Sm',
        dateFormat: 'dd/mm/yy',
        firstDay: 1,
        isRTL: false,
        showMonthAfterYear: false,
        yearSuffix: ''
    };

    $.datepicker.setDefaults($.datepicker.regional['es']);



    adminId = gup('TerminalId');
    if (adminId != 0) {
        var data = {
                terminalId: adminId
            }
            // hay que buscar ese elemento en concreto
        $.ajax({
            type: "GET",
            url: myconfig.apiUrl + "/api/terminales/" + adminId,
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
        vm.terminalId(0);
    }
}

function admData() {
    var self = this;
    self.terminalId = ko.observable();
    self.nombre = ko.observable();
    self.numero = ko.observable();
    self.fechaAlta = ko.observable();
    self.fechaBaja = ko.observable();
    self.observaciones = ko.observable();
}

function loadData(data) {
    vm.terminalId(data.terminalId);
    vm.numero(data.numero);
    vm.nombre(data.nombre);
    vm.fechaAlta(moment(data.fechaAlta).format("DD/MM/YYYY"));
    if (data.fechaBaja) {
        vm.fechaBaja(moment(data.fechaBaja).format("DD/MM/YYYY"));
    }
    vm.observaciones(data.observaciones);
}

function datosOK() {
    $('#frmTerminal').validate({
        rules: {
            txtNumero: {
                required: true
            },
            txtNombre: {
                required: true
            },
            txtFechaAlta: {
                required: true,
                date: true
            },
            txtFechaBaja: {
                required: false,
                date: true,
                greaterThan: "#txtFechaAlta"
            }
        },
        // Messages for form validation
        messages: {
            txtNumero: {
                required: 'Introduzca el numero'
            },
            txtNombre: {
                required: 'Introduzca el nombre'
            },
            txtFechaAlta: {
                required: 'Introduzca una fecha de alta',
                date: 'Debe ser una fecha válida'
            },
            txtFechaBaja: {
                date: 'Debe ser una fecha válida'
            }
        },
        // Do not change code below
        errorPlacement: function(error, element) {
            error.insertAfter(element.parent());
        }
    });
    $.validator.methods.date = function(value, element) {
        return this.optional(element) || moment(value, "DD/MM/YYYY").isValid();
    };
    return $('#frmTerminal').valid();
}

function aceptar() {
    var mf = function() {
        if (!datosOK())
            return;
        var fecha1, fecha2;
        if (moment(vm.fechaAlta(), "DD/MM/YYYY").isValid())
            fecha1 = moment(vm.fechaAlta(), "DD/MM/YYYY").format("YYYY-MM-DD");
        if (moment(vm.fechaBaja(), "DD/MM/YYYY").isValid()) {
            fecha2 = moment(vm.fechaBaja(), "DD/MM/YYYY").format("YYYY-MM-DD");
        } else {
            fecha2 = null;
        }
        var data = {
            terminal: {
                "terminalId": vm.terminalId(),
                "numero": vm.numero(),
                "nombre": vm.nombre(),
                "observaciones": vm.observaciones(),
                "fechaAlta": fecha1,
                "fechaBaja": fecha2
            }
        };
        if (adminId == 0) {
            $.ajax({
                type: "POST",
                url: myconfig.apiUrl + "/api/terminales",
                dataType: "json",
                contentType: "application/json",
                data: JSON.stringify(data),
                success: function(data, status) {
                    // hay que mostrarlo en la zona de datos
                    loadData(data);
                    // Nos volvemos al general
                    var url = "TerminalGeneral.html?TerminalId=" + vm.terminalId();
                    window.open(url, '_self');
                },
                error: errorAjax
            });
        } else {
            $.ajax({
                type: "PUT",
                url: myconfig.apiUrl + "/api/terminales/" + adminId,
                dataType: "json",
                contentType: "application/json",
                data: JSON.stringify(data),
                success: function(data, status) {
                    // hay que mostrarlo en la zona de datos
                    loadData(data);
                    // Nos volvemos al general
                    var url = "TerminalGeneral.html?TerminalId=" + vm.terminalId();
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
        var url = "TerminalGeneral.html";
        window.open(url, '_self');
    }
    return mf;
}
