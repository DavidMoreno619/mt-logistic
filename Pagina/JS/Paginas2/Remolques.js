
import { navegar } from "../Core/Router.js";
import { escaparHTML } from "../Core/Utils.js";

const API_BASE = "http://127.0.0.1:5000/api/remolques";

let remolques = [];

const esc = (valor) =>
    escaparHTML(String(valor ?? ""));

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
            "No se pudo conectar con Flask. Verifica que esté iniciado."
        );
    }

    const datos = await respuesta.json().catch(() => ({}));

    if (!respuesta.ok) {
        throw new Error(
            datos.error || datos.mensaje || "Error del servidor"
        );
    }

    return datos;
}

// ========================================
// PANTALLA PRINCIPAL DE REMOLQUES
// ========================================

export async function inicializarRemolques() {

    const tabla = document.getElementById("trailersTableBody");
    const busqueda = document.getElementById("trailerSearch");
    const filtro = document.getElementById("trailerStatusFilter");
    const botonNuevo = document.getElementById("newTrailerButton");

    if (!tabla) return;

    tabla.innerHTML = `
        <tr>
            <td colspan="7">Cargando remolques...</td>
        </tr>
    `;

    try {
        const datos = await solicitarAPI(API_BASE);

        remolques = Array.isArray(datos)
            ? datos
            : datos.remolques ?? [];

        mostrarRemolques();

    } catch (error) {
        tabla.innerHTML = `
            <tr>
                <td colspan="7">${esc(error.message)}</td>
            </tr>
        `;
    }

    busqueda?.addEventListener("input", mostrarRemolques);
    filtro?.addEventListener("change", mostrarRemolques);

    botonNuevo?.addEventListener("click", () => {
        navegar("NuevoRemolque");
    });
}

// ========================================
// MOSTRAR REMOLQUES
// ========================================

function mostrarRemolques() {

    const tabla = document.getElementById("trailersTableBody");
    const texto = document.getElementById("trailerSearch")?.value
        .trim().toLowerCase() ?? "";

    const estado = document.getElementById("trailerStatusFilter")?.value ?? "";

    const resultados = remolques.filter((remolque) => {

        const coincideTexto = [
            remolque.numero_remolque,
            remolque.placas,
            remolque.marca,
            remolque.modelo
        ].some(valor =>
            String(valor ?? "").toLowerCase().includes(texto)
        );

        const coincideEstado =
            !estado ||
            String(remolque.estado ?? "").toLowerCase() === estado.toLowerCase();

        return coincideTexto && coincideEstado;
    });

    if (resultados.length === 0) {
        tabla.innerHTML = `
            <tr>
                <td colspan="7">No se encontraron remolques registrados.</td>
            </tr>
        `;
        return;
    }

    tabla.innerHTML = resultados.map(remolque => `
        <tr>
            <td>${esc(remolque.numero_remolque)}</td>
            <td>${esc(remolque.placas)}</td>
            <td>${esc(remolque.marca)}</td>
            <td>${esc(remolque.modelo)}</td>
            <td>${esc(remolque.anio_remolque ?? remolque.año_remolque)}</td>
            <td>${esc(remolque.capacidad)}</td>
            <td>${esc(remolque.estado)}</td>
        </tr>
    `).join("");
}

// ========================================
// FORMULARIO PARA REGISTRAR REMOLQUE
// ========================================

export function inicializarNuevoRemolque() {

    const formulario = document.getElementById("newTrailerForm");

    if (!formulario) return;

    const campo = id => document.getElementById(id);

    const botonGuardar = campo("saveTrailerButton");
    const botonCancelar = campo("cancelTrailer");

    formulario.addEventListener("submit", async (evento) => {

        evento.preventDefault();

        const datos = {
            numero_remolque: campo("trailerNumber").value.trim(),
            placas: campo("trailerPlates").value.trim(),
            marca: campo("trailerBrand").value.trim(),
            modelo: campo("trailerModel").value.trim(),
            año: campo("trailerYear").value || null,
            capacidad: campo("trailerCapacity").value,
            estado: campo("trailerStatus").value
        };

        if (botonGuardar) botonGuardar.disabled = true;

        try {

            await solicitarAPI(API_BASE, {
                method: "POST",
                body: JSON.stringify(datos)
            });

            alert("Remolque registrado correctamente.");

            navegar("Remolques");

        } catch (error) {

            alert(error.message);

        } finally {

            if (botonGuardar) botonGuardar.disabled = false;
        }
    });

    botonCancelar?.addEventListener("click", () => {
        navegar("Remolques");
    });
}
