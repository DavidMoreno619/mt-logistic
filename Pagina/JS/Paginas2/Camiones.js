import { navegar } from "../Core/Router.js";
import { escaparHTML } from "../Core/Utils.js";

const API_BASE = "http://localhost:3000/api/camiones";
const CLAVE_EDICION = "mtCamionEditarId";

let camiones = [];

const esc = (valor) => escaparHTML(String(valor ?? ""));

function normalizarTexto(valor) {
    return String(valor ?? "").trim().toLowerCase();
}

async function solicitarAPI(url, opciones = {}) {
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
            "No se pudo conectar con el servidor. Verifica que el backend esté iniciado."
        );
    }

    const datos = await respuesta.json().catch(() => ({}));

    if (!respuesta.ok) {
        throw new Error(
            datos.error || datos.mensaje || `Error del servidor: ${respuesta.status}`
        );
    }

    return datos;
}

function mostrarMensaje(mensaje) {
    alert(mensaje);
}

function obtenerId(camion) {
    return camion.id_camion ?? camion.id;
}

function obtenerUnidad(camion) {
    return camion.numero_camion ?? camion.numeroCamion ?? "";
}

function obtenerPlacas(camion) {
    return camion.placas ?? "";
}

function obtenerEstado(camion) {
    return camion.estado ?? "Disponible";
}

function obtenerCapacidad(camion) {
    const capacidad = camion.capacidad ?? "";
    const unidad = camion.unidad_capacidad ?? camion.unidadCapacidad ?? "";
    return `${capacidad} ${unidad}`.trim();
}

function obtenerOperador(camion) {
    return camion.nombre_operador ?? camion.operador ?? "Sin asignar";
}

export async function inicializarCamiones() {
    const tabla = document.getElementById("trucksTableBody");
    const busqueda = document.getElementById("truckSearch");
    const filtro = document.getElementById("truckStatusFilter");
    const botonNuevo = document.getElementById("newTruckButton");

    if (!tabla) return;

    tabla.innerHTML = `
        <tr>
            <td colspan="7">Cargando camiones...</td>
        </tr>
    `;

    try {
        await cargarCamiones();
        mostrarCamiones();
    } catch (error) {
        tabla.innerHTML = `
            <tr>
                <td colspan="7">${esc(error.message)}</td>
            </tr>
        `;
    }

    busqueda?.addEventListener("input", mostrarCamiones);
    filtro?.addEventListener("change", mostrarCamiones);

    botonNuevo?.addEventListener("click", () => {
        sessionStorage.removeItem(CLAVE_EDICION);
        navegar("NuevoCamion");
    });

    // Delegación de eventos para los botones de cada fila.
    tabla.addEventListener("click", async (evento) => {
        const boton = evento.target.closest("button[data-accion]");
        if (!boton) return;

        const id = boton.dataset.id;
        const accion = boton.dataset.accion;

        if (accion === "ver") {
            await verCamion(id);
        } else if (accion === "editar") {
            sessionStorage.setItem(CLAVE_EDICION, id);
            navegar("NuevoCamion");
        } else if (accion === "archivar") {
            await archivarCamion(id);
        }
    });
}

async function cargarCamiones() {
    const datos = await solicitarAPI(API_BASE);
    camiones = Array.isArray(datos) ? datos : datos.camiones ?? [];
}

function mostrarCamiones() {
    const tabla = document.getElementById("trucksTableBody");
    const busqueda = document.getElementById("truckSearch");
    const filtro = document.getElementById("truckStatusFilter");

    if (!tabla) return;

    const texto = normalizarTexto(busqueda?.value);
    const estado = filtro?.value ?? "";

    const resultados = camiones.filter((camion) => {
        const coincideTexto = [
            obtenerUnidad(camion),
            obtenerPlacas(camion),
            camion.marca,
            camion.modelo,
            obtenerOperador(camion)
        ].some((valor) => normalizarTexto(valor).includes(texto));

        const coincideEstado =
            !estado || normalizarTexto(obtenerEstado(camion)) === normalizarTexto(estado);

        return coincideTexto && coincideEstado;
    });

    if (resultados.length === 0) {
        tabla.innerHTML = `
            <tr>
                <td colspan="7">No se encontraron camiones.</td>
            </tr>
        `;
        return;
    }

    tabla.innerHTML = resultados.map((camion) => {
        const id = obtenerId(camion);

        return `
            <tr>
                <td>${esc(obtenerUnidad(camion))}</td>
                <td>${esc(obtenerPlacas(camion))}</td>
                <td>${esc(camion.marca)} ${esc(camion.modelo)}</td>
                <td>${esc(obtenerCapacidad(camion))}</td>
                <td>${esc(obtenerOperador(camion))}</td>
                <td>${esc(obtenerEstado(camion))}</td>
                <td>
                    <button type="button" data-accion="ver" data-id="${esc(id)}">
                        Ver
                    </button>
                    <button type="button" data-accion="editar" data-id="${esc(id)}">
                        Editar
                    </button>
                    <button type="button" data-accion="archivar" data-id="${esc(id)}">
                        Archivar
                    </button>
                </td>
            </tr>
        `;
    }).join("");
}

async function verCamion(id) {
    try {
        const camion = await solicitarAPI(`${API_BASE}/${encodeURIComponent(id)}`);

        const contenido = [
            `Unidad: ${obtenerUnidad(camion)}`,
            `Placas: ${obtenerPlacas(camion)}`,
            `Marca: ${camion.marca ?? ""}`,
            `Modelo: ${camion.modelo ?? ""}`,
            `Año: ${camion.anio_unidad ?? ""}`,
            `Capacidad: ${obtenerCapacidad(camion)}`,
            `Estado: ${obtenerEstado(camion)}`,
            `ID de Wialon: ${camion.wialon_id ?? "Sin configurar"}`
        ];

        alert(contenido.join("\n"));
    } catch (error) {
        mostrarMensaje(error.message);
    }
}

async function archivarCamion(id) {
    const camion = camiones.find(
        (elemento) => String(obtenerId(elemento)) === String(id)
    );

    if (!camion) {
        mostrarMensaje("No se encontró el camión seleccionado.");
        return;
    }

    const confirmar = confirm(
        `¿Deseas archivar la unidad ${obtenerUnidad(camion)}? No se borrará físicamente de la base de datos.`
    );

    if (!confirmar) return;

    try {
        await solicitarAPI(`${API_BASE}/${encodeURIComponent(id)}`, {
            method: "DELETE"
        });

        await cargarCamiones();
        mostrarCamiones();
        mostrarMensaje("La unidad se archivó correctamente.");
    } catch (error) {
        mostrarMensaje(error.message);
    }
}

export async function inicializarNuevoCamion() {
    const formulario = document.getElementById("newTruckForm");
    if (!formulario) return;

    const campo = (id) => document.getElementById(id);
    const idEdicion = sessionStorage.getItem(CLAVE_EDICION);

    const botonGuardar = campo("saveTruckButton");
    const botonCancelar = campo("cancelTruck");

    if (idEdicion) {
        campo("truckFormTitle").textContent = "Editar camión";
        campo("truckFormDescription").textContent =
            "Actualiza la información de la unidad";

        try {
            const camion = await solicitarAPI(
                `${API_BASE}/${encodeURIComponent(idEdicion)}`
            );

            campo("truckUnit").value = camion.numero_camion ?? "";
            campo("truckPlates").value = camion.placas ?? "";
            campo("truckBrand").value = camion.marca ?? "";
            campo("truckModel").value = camion.modelo ?? "";
            campo("truckYear").value = camion.anio_unidad ?? "";
            campo("truckCapacity").value = camion.capacidad ?? "";
            campo("truckCapacityUnit").value = camion.unidad_capacidad ?? "toneladas";
            campo("truckStatus").value = camion.estado ?? "Disponible";
            campo("truckWialonId").value = camion.wialon_id ?? "";
        } catch (error) {
            mostrarMensaje(error.message);
            return;
        }
    } else {
        campo("truckFormTitle").textContent = "Agregar camión";
        campo("truckFormDescription").textContent =
            "Registra una nueva unidad en MT";
    }

    formulario.addEventListener("submit", async (evento) => {
        evento.preventDefault();

        if (botonGuardar) botonGuardar.disabled = true;

        const datos = {
            numero_camion: campo("truckUnit").value.trim(),
            placas: campo("truckPlates").value.trim(),
            marca: campo("truckBrand").value.trim(),
            modelo: campo("truckModel").value.trim(),
            anio_unidad: campo("truckYear").value || null,
            capacidad: campo("truckCapacity").value,
            unidad_capacidad: campo("truckCapacityUnit").value,
            estado: campo("truckStatus").value,
            wialon_id: campo("truckWialonId").value.trim() || null
        };

        try {
            await solicitarAPI(
                idEdicion
                    ? `${API_BASE}/${encodeURIComponent(idEdicion)}`
                    : API_BASE,
                {
                    method: idEdicion ? "PUT" : "POST",
                    body: JSON.stringify(datos)
                }
            );

            sessionStorage.removeItem(CLAVE_EDICION);
            mostrarMensaje(
                idEdicion
                    ? "Camión actualizado correctamente."
                    : "Camión registrado correctamente."
            );

            navegar("Camiones");
        } catch (error) {
            mostrarMensaje(error.message);
        } finally {
            if (botonGuardar) botonGuardar.disabled = false;
        }
    });

    botonCancelar?.addEventListener("click", (evento) => {
        evento.preventDefault();
        sessionStorage.removeItem(CLAVE_EDICION);
        navegar("Camiones");
    });
}