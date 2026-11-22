import { navegar } from "../Core/Router.js";

let catalogos = {
    camiones: [],
    operadores: [],
    remolques: []
};

export async function inicializarNuevaOrden() {
    const form = document.getElementById("newOrderForm");
    const tbody = document.getElementById("loadTableBody");
    const addButton = document.getElementById("addLoadButton");

    if (!form || !tbody || !addButton) return;

    await cargarCatalogos();

    agregarCarga();
    addButton.addEventListener("click", agregarCarga);

    document.getElementById("fechaSalida").addEventListener("change", actualizarDisponibilidad);
    document.getElementById("fechaLlegada").addEventListener("change", actualizarDisponibilidad);

    ["camion", "operador", "remolque"].forEach(id => {
        document.getElementById(id).addEventListener("change", actualizarDisponibilidad);
    });

    document.getElementById("costoFlete").addEventListener("input", actualizarTotales);

    document.getElementById("backToOrders")?.addEventListener("click", () => navegar("Ordenes"));

    document.querySelector(".cancel-button")?.addEventListener("click", () => {
        if (confirm("¿Deseas cancelar la creación de esta orden?")) navegar("Ordenes");
    });

    form.addEventListener("submit", event => {
        event.preventDefault();
        guardarOrden();
    });

    actualizarDisponibilidad();
    actualizarTotales();
}

// Carga los catálogos que vienen desde el servidor Flask/MySQL.
async function cargarCatalogos() {
    try {
        const respuesta = await fetch("http://127.0.0.1:5000/api/catalogos");
        if (!respuesta.ok) throw new Error("No se pudieron cargar los catálogos.");

        const datos = await respuesta.json();

        llenarSelect("cliente", datos.clientes || [], "ID_CLIENTE", "NOMBRE");

        catalogos.camiones = datos.camiones || [];
        catalogos.operadores = datos.operadores || [];
        catalogos.remolques = datos.remolques || [];

        llenarSelect("camion", catalogos.camiones, "ID_CAMION", "NUMERO_CAMION");
        llenarSelect("operador", catalogos.operadores, "ID_OPERADOR", "NOMBRE");
        llenarSelect("remolque", catalogos.remolques, "ID_REMOLQUE", "NUMERO_REMOLQUE");

    } catch (error) {
        console.error("Error al cargar catálogos:", error);
        alert("No fue posible cargar los datos desde MySQL. Verifica que Flask esté ejecutándose.");
    }
}

function llenarSelect(id, datos, campoId, campoNombre) {
    const select = document.getElementById(id);
    if (!select) return;

    select.innerHTML = '<option value="">Selecciona una opción</option>';

    datos.forEach(item => {
        const option = document.createElement("option");
        option.value = item[campoId];
        option.textContent = item[campoNombre];
        select.appendChild(option);
    });
}

// Convierte el estado de un recurso en un valor comparable.
function estadoDisponible(recurso, tipo) {
    const estado = String(recurso || "").trim().toLowerCase();
    if (tipo === "operador") {
        return ["activo", "disponible", "libre"].includes(estado);
    }
    return ["disponible", "activo", "libre"].includes(estado);
}

// Dos periodos se cruzan cuando inicioA <= finB y finA >= inicioB.
function existeCruce(inicioA, finA, inicioB, finB) {
    return inicioA <= finB && finA >= inicioB;
}

function obtenerOrdenesGuardadas() {
    try {
        return JSON.parse(localStorage.getItem("mtOrdenes") || "[]");
    } catch {
        return [];
    }
}

function recursoOcupado(recurso, tipo, fechaInicio, fechaFin) {
    if (!fechaInicio || !fechaFin) return false;

    const idCampo = {
        camion: "camionId",
        operador: "operadorId",
        remolque: "remolqueId"
    }[tipo];

    const nombreCampo = tipo;
    const idRecurso = String(recurso.id);
    const nombreRecurso = String(recurso.nombre);

    return obtenerOrdenesGuardadas().some(orden => {
        const estado = String(orden.estado || "").trim().toLowerCase();
        if (["cancelada", "cancelado", "finalizada", "finalizado"].includes(estado)) return false;

        const mismoRecurso = orden[idCampo] != null
            ? String(orden[idCampo]) === idRecurso
            : String(orden[nombreCampo] || "") === nombreRecurso;

        if (!mismoRecurso) return false;

        const inicioOrden = orden.fechaSalida;
        const finOrden = orden.fechaLlegada || orden.fechaSalida;
        if (!inicioOrden || !finOrden) return false;

        return existeCruce(fechaInicio, fechaFin, inicioOrden, finOrden);
    });
}

// Reconstruye los selectores para deshabilitar recursos fuera de servicio u ocupados.
function actualizarDisponibilidad() {
    const fechaInicio = document.getElementById("fechaSalida")?.value;
    const fechaFin = document.getElementById("fechaLlegada")?.value;

    const configuraciones = [
        {
            tipo: "camion",
            datos: catalogos.camiones,
            idCampo: "ID_CAMION",
            nombreCampo: "NUMERO_CAMION",
            estadoCampo: "ESTADO"
        },
        {
            tipo: "operador",
            datos: catalogos.operadores,
            idCampo: "ID_OPERADOR",
            nombreCampo: "NOMBRE",
            estadoCampo: "ESTATUS_OPERADOR"
        },
        {
            tipo: "remolque",
            datos: catalogos.remolques,
            idCampo: "ID_REMOLQUE",
            nombreCampo: "NUMERO_REMOLQUE",
            estadoCampo: "ESTADO"
        }
    ];

    configuraciones.forEach(config => {
        const select = document.getElementById(config.tipo);
        if (!select) return;

        const seleccionadoAntes = select.value;
        select.innerHTML = '<option value="">Selecciona una opción</option>';

        config.datos.forEach(item => {
            const id = String(item[config.idCampo]);
            const nombre = String(item[config.nombreCampo]);
            const disponiblePorEstado = estadoDisponible(item[config.estadoCampo], config.tipo);
            const ocupado = recursoOcupado(
                { id, nombre },
                config.tipo,
                fechaInicio,
                fechaFin
            );

            const option = document.createElement("option");
            option.value = id;
            option.textContent = nombre;

            if (!disponiblePorEstado) {
                option.disabled = true;
                option.textContent += " - Fuera de servicio";
            } else if (ocupado) {
                option.disabled = true;
                option.textContent += " - Ocupado en esas fechas";
            }

            select.appendChild(option);
        });

        const opcionAnterior = Array.from(select.options).find(
            option => option.value === seleccionadoAntes && !option.disabled
        );
        select.value = opcionAnterior ? seleccionadoAntes : "";
    });
}

function agregarCarga() {
    const tbody = document.getElementById("loadTableBody");
    if (!tbody) return;

    const fila = document.createElement("tr");
    fila.innerHTML = `
        <td>
            <input type="text" class="load-name" placeholder="Escribe el tipo de carga" required>
        </td>
        <td>
            <input type="number" class="load-quantity" min="1" step="1" value="1" required>
        </td>
        <td>
            <input type="text" class="load-weight" placeholder="Ej. 1,200 kg" required>
        </td>
        <td>
            <button type="button" class="remove-load" title="Eliminar carga">×</button>
        </td>
    `;

    fila.querySelector(".remove-load").addEventListener("click", () => fila.remove());
    tbody.appendChild(fila);
}

function actualizarTotales() {
    const costo = Number(document.getElementById("costoFlete")?.value || 0);
    const total = document.getElementById("orderTotal");
    if (total) {
        total.textContent = costo.toLocaleString("es-MX", {
            style: "currency",
            currency: "MXN",
            minimumFractionDigits: 2
        });
    }
}

function guardarOrden() {
    const form = document.getElementById("newOrderForm");
    if (!form.reportValidity()) return;

    const remitente = document.getElementById("cliente");
    const destinatario = document.getElementById("destinatario").value.trim();
    const contacto = document.getElementById("contacto").value.trim();
    const origen = document.getElementById("origen").value.trim();
    const destino = document.getElementById("destino").value.trim();

    const fechaSalida = document.getElementById("fechaSalida").value;
    const horaSalida = document.getElementById("horaSalida").value;
    const fechaLlegada = document.getElementById("fechaLlegada").value;
    const horaLlegada = document.getElementById("horaLlegada").value;
    const citaLlegada = document.getElementById("citaLlegada").checked;

    const camion = document.getElementById("camion");
    const operador = document.getElementById("operador");
    const remolque = document.getElementById("remolque");
    const costoFlete = Number(document.getElementById("costoFlete").value);
    const observaciones = document.getElementById("observaciones").value.trim();

    const salida = new Date(`${fechaSalida}T${horaSalida}`);
    const llegada = new Date(`${fechaLlegada}T${horaLlegada}`);
    if (Number.isNaN(salida.getTime()) || Number.isNaN(llegada.getTime()) || llegada <= salida) {
        alert("La fecha y hora de llegada deben ser posteriores a la salida.");
        return;
    }

    if (!Number.isFinite(costoFlete) || costoFlete < 0) {
        alert("Ingresa un costo de flete válido.");
        return;
    }

    // Actualiza la disponibilidad justo antes de guardar.
    actualizarDisponibilidad();
    if (!camion.value || !operador.value || !remolque.value) {
        alert("Selecciona un camión, operador y remolque que estén disponibles.");
        return;
    }
    if (
        camion.selectedOptions[0]?.disabled ||
        operador.selectedOptions[0]?.disabled ||
        remolque.selectedOptions[0]?.disabled
    ) {
        alert("Uno de los recursos seleccionados ya no está disponible. Selecciona otro.");
        return;
    }

    const filas = Array.from(document.querySelectorAll("#loadTableBody tr"));
    if (filas.length === 0) {
        alert("Agrega al menos un tipo de carga.");
        return;
    }

    const cargas = [];
    for (const fila of filas) {
        const nombre = fila.querySelector(".load-name").value.trim();
        const cantidad = Number(fila.querySelector(".load-quantity").value);
        const pesoUnitario = fila.querySelector(".load-weight").value.trim();

        if (!nombre || !Number.isInteger(cantidad) || cantidad <= 0 || !pesoUnitario) {
            alert("Revisa el tipo de carga, la cantidad y el peso unitario de cada renglón.");
            return;
        }

        cargas.push({ nombre, cantidad, pesoUnitario });
    }

    const ordenes = obtenerOrdenesGuardadas();
    const ultimoNumero = ordenes.reduce((mayor, orden) => {
        const numero = Number(String(orden.numero || "").replace("#", "")) || 0;
        return Math.max(mayor, numero);
    }, 1025);

    const nuevaOrden = {
        numero: `#${ultimoNumero + 1}`,
        cliente: remitente.selectedOptions[0].textContent,
        clienteId: remitente.value,
        destinatario,
        contacto,
        origen,
        destino,
        fechaSalida,
        horaSalida,
        fechaLlegada,
        horaLlegada,
        citaLlegada,
        camion: camion.selectedOptions[0].textContent,
        camionId: camion.value,
        operador: operador.selectedOptions[0].textContent,
        operadorId: operador.value,
        remolque: remolque.selectedOptions[0].textContent,
        remolqueId: remolque.value,
        cargas,
        costoFlete,
        observaciones,
        estado: "Pendiente"
    };

    ordenes.push(nuevaOrden);
    localStorage.setItem("mtOrdenes", JSON.stringify(ordenes));

    alert("Orden creada correctamente.");
    navegar("Ordenes");
}