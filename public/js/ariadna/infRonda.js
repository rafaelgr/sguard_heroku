// de blank_ (pruebas)
var chart = null;

function initForm() {
    comprobarLogin();
    // de smart admin
    pageSetUp();
    getVersionFooter();
    $("#frmInforme").submit(function() {
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

    $.validator.addMethod("time24", function(value, element) {
        if (value == "") return true;
        return /^([01]?[0-9]|2[0-3])(:[0-5][0-9]){2}$/.test(value);
    }, "Hora errónea.");


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

    vm = new admData();
    ko.applyBindings(vm);
    // asignación de eventos al clic
    $("#btnAceptar").click(aceptar());

}


function admData() {
    var self = this;
    self.fechaInicio = ko.observable();
    self.fechaFinal = ko.observable();
    self.dHora = ko.observable();
    self.hHora = ko.observable();
}


function datosOK() {
    $('#frmInforme').validate({
        rules: {
            txtFechaInicio: {
                required: true,
                date: true
            },
            txtFechaFinal: {
                required: true,
                date: true,
                greaterThan: "#txtFechaInicio"
            },
            txtHoraInicio: {
                time24: "#txtHoraInicio"
            },
            txtHoraFinal: {
                time24: "#txtHoraFinal"
            }
        },
        // Messages for form validation
        messages: {
            txtFechaInicio: {
                required: 'Introduzca una fecha inical',
                date: 'Debe ser una fecha válida'
            },
            txtFechaFinal: {
                required: 'Introduzca una fecha final',
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
    }
    return $('#frmInforme').valid();
}

function aceptar() {
    var mf = function() {
        if (!datosOK())
            return;
        // control de fechas 
        var fecha1, fecha2;
        if (moment(vm.fechaInicio(), "DD/MM/YYYY").isValid())
            fecha1 = moment(vm.fechaInicio(), "DD/MM/YYYY").format("YYYY-MM-DD");
        if (moment(vm.fechaFinal(), "DD/MM/YYYY").isValid())
            fecha2 = moment(vm.fechaFinal(), "DD/MM/YYYY").format("YYYY-MM-DD");
        var dHora = "*";
        var hHora = "*";
        if (vm.dHora()) {
            dHora = vm.dHora();
        }
        if (vm.hHora()) {
            hHora = vm.hHora();
        }
        $.ajax({
            type: "GET",
            url: myconfig.apiUrl + "/api/informes/rondas/?dfecha=" + fecha1 + "&hfecha=" + fecha2 + "&dhora=" + dHora + "&hhora=" + hHora,
            dataType: "json",
            contentType: "application/json",
            success: function(data, status) {
                // hay que mostrarlo en la zona de datos
                // vm.asignaciones(data);
                if (data.rondas.length == 0) {
                    mostrarMensajeSmart("No hay rondas con estos criterios");
                } else {
                    informePDF(data);
                }

            },
            error: errorAjax
        });
    }
    return mf;
}

function informePDF(data) {
    var data = {
        "template": {
            "shortid": "E1XCz-ybg"
        },
        "data": data
    }
    f_open_post("POST", myconfig.reportUrl + "/api/report", data);
}

var f_open_post = function(verb, url, data, target) {
    var form = document.createElement("form");
    form.action = url;
    form.method = verb;
    form.target = target || "_blank";
    //if (data) {
    //    for (var key in data) {
    //        var input = document.createElement("textarea");
    //        input.name = key;
    //        input.value = typeof data[key] === "object" ? JSON.stringify(data[key]) : data[key];
    //        form.appendChild(input);
    //    }
    //}
    var input = document.createElement("textarea");
    input.name = "template[shortid]";
    input.value = data.template.shortid;
    form.appendChild(input);

    input = document.createElement("textarea");
    input.name = "data";
    input.value = JSON.stringify(data.data);
    form.appendChild(input);

    form.style.display = 'none';
    document.body.appendChild(form);
    form.submit();
};

function salir() {
    var mf = function() {
        var url = "InfRonda.html";
        window.open(url, '_self');
    }
    return mf;
}
