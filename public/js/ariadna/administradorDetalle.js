/*-------------------------------------------------------------------------- 
administradorDetalle.js
Funciones js par la página AdministradorDetalle.html
---------------------------------------------------------------------------*/
var adminId = 0;

var posiblesNiveles = [{
    id: 0,
    nombre: "Administrador"
}, {
    id: 1,
    nombre: "Jefe de Equipo"
}, {
    id: 2,
    nombre: "Vigilante"
}];

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
    $("#frmAdministrador").submit(function() {
        return false;
    });

    adminId = gup('AdministradorId');
    if (adminId != 0) {
        var data = {
                administradorId: adminId
            }
            // hay que buscar ese elemento en concreto
        $.ajax({
            type: "GET",
            url: myconfig.apiUrl + "/api/administradores/" + adminId,
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
        vm.administradorId(0);
    }
}

function admData() {
    var self = this;
    self.administradorId = ko.observable();
    self.nombre = ko.observable();
    self.login = ko.observable();
    self.password = ko.observable();
    self.email = ko.observable();
    self.posiblesNiveles = ko.observable(posiblesNiveles);
    self.nivel = ko.observable();
}

function loadData(data) {
    vm.administradorId(data.administradorId);
    vm.nombre(data.nombre);
    vm.login(data.login);
    vm.password(data.password);
    vm.email(data.email);
    for (var i = 0; i < posiblesNiveles.length; i++) {
        if (posiblesNiveles[i].id == data.nivel) {
            vm.nivel(posiblesNiveles[i]);
        }
    }
}

function datosOK() {
    // antes de la validación de form hay que verificar las password
    if ($('#txtPassword1').val() !== "") {
        // si ha puesto algo, debe coincidir con el otro campo
        if ($('#txtPassword1').val() !== $('#txtPassword2').val()) {
            mostrarMensajeSmart('Las contraseñas no coinciden');
            return false;
        }
        vm.password($("#txtPassword1").val());
    }
    // controlamos que si es un alta debe dar una contraseña.
    if (vm.administradorId() === 0 && $('#txtPassword1').val() === "") {
        mostrarMensajeSmart('Debe introducir una contraseña en el alta');
        return false;
    }
    $('#frmAdministrador').validate({
        rules: {
            cmbNivel: {
                required: true
            },
            txtNombre: {
                required: true
            },
            txtLogin: {
                required: true
            },
            txtEmail: {
                required: true,
                email: true
            }
        },
        // Messages for form validation
        messages: {
            cmbNivel: {
                required: "Debe seleccionar un nivel"
            },
            txtNombre: {
                required: 'Introduzca el nombre'
            },
            txtLogin: {
                required: 'Introduzca el login'
            },
            txtEmail: {
                required: 'Introduzca el correo',
                email: 'Debe usar un correo válido'
            }
        },
        // Do not change code below
        errorPlacement: function(error, element) {
            error.insertAfter(element.parent());
        }
    });
    var opciones = $("#frmAdministrador").validate().settings;
    if (vm.nivel()) {
        opciones.rules.cmbNivel.required = false;
    } else {
        opciones.rules.cmbNivel.required = true;
    }
    return $('#frmAdministrador').valid();
}

function aceptar() {
    var mf = function() {
        if (!datosOK())
            return;
        var data = {
            administrador: {
                "administradorId": vm.administradorId(),
                "login": vm.login(),
                "email": vm.email(),
                "nombre": vm.nombre(),
                "password": vm.password(),
                "nivel": vm.nivel().id
            }
        };
        if (adminId == 0) {
            $.ajax({
                type: "POST",
                url: myconfig.apiUrl + "/api/administradores",
                dataType: "json",
                contentType: "application/json",
                data: JSON.stringify(data),
                success: function(data, status) {
                    // hay que mostrarlo en la zona de datos
                    loadData(data);
                    // Nos volvemos al general
                    var url = "AdministradorGeneral.html?AdministradorId=" + vm.administradorId();
                    window.open(url, '_self');
                },
                error: errorAjax
            });
        } else {
            $.ajax({
                type: "PUT",
                url: myconfig.apiUrl + "/api/administradores/" + adminId,
                dataType: "json",
                contentType: "application/json",
                data: JSON.stringify(data),
                success: function(data, status) {
                    // hay que mostrarlo en la zona de datos
                    loadData(data);
                    // Nos volvemos al general
                    var url = "AdministradorGeneral.html?AdministradorId=" + vm.administradorId();
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
        var url = "AdministradorGeneral.html";
        window.open(url, '_self');
    }
    return mf;
}
