
import { navegar } from "../Core/Router.js";

export function inicializarOrdenes() {

    document.getElementById("newOrderButton")
        ?.addEventListener("click", () => navegar("NuevaOrden"));

    aplicarCambiosGuardados();
    mostrarNuevasOrdenes();
    configurarAcciones();
    configurarFiltros();

}


// ======================================
// MODAL DEL SISTEMA
// ======================================

function crearModal() {

    let modal = document.getElementById("orderModal");

    if (modal) return modal;

    modal = document.createElement("div");

    modal.id = "orderModal";
    modal.className = "order-modal";

    modal.innerHTML = `
        <div class="order-modal-content">

            <div class="order-modal-header">
                <h2 id="modalTitle"></h2>

                <button type="button"
                    class="modal-close"
                    id="modalClose">
                    ×
                </button>
            </div>

            <div class="order-modal-body" id="modalBody"></div>

            <div class="order-modal-footer" id="modalFooter"></div>

        </div>
    `;

    document.body.appendChild(modal);

    modal.querySelector("#modalClose").onclick = cerrarModal;

    modal.addEventListener("click", e => {
        if (e.target === modal) cerrarModal();
    });

    return modal;
}


function abrirModal(titulo, contenido, botones) {

    const modal = crearModal();

    modal.querySelector("#modalTitle").textContent = titulo;

    modal.querySelector("#modalBody").innerHTML = contenido;

    const footer = modal.querySelector("#modalFooter");

    footer.innerHTML = "";

    botones.forEach(boton => {

        const button = document.createElement("button");

        button.type = "button";
        button.textContent = boton.texto;
        button.className = boton.clase;

        button.addEventListener("click", boton.accion);

        footer.appendChild(button);

    });

    modal.classList.add("active");
}


function cerrarModal() {

    const modal = document.getElementById("orderModal");

    if (modal) modal.classList.remove("active");

}


// ======================================
// VER ORDEN
// ======================================

function verOrden(datos) {

    abrirModal(
        "Detalles de la orden",
        `
        <div class="order-details">

            <div class="detail-item">
                <span>Número de orden</span>
                <strong>${esc(datos.numero)}</strong>
            </div>

            <div class="detail-item">
                <span>Cliente</span>
                <strong>${esc(datos.cliente)}</strong>
            </div>

            <div class="detail-item">
                <span>Origen</span>
                <strong>${esc(datos.origen)}</strong>
            </div>

            <div class="detail-item">
                <span>Destino</span>
                <strong>${esc(datos.destino)}</strong>
            </div>

            <div class="detail-item">
                <span>Camión</span>
                <strong>${esc(datos.camion)}</strong>
            </div>

            <div class="detail-item">
                <span>Fecha</span>
                <strong>${esc(datos.fecha)}</strong>
            </div>

            <div class="detail-item">
                <span>Estado</span>
                <strong>${esc(datos.estado)}</strong>
            </div>

        </div>
        `,
        [
            {
                texto: "Cerrar",
                clase: "modal-btn-secondary",
                accion: cerrarModal
            }
        ]
    );

}


// ======================================
// EDITAR ORDEN
// ======================================


function editarOrden(datos, fila) {

    const fechaISO = datos.fecha.includes("/")
        ? datos.fecha.split("/").reverse().join("-")
        : datos.fecha;

    abrirModal(
        "Editar orden",
        `
        <form id="editOrderForm">

            <div class="modal-form-group">
                <label>Número de orden</label>
                <input
                    name="numero"
                    value="${esc(datos.numero)}"
                    required
                >
            </div>

            <div class="modal-form-group">
                <label>Cliente</label>
                <input
                    name="cliente"
                    value="${esc(datos.cliente)}"
                    required
                >
            </div>

            <div class="modal-form-group">
                <label>Origen</label>
                <input
                    name="origen"
                    value="${esc(datos.origen)}"
                    required
                >
            </div>

            <div class="modal-form-group">
                <label>Destino</label>
                <input
                    name="destino"
                    value="${esc(datos.destino)}"
                    required
                >
            </div>

            <div class="modal-form-group">
                <label>Camión</label>
                <input
                    name="camion"
                    value="${esc(datos.camion)}"
                    required
                >
            </div>

            <div class="modal-form-group">
                <label>Fecha</label>
                <input
                    type="date"
                    name="fecha"
                    value="${esc(fechaISO)}"
                    required
                >
            </div>

            <div class="modal-form-group">
                <label>Estado</label>

                <select name="estado" required>

                    <option value="Pendiente"
                        ${datos.estado === "Pendiente" ? "selected" : ""}>
                        Pendiente
                    </option>

                    <option value="En curso"
                        ${datos.estado === "En curso" ? "selected" : ""}>
                        En curso
                    </option>

                    <option value="Finalizada"
                        ${datos.estado === "Finalizada" ? "selected" : ""}>
                        Finalizada
                    </option>

                    <option value="Cancelada"
                        ${datos.estado === "Cancelada" ? "selected" : ""}>
                        Cancelada
                    </option>

                </select>
            </div>

        </form>
        `,
        [
            {
                texto: "Cancelar",
                clase: "modal-btn-secondary",
                accion: cerrarModal
            },

            {
                texto: "Guardar cambios",
                clase: "modal-btn-primary",

                accion: () => {

                    const form = document.getElementById("editOrderForm");

                    if (!form.reportValidity()) return;

                    const data = new FormData(form);

                    const numeroAnterior = datos.numero;

                    const numeroNuevo = data.get("numero").trim();

                    const ordenes = JSON.parse(
                        localStorage.getItem("mtOrdenes") || "[]"
                    );

                    // Evitar números duplicados

                    const repetida = Array.from(
                        document.querySelectorAll(
                            ".orders-table tbody tr"
                        )
                    ).some(otraFila =>
                        otraFila !== fila &&
                        otraFila.dataset.order === numeroNuevo
                    );

                    if (repetida) {

                        alertModal("El número de orden ya existe.");

                        return;
                    }

                    // Obtener todos los datos

                    const cambios = {

                        numero: numeroNuevo,

                        cliente: data.get("cliente").trim(),

                        origen: data.get("origen").trim(),

                        destino: data.get("destino").trim(),

                        camion: data.get("camion").trim(),

                        fechaSalida: data.get("fecha"),

                        estado: data.get("estado")

                    };

                    // Actualizar almacenamiento de ediciones

                    const editadas = JSON.parse(
                        localStorage.getItem("mtOrdenesEditadas") || "{}"
                    );

                    delete editadas[numeroAnterior];

                    editadas[numeroNuevo] = cambios;

                    localStorage.setItem(
                        "mtOrdenesEditadas",
                        JSON.stringify(editadas)
                    );

                    // Actualizar órdenes guardadas

                    const indice = ordenes.findIndex(o =>
                        String(o.numero) === numeroAnterior
                    );

                    if (indice !== -1) {

                        ordenes[indice] = {
                            ...ordenes[indice],
                            ...cambios
                        };

                        localStorage.setItem(
                            "mtOrdenes",
                            JSON.stringify(ordenes)
                        );

                    }

                    // Actualizar fila visual

                    fila.dataset.order = numeroNuevo;

                    fila.children[0].textContent = numeroNuevo;

                    fila.children[1].textContent = cambios.cliente;

                    fila.children[2].textContent = cambios.origen;

                    fila.children[3].textContent = cambios.destino;

                    fila.children[4].textContent = cambios.camion;

                    fila.children[5].textContent =
                        cambios.fechaSalida.split("-").reverse().join("/");

                    const clases = {
                        "Pendiente": "status-pending",
                        "En curso": "status-progress",
                        "Finalizada": "status-finished",
                        "Cancelada": "status-cancelled"
                    };

                    fila.children[6].innerHTML = `
                        <span class="order-status ${clases[cambios.estado]}">
                            ${esc(cambios.estado)}
                        </span>
                    `;

                    // Actualizar filtros de eliminación

                    const eliminadas = JSON.parse(
                        localStorage.getItem("mtOrdenesEliminadas") || "[]"
                    );

                    const nuevasEliminadas = eliminadas.filter(
                        n => n !== numeroNuevo
                    );

                    localStorage.setItem(
                        "mtOrdenesEliminadas",
                        JSON.stringify(nuevasEliminadas)
                    );

                    cerrarModal();

                    abrirModal(
                        "Orden actualizada",
                        `
                        <p>
                            Todos los datos de la orden
                            ${esc(numeroNuevo)}
                            fueron actualizados correctamente.
                        </p>
                        `,
                        [{
                            texto: "Aceptar",
                            clase: "modal-btn-primary",
                            accion: cerrarModal
                        }]
                    );

                }
            }
        ]
    );

}



// ======================================
// ELIMINAR ORDEN
// ======================================

function eliminarOrden(datos, fila) {

    abrirModal(
        "Eliminar orden",
        `
        <div class="delete-confirmation">

            <div class="delete-icon">!</div>

            <p>
                ¿Estás seguro de que deseas eliminar esta orden?
            </p>

            <strong>${esc(datos.numero)}</strong>

            <small>Esta acción no se puede deshacer.</small>

        </div>
        `,
        [
            {
                texto: "Cancelar",
                clase: "modal-btn-secondary",
                accion: cerrarModal
            },
            {
                texto: "Eliminar orden",
                clase: "modal-btn-danger",
                accion: () => {

                    const eliminadas = JSON.parse(
                        localStorage.getItem("mtOrdenesEliminadas") || "[]"
                    );

                    if (!eliminadas.includes(datos.numero)) {
                        eliminadas.push(datos.numero);
                    }

                    localStorage.setItem(
                        "mtOrdenesEliminadas",
                        JSON.stringify(eliminadas)
                    );

                    const ordenes = JSON.parse(
                        localStorage.getItem("mtOrdenes") || "[]"
                    );

                    localStorage.setItem(
                        "mtOrdenes",
                        JSON.stringify(
                            ordenes.filter(o =>
                                String(o.numero) !== datos.numero
                            )
                        )
                    );

                    fila.remove();

                    cerrarModal();

                }
            }
        ]
    );

}


// ======================================
// ACCIONES
// ======================================

function configurarAcciones() {

    const tbody = document.querySelector(".orders-table tbody");

    tbody.addEventListener("click", e => {

        const boton = e.target.closest("button");

        if (!boton) return;

        const fila = boton.closest("tr");

        if (!fila) return;

        const celdas = fila.children;

        const datos = {
            numero: fila.dataset.order,
            cliente: celdas[1].textContent.trim(),
            origen: celdas[2].textContent.trim(),
            destino: celdas[3].textContent.trim(),
            camion: celdas[4].textContent.trim(),
            fecha: celdas[5].textContent.trim(),
            estado: celdas[6].textContent.trim()
        };

        if (boton.classList.contains("view-order")) {
            verOrden(datos);
        }

        if (boton.classList.contains("edit-order")) {
            editarOrden(datos, fila);
        }

        if (boton.classList.contains("delete-order")) {
            eliminarOrden(datos, fila);
        }

    });

}


// ======================================
// FILTROS
// ======================================

function configurarFiltros() {

    const buscador = document.querySelector(".order-search");

    const filtros = document.querySelectorAll(".order-filter");

    const tbody = document.querySelector(".orders-table tbody");

    if (!buscador || !filtros.length || !tbody) return;

    function filtrar() {

        tbody.querySelectorAll("tr").forEach(fila => {

            const texto = fila.textContent.toLowerCase();

            const busqueda = buscador.value.toLowerCase();

            const estado = normalizar(fila.children[6].textContent);

            const estadoFiltro = filtros[0].value;

            fila.hidden = !(
                texto.includes(busqueda) &&
                (!estadoFiltro || estado === estadoFiltro)
            );

        });

    }

    buscador.addEventListener("input", filtrar);

    filtros[0].addEventListener("change", filtrar);

}


// ======================================
// ALMACENAMIENTO
// ======================================

function aplicarCambiosGuardados() {

    const cambios = JSON.parse(
        localStorage.getItem("mtOrdenesEditadas") || "{}"
    );

    const eliminadas = JSON.parse(
        localStorage.getItem("mtOrdenesEliminadas") || "[]"
    );

    document.querySelectorAll(".orders-table tbody tr").forEach(fila => {

        const numero = fila.dataset.order;

        if (eliminadas.includes(numero)) {
            fila.remove();
            return;
        }

        if (cambios[numero]) {

            fila.children[1].textContent = cambios[numero].cliente;
            fila.children[2].textContent = cambios[numero].origen;
            fila.children[3].textContent = cambios[numero].destino;
            fila.children[4].textContent = cambios[numero].camion;

        }

    });

}


function mostrarNuevasOrdenes() {

    const tbody = document.querySelector(".orders-table tbody");

    const ordenes = JSON.parse(
        localStorage.getItem("mtOrdenes") || "[]"
    );

    ordenes.forEach(orden => {

        const numero = String(orden.numero);

        if (tbody.querySelector(`[data-order="${numero}"]`)) return;

        const fila = document.createElement("tr");

        fila.dataset.order = numero;

        [
            numero,
            orden.cliente,
            orden.origen,
            orden.destino,
            orden.camion,
            orden.fechaSalida,
            orden.estado
        ].forEach(valor => {

            const td = document.createElement("td");

            td.textContent = valor ?? "";

            fila.appendChild(td);

        });

        const acciones = document.createElement("td");

        acciones.className = "order-actions";

        acciones.innerHTML = `
            <button class="view-order">Ver</button>
            <button class="edit-order">Editar</button>
            <button class="delete-order">Eliminar</button>
        `;

        fila.appendChild(acciones);

        tbody.appendChild(fila);

    });

}


function normalizar(texto) {

    return texto.toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace("en curso", "curso");

}


function esc(texto) {

    return String(texto ?? "").replace(/[&<>"']/g, caracter => ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;"
    })[caracter]);

}



function alertModal(mensaje) {

    abrirModal(
        "Aviso",
        `<p>${esc(mensaje)}</p>`,
        [{
            texto: "Aceptar",
            clase: "modal-btn-primary",
            accion: cerrarModal
        }]
    );

}
