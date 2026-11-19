
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

    tabla.addEventListener("click", async (evento) => {

        const botonEditar = evento.target.closest("[data-editar]");
        const botonEliminar = evento.target.closest("[data-eliminar]");

        // EDITAR REMOLQUE
        if (botonEditar) {
            const id = Number(botonEditar.dataset.editar);

            const remolque = remolques.find(r =>
                Number(r.ID_REMOLQUE ?? r.id_remolque) === id
            );

            if (remolque) {
                sessionStorage.setItem(
                    "remolqueEditar",
                    JSON.stringify(remolque)
                );

                navegar("NuevoRemolque");
            }
        }

        // ELIMINAR REMOLQUE
        if (botonEliminar) {
            const id = botonEliminar.dataset.eliminar;

            if (!confirm("¿Deseas dar de baja este remolque?")) return;

            try {
                await solicitarAPI(`${API_BASE}/${id}`, {
                    method: "DELETE"
                });

                alert("Remolque dado de baja correctamente.");

                remolques = await solicitarAPI(API_BASE);
                mostrarRemolques();

            } catch (error) {
                alert(error.message);
            }
        }
    });

    botonNuevo?.addEventListener("click", () => {
        sessionStorage.removeItem("remolqueEditar");
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
            remolque.numero_remolque ?? remolque.NUMERO_REMOLQUE,
            remolque.placas ?? remolque.PLACAS,
            remolque.marca ?? remolque.MARCA,
            remolque.modelo ?? remolque.MODELO
        ].some(valor =>
            String(valor ?? "").toLowerCase().includes(texto)
        );

        const coincideEstado =
            !estado ||
            String(remolque.estado ?? remolque.ESTADO ?? "").toLowerCase() === estado.toLowerCase();

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

    tabla.innerHTML = resultados.map(remolque => {
        const id = remolque.ID_REMOLQUE ?? remolque.id_remolque;

        return `
        <tr>
            <td>${esc(remolque.numero_remolque ?? remolque.NUMERO_REMOLQUE)}</td>
            <td>${esc(remolque.placas ?? remolque.PLACAS)}</td>
            <td>${esc(remolque.marca ?? remolque.MARCA)}</td>
            <td>${esc(remolque.modelo ?? remolque.MODELO)}</td>
            <td>${esc(remolque.anio_remolque ?? remolque.ANIO_REMOLQUE ?? remolque["AÑO_REMOLQUE"])}</td>
            <td>${esc(remolque.capacidad ?? remolque.CAPACIDAD)}</td>
            <td>${esc(remolque.estado ?? remolque.ESTADO)}</td>
            <td>
                <button type="button" data-editar="${id}">Editar</button>
                <button type="button" data-eliminar="${id}">Eliminar</button>
            </td>
        </tr>
    `;
    }).join("");
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
    const titulo = campo("trailerFormTitle");

    const remolqueEditar = JSON.parse(
        sessionStorage.getItem("remolqueEditar") || "null"
    );

    const idRemolque = remolqueEditar
        ? remolqueEditar.ID_REMOLQUE ?? remolqueEditar.id_remolque
        : null;

    if (remolqueEditar) {
        titulo.textContent = "Editar remolque";
        botonGuardar.textContent = "Guardar cambios";

        campo("trailerNumber").value =
            remolqueEditar.NUMERO_REMOLQUE ?? remolqueEditar.numero_remolque ?? "";

        campo("trailerPlates").value =
            remolqueEditar.PLACAS ?? remolqueEditar.placas ?? "";

        campo("trailerBrand").value =
            remolqueEditar.MARCA ?? remolqueEditar.marca ?? "";

        campo("trailerModel").value =
            remolqueEditar.MODELO ?? remolqueEditar.modelo ?? "";

        campo("trailerYear").value =
            remolqueEditar.ANIO_REMOLQUE ??
            remolqueEditar["AÑO_REMOLQUE"] ??
            remolqueEditar.anio_remolque ?? "";

        campo("trailerCapacity").value =
            remolqueEditar.CAPACIDAD ?? remolqueEditar.capacidad ?? "";

        campo("trailerStatus").value =
            remolqueEditar.ESTADO ?? remolqueEditar.estado ?? "Disponible";
    } else {
        titulo.textContent = "Agregar remolque";
        botonGuardar.textContent = "Guardar remolque";
    }

    formulario.addEventListener("submit", async (evento) => {
        evento.preventDefault();

        const datos = {
            numero_remolque: campo("trailerNumber").value.trim(),
            placas: campo("trailerPlates").value.trim(),
            marca: campo("trailerBrand").value.trim(),
            modelo: campo("trailerModel").value.trim(),
            anio: campo("trailerYear").value || null,
            capacidad: campo("trailerCapacity").value,
            estado: campo("trailerStatus").value
        };

        if (botonGuardar) botonGuardar.disabled = true;

        try {
            await solicitarAPI(
                remolqueEditar
                    ? `${API_BASE}/${idRemolque}`
                    : API_BASE,
                {
                    method: remolqueEditar ? "PUT" : "POST",
                    body: JSON.stringify(datos)
                }
            );

            sessionStorage.removeItem("remolqueEditar");

            alert(
                remolqueEditar
                    ? "Remolque actualizado correctamente."
                    : "Remolque registrado correctamente."
            );

            navegar("Remolques");

        } catch (error) {
            alert(error.message);
        } finally {
            if (botonGuardar) botonGuardar.disabled = false;
        }
    });

    botonCancelar?.addEventListener("click", () => {
        sessionStorage.removeItem("remolqueEditar");
        navegar("Remolques");
    });
}