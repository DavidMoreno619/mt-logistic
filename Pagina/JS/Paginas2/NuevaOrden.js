import { navegar } from "../Core/Router.js";
import { escaparHTML, normalizarEstado, formatearFecha } from "../Core/Utils.js";
let catalogoCargas = [];

export async function inicializarNuevaOrden() {

    const addLoadButton = document.getElementById("addLoadButton");
    const loadTableBody = document.getElementById("loadTableBody");

    if (!addLoadButton || !loadTableBody) {
        return;
    }

    // Cargar catálogos desde MySQL antes de crear la primera carga
    await cargarCatalogos();

    // Agregar la primera fila de carga
    agregarCarga();

    // Botón para agregar más cargas
    addLoadButton.addEventListener("click", function () {
        agregarCarga();
    });

    // Botón para regresar a órdenes
    const backButton = document.getElementById("backToOrders");

    if (backButton) {
        backButton.addEventListener("click", function () {
            navegar("Ordenes");
        });
    }

    // Botón para cancelar
    const cancelButton = document.querySelector(".cancel-button");

    if (cancelButton) {
        cancelButton.addEventListener("click", function () {
            const confirmar = confirm(
                "¿Deseas cancelar la creación de esta orden?"
            );

            if (confirmar) {
                navegar("Ordenes");
            }
        });
    }

    // Envío del formulario
    const form = document.getElementById("newOrderForm");

    if (form) {
        form.addEventListener("submit", function (event) {
            event.preventDefault();
            guardarOrden();
        });
    }
}


// =====================================================
// CARGAR CATÁLOGOS DESDE MYSQL
// =====================================================

async function cargarCatalogos() {

    try {

        const respuesta = await fetch(
            "http://127.0.0.1:5000/api/catalogos"
        );

        if (!respuesta.ok) {
            throw new Error("No se pudieron cargar los catálogos");
        }

        const datos = await respuesta.json();

        // CLIENTES
        llenarSelect(
            "cliente",
            datos.clientes,
            "ID_CLIENTE",
            "NOMBRE"
        );

        // CAMIONES
        llenarSelect(
            "camion",
            datos.camiones,
            "ID_CAMION",
            "NUMERO_CAMION"
        );

        // OPERADORES
        llenarSelect(
            "operador",
            datos.operadores,
            "ID_OPERADOR",
            "NOMBRE"
        );

        // SERVICIOS
        llenarSelect(
            "servicio",
            datos.servicios,
            "ID_TIPO_SERVICIO",
            "NOMBRE_SERVICIO"
        );

        // TIPOS DE CARGA
        catalogoCargas = datos.cargas || [];

        console.log("Catálogos cargados:", datos);

    } catch (error) {

        console.error("Error al cargar catálogos:", error);

        alert("No fue posible cargar los datos desde MySQL.");

    }
}


// =====================================================
// LLENAR LOS SELECT CON LOS DATOS RECIBIDOS
// =====================================================

function llenarSelect(id, datos, campoId, campoNombre) {

    const select = document.getElementById(id);

    if (!select) {
        console.warn(`No se encontró el select: ${id}`);
        return;
    }

    select.innerHTML = '<option value="">Selecciona una opción</option>';

    datos.forEach(function (elemento) {

        const option = document.createElement("option");

        option.value = elemento[campoId];
        option.textContent = elemento[campoNombre];

        select.appendChild(option);

    });

}



// =====================================================
// GUARDAR ORDEN
// =====================================================

function guardarOrden() {

    const cliente =
        document.getElementById("cliente").value;


    const contacto =
        document.getElementById("contacto").value.trim();


    const origen =
        document.getElementById("origen").value.trim();


    const destino =
        document.getElementById("destino").value.trim();


    const fechaSalida =
        document.getElementById("fechaSalida").value;


    const horaSalida =
        document.getElementById("horaSalida").value;


    const fechaLlegada =
        document.getElementById("fechaLlegada").value;


    const horaLlegada =
        document.getElementById("horaLlegada").value;


    const citaLlegada =
        document.getElementById("citaLlegada").checked;

    const camion =
        document.getElementById("camion").value;


    const operador =
        document.getElementById("operador").value;


    const observaciones =
        document.getElementById("observaciones").value.trim();


    // -------------------------
    // VALIDACIONES
    // -------------------------

    if (!cliente) {

        alert("Selecciona un cliente.");

        return;

    }


    if (!origen) {

        alert("Ingresa el origen.");

        return;

    }


    if (!destino) {

        alert("Ingresa el destino.");

        return;

    }


    if (!fechaSalida || !horaSalida) {

        alert(
            "Ingresa la fecha y hora de salida."
        );

        return;

    }


    if (!fechaLlegada || !horaLlegada) {

        alert(
            "Ingresa la fecha y hora de llegada estimada."
        );

        return;

    }


    if (!camion) {

        alert("Selecciona un camión.");

        return;

    }


    if (!operador) {

        alert("Selecciona un operador.");

        return;

    }


    const salida =
        new Date(
            `${fechaSalida}T${horaSalida}`
        );


    const llegada =
        new Date(
            `${fechaLlegada}T${horaLlegada}`
        );


    if (llegada <= salida) {

        alert(
            "La llegada estimada debe ser posterior a la salida."
        );

        return;

    }


    // -------------------------
    // VALIDAR CARGAS
    // -------------------------

    const rows =
        document.querySelectorAll(
            "#loadTableBody tr"
        );


    if (rows.length === 0) {

        alert(
            "Debes agregar al menos una carga."
        );

        return;

    }


    let cargaValida = true;

    const cargas = [];


    rows.forEach(function (row) {

        const nombre =
            row.querySelector(
                ".load-name"
            ).value.trim();


        const cantidad =
            Number(
                row.querySelector(
                    ".load-quantity"
                ).value
            );


        const unidad =
            row.querySelector(
                ".load-unit"
            ).value;


        const peso =
            Number(
                row.querySelector(
                    ".load-weight"
                ).value
            );


        const precio =
            Number(
                row.querySelector(
                    ".load-price"
                ).value
            );


        if (
            !nombre ||
            cantidad <= 0 ||
            peso <= 0 ||
            precio < 0
        ) {

            cargaValida = false;

        }


        cargas.push({

            nombre: nombre,

            cantidad: cantidad,

            unidad: unidad,

            peso: peso,

            precio: precio,

            subtotal:
                cantidad * precio

        });

    });


    if (!cargaValida) {

        alert(
            "Revisa los datos de las cargas."
        );

        return;

    }


    // -------------------------
    // OBTENER ÓRDENES
    // -------------------------

    const ordenes =
        JSON.parse(
            localStorage.getItem("mtOrdenes")
        ) || [];


    // -------------------------
    // GENERAR NÚMERO
    // -------------------------

    const numero =
        1025 + ordenes.length + 1;


    // -------------------------
    // CREAR ORDEN
    // -------------------------

    const nuevaOrden = {

        numero:
            "#" + numero,

        cliente:
            document.getElementById(
                "cliente"
            ).selectedOptions[0].text,

        contacto:
            contacto,

        origen:
            origen,

        destino:
            destino,

        fechaSalida:
            fechaSalida,

        horaSalida:
            horaSalida,

        fechaLlegada:
            fechaLlegada,

        horaLlegada:
            horaLlegada,

        citaLlegada:
            citaLlegada,

        camion:
            camion,

        operador:
            document.getElementById(
                "operador"
            ).selectedOptions[0].text,

        cargas:
            cargas,

        observaciones:
            observaciones,

        estado:
            "Pendiente"

    };


    ordenes.push(
        nuevaOrden
    );


    localStorage.setItem(
        "mtOrdenes",
        JSON.stringify(ordenes)
    );


    alert(
        "Orden creada correctamente."
    );


    navegar("Ordenes");

}


// =====================================================
// AGREGAR CARGA
// =====================================================


function agregarCarga() {

    const loadTableBody = document.getElementById("loadTableBody");

    if (!loadTableBody) {
        return;
    }

    const row = document.createElement("tr");

    row.innerHTML = `
        <td>
            <select class="load-name">
                <option value="">Selecciona una carga</option>
            </select>
        </td>

        <td>
            <input
                type="number"
                class="load-quantity"
                min="1"
                value="1"
            >
        </td>

        <td>
            <select class="load-unit">
                <option value="pieza">Pieza</option>
                <option value="kg">Kg</option>
                <option value="ton">Tonelada</option>
                <option value="litro">Litro</option>
                <option value="otro">Otro</option>
            </select>
        </td>

        <td>
            <input
                type="number"
                class="load-weight"
                min="0"
                value="0"
            >
        </td>

        <td>
            <input
                type="number"
                class="load-price"
                min="0"
                step="0.01"
                value="0"
            >
        </td>

        <td>
            <span class="load-subtotal">$0.00</span>
        </td>

        <td>
            <button
                type="button"
                class="remove-load"
            >
                ×
            </button>
        </td>
    `;

    // Llenar el selector con los tipos de carga de MySQL
    const selectCarga = row.querySelector(".load-name");

    catalogoCargas.forEach(function (carga) {

        const option = document.createElement("option");

        option.value = carga.ID_TIPO_CARGA;
        option.textContent = carga.NOMBRE_CARGA;

        selectCarga.appendChild(option);

    });

    loadTableBody.appendChild(row);

    configurarCarga(row);
}



// =====================================================
// CONFIGURAR CARGA
// =====================================================

function configurarCarga(row) {

    const quantity =
        row.querySelector(
            ".load-quantity"
        );


    const weight =
        row.querySelector(
            ".load-weight"
        );


    const price =
        row.querySelector(
            ".load-price"
        );


    const subtotal =
        row.querySelector(
            ".load-subtotal"
        );


    const removeButton =
        row.querySelector(
            ".remove-load"
        );


    function actualizarSubtotal() {

        const cantidad =
            Number(
                quantity.value
            ) || 0;


        const precio =
            Number(
                price.value
            ) || 0;


        const resultado =
            cantidad * precio;


        subtotal.textContent =
            `$${resultado.toFixed(2)}`;


        actualizarTotales();

    }


    quantity.addEventListener(
        "input",
        actualizarSubtotal
    );


    price.addEventListener(
        "input",
        actualizarSubtotal
    );


    weight.addEventListener(
        "input",
        actualizarTotales
    );


    removeButton.addEventListener(
        "click",
        function () {

            row.remove();

            actualizarTotales();

        }
    );


    actualizarSubtotal();

}


// =====================================================
// ACTUALIZAR TOTALES
// =====================================================

function actualizarTotales() {

    const rows =
        document.querySelectorAll(
            "#loadTableBody tr"
        );


    let totalWeight = 0;

    let totalPrice = 0;


    rows.forEach(function (row) {

        const weight =
            Number(
                row.querySelector(
                    ".load-weight"
                ).value
            ) || 0;


        const quantity =
            Number(
                row.querySelector(
                    ".load-quantity"
                ).value
            ) || 0;


        const price =
            Number(
                row.querySelector(
                    ".load-price"
                ).value
            ) || 0;


        totalWeight += weight;


        totalPrice +=
            quantity * price;

    });


    const totalWeightElement =
        document.getElementById(
            "totalWeight"
        );


    const orderTotalElement =
        document.getElementById(
            "orderTotal"
        );


    if (totalWeightElement) {

        totalWeightElement.textContent =
            `${totalWeight} kg`;

    }


    if (orderTotalElement) {

        orderTotalElement.textContent =
            `$${totalPrice.toFixed(2)}`;

    }

}


// =====================================================
