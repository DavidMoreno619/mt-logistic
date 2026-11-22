import { navegar } from "../Core/Router.js";

const API = "http://localhost:3000/api/operadores";
const API_CAMIONES = "http://localhost:3000/api/camiones";
const CLAVE_EDICION = "mtOperadorEditarId";

let operadores = [];
let camiones = [];

function escapar(valor) {
    return String(valor ?? "").replace(/[&<>"']/g, caracter => ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;"
    })[caracter]);
}

async function peticion(url, opciones = {}) {
    let respuesta;

    try {
        respuesta = await fetch(url, {
            ...opciones,
            headers: {
                "Content-Type": "application/json",
                ...(opciones.headers || {})
            }
        });
    } catch {
        throw new Error(
            "No se pudo conectar con el backend. Comprueba que esté iniciado."
        );
    }

    const datos = await respuesta.json().catch(() => ({}));

    if (!respuesta.ok) {
        throw new Error(datos.error || "Ocurrió un error en la solicitud.");
    }

    return datos;
}

function idOperador(operador) {
    return operador.id_operador ?? operador.id;
}

function nombreOperador(operador) {
    return operador.nombre_completo ?? operador.nombre ?? "";
}

function estadoOperador(operador) {
    return operador.estado ?? "Disponible";
}

function mostrarEstado(estado) {
    const clases = {
        "Disponible": "status-available",
        "En ruta": "status-route",
        "Inactivo": "status-maintenance"
    };

    return `<span class="status-badge ${clases[estado] || ""}">
        ${escapar(estado)}
    </span>`;
}

// ==============================
// LISTADO DE OPERADORES
// ==============================

export async function inicializarOperadores() {
    const tabla = document.getElementById("operatorsTableBody");
    const busqueda = document.getElementById("operatorSearch");
    const filtro = document.getElementById("operatorStatusFilter");
    const botonNuevo = document.getElementById("newOperatorButton");

    if (!tabla) return;

    tabla.innerHTML = `
        <tr><td colspan="6">Cargando operadores...</td></tr>
    `;

    try {
        await cargarDatos();
        mostrarOperadores();
    } catch (error) {
        tabla.innerHTML = `
            <tr><td colspan="6">${escapar(error.message)}</td></tr>
        `;
    }

    busqueda?.addEventListener("input", mostrarOperadores);
    filtro?.addEventListener("change", mostrarOperadores);

    botonNuevo?.addEventListener("click", () => {
        sessionStorage.removeItem(CLAVE_EDICION);
        navegar("NuevoOperador");
    });

    tabla.addEventListener("click", async evento => {
        const boton = evento.target.closest("button[data-accion]");
        if (!boton) return;

        const id = boton.dataset.id;

        if (boton.dataset.accion === "ver") {
            await verOperador(id);
        }

        if (boton.dataset.accion === "editar") {
            sessionStorage.setItem(CLAVE_EDICION, id);
            navegar("NuevoOperador");
        }

        if (boton.dataset.accion === "archivar") {
            await archivarOperador(id);
        }
    });
}

async function cargarDatos() {
    const resultados = await Promise.all([
        peticion(API),
        peticion(API_CAMIONES)
    ]);

    operadores = Array.isArray(resultados[0])
        ? resultados[0]
        : resultados[0].operadores ?? [];

    camiones = Array.isArray(resultados[1])
        ? resultados[1]
        : resultados[1].camiones ?? [];
}

function mostrarOperadores() {
    const tabla = document.getElementById("operatorsTableBody");
    const busqueda = document.getElementById("operatorSearch");
    const filtro = document.getElementById("operatorStatusFilter");

    if (!tabla) return;

    const texto = (busqueda?.value ?? "").trim().toLowerCase();
    const estado = filtro?.value ?? "";

    const resultados = operadores.filter(operador => {
        const datos = [
            nombreOperador(operador),
            operador.telefono,
            operador.correo,
            operador.numero_licencia,
            operador.numero_camion
        ].join(" ").toLowerCase();

        return datos.includes(texto) &&
            (!estado || estadoOperador(operador) === estado);
    });

    if (!resultados.length) {
        tabla.innerHTML = `
            <tr><td colspan="6">No se encontraron operadores.</td></tr>
        `;
        return;
    }

    tabla.innerHTML = resultados.map(operador => {
        const id = idOperador(operador);

        return `
            <tr>
                <td><strong>${escapar(nombreOperador(operador))}</strong></td>
                <td>${escapar(operador.telefono)}</td>
                <td>${escapar(operador.numero_licencia)}</td>
                <td>${escapar(operador.numero_camion || "Sin asignar")}</td>
                <td>${mostrarEstado(estadoOperador(operador))}</td>
                <td>
                    <button type="button" class="table-action"
                        data-accion="ver" data-id="${escapar(id)}">Ver</button>

                    <button type="button" class="table-action"
                        data-accion="editar" data-id="${escapar(id)}">Editar</button>

                    <button type="button" class="table-action"
                        data-accion="archivar" data-id="${escapar(id)}">Archivar</button>
                </td>
            </tr>
        `;
    }).join("");
}

async function verOperador(id) {
    try {
        const operador = await peticion(
            `${API}/${encodeURIComponent(id)}`
        );

        alert([
            `Nombre: ${nombreOperador(operador)}`,
            `Teléfono: ${operador.telefono ?? "No registrado"}`,
            `Correo: ${operador.correo ?? "No registrado"}`,
            `Licencia: ${operador.numero_licencia ?? "No registrada"}`,
            `Camión: ${operador.numero_camion ?? "Sin asignar"}`,
            `Estado: ${estadoOperador(operador)}`
        ].join("\n"));
    } catch (error) {
        alert(error.message);
    }
}

async function archivarOperador(id) {
    const operador = operadores.find(
        elemento => String(idOperador(elemento)) === String(id)
    );

    if (!operador) {
        alert("No se encontró el operador.");
        return;
    }

    if (!confirm(
        `¿Deseas archivar a ${nombreOperador(operador)}? El historial se conservará.`
    )) return;

    try {
        await peticion(`${API}/${encodeURIComponent(id)}`, {
            method: "DELETE"
        });

        await cargarDatos();
        mostrarOperadores();
        alert("Operador archivado correctamente.");
    } catch (error) {
        alert(error.message);
    }
}

// ==============================
// REGISTRO Y EDICIÓN
// ==============================

export async function inicializarNuevoOperador() {
    const formulario = document.getElementById("newOperatorForm");
    if (!formulario) return;

    const campo = id => document.getElementById(id);
    const idEdicion = sessionStorage.getItem(CLAVE_EDICION);
    const botonGuardar = formulario.querySelector('button[type="submit"]');
    const titulo = document.querySelector(".operator-form-page .page-header h1");
    const descripcion = document.querySelector(".operator-form-page .page-header p");

    try {
        const resultadoCamiones = await peticion(API_CAMIONES);
        camiones = Array.isArray(resultadoCamiones)
            ? resultadoCamiones
            : resultadoCamiones.camiones ?? [];

        const selector = campo("operatorTruck");
        selector.innerHTML = '<option value="">Sin asignar</option>';

        camiones
            .filter(camion => camion.estado !== "Inactivo")
            .forEach(camion => {
                const opcion = document.createElement("option");
                opcion.value = camion.id_camion;
                opcion.textContent = camion.numero_camion;
                selector.appendChild(opcion);
            });

        if (idEdicion) {
            const operador = await peticion(
                `${API}/${encodeURIComponent(idEdicion)}`
            );

            campo("operatorName").value =
                operador.nombre_completo ?? operador.nombre ?? "";

            campo("operatorPhone").value = operador.telefono ?? "";
            campo("operatorEmail").value = operador.correo ?? "";
            campo("operatorLicense").value = operador.numero_licencia ?? "";
            campo("operatorTruck").value = operador.id_camion ?? "";
            campo("operatorStatus").value = operador.estado ?? "Disponible";

            if (titulo) titulo.textContent = "Editar operador";
            if (descripcion) descripcion.textContent =
                "Actualiza la información del operador";
            if (botonGuardar) botonGuardar.textContent = "Guardar cambios";
        } else {
            if (titulo) titulo.textContent = "Agregar operador";
            if (descripcion) descripcion.textContent =
                "Registra un nuevo operador";
        }
    } catch (error) {
        alert(error.message);
        return;
    }

    formulario.addEventListener("submit", async evento => {
        evento.preventDefault();

        const datos = {
            nombre_completo: campo("operatorName").value.trim(),
            telefono: campo("operatorPhone").value.trim(),
            correo: campo("operatorEmail").value.trim() || null,
            numero_licencia: campo("operatorLicense").value.trim(),
            id_camion: campo("operatorTruck").value || null,
            estado: campo("operatorStatus").value
        };

        if (!datos.nombre_completo ||
            !datos.telefono ||
            !datos.numero_licencia) {
            alert("Completa los campos obligatorios.");
            return;
        }

        if (botonGuardar) botonGuardar.disabled = true;

        try {
            await peticion(
                idEdicion
                    ? `${API}/${encodeURIComponent(idEdicion)}`
                    : API,
                {
                    method: idEdicion ? "PUT" : "POST",
                    body: JSON.stringify(datos)
                }
            );

            sessionStorage.removeItem(CLAVE_EDICION);
            alert(idEdicion
                ? "Operador actualizado correctamente."
                : "Operador registrado correctamente.");

            navegar("Operadores");
        } catch (error) {
            alert(error.message);
        } finally {
            if (botonGuardar) botonGuardar.disabled = false;
        }
    });

    campo("cancelOperator")?.addEventListener("click", () => {
        sessionStorage.removeItem(CLAVE_EDICION);
        navegar("Operadores");
    });
}