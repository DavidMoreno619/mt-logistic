import { navegar } from "../Core/Router.js";
import { escaparHTML, normalizarEstado, formatearFecha } from "../Core/Utils.js";

export function inicializarOrdenes() {

    const newOrderButton =
        document.getElementById("newOrderButton");


    if (newOrderButton) {

        newOrderButton.addEventListener(
            "click",
            function () {

                navegar("NuevaOrden");

            }
        );

    }


    mostrarOrdenes();

    configurarFiltrosOrdenes();

    configurarBotonesVerOrden();

}


// =====================================================
// MOSTRAR ÓRDENES GUARDADAS
// =====================================================

function mostrarOrdenes() {

    const tableBody =
        document.querySelector(
            ".orders-table tbody"
        );


    if (!tableBody) {
        return;
    }


    const ordenes =
        JSON.parse(
            localStorage.getItem("mtOrdenes")
        ) || [];


    ordenes.forEach(function (orden) {

        const row =
            document.createElement("tr");


        row.setAttribute(
            "data-status",
            normalizarEstado(orden.estado)
        );


        row.setAttribute(
            "data-date",
            orden.fechaSalida
        );


        row.innerHTML = `

            <td>${escaparHTML(orden.numero)}</td>

            <td>${escaparHTML(orden.cliente)}</td>

            <td>${escaparHTML(orden.origen)}</td>

            <td>${escaparHTML(orden.destino)}</td>

            <td>${escaparHTML(orden.camion)}</td>

            <td>${formatearFecha(orden.fechaSalida)}</td>

            <td>
                <span class="order-status status-pending">
                    ${escaparHTML(orden.estado)}
                </span>
            </td>

            <td>
                <button
                    type="button"
                    class="view-order"
                    data-order="${escaparHTML(orden.numero)}"
                >
                    Ver
                </button>
            </td>

        `;


        tableBody.appendChild(row);

    });

}


// =====================================================
// FILTROS DE ÓRDENES
// =====================================================

function configurarFiltrosOrdenes() {

    const searchInput =
        document.querySelector(".order-search");


    const filters =
        document.querySelectorAll(".order-filter");


    const statusFilter =
        filters[0];


    const dateFilter =
        filters[1];


    const tableBody =
        document.querySelector(
            ".orders-table tbody"
        );


    if (
        !searchInput ||
        !statusFilter ||
        !dateFilter ||
        !tableBody
    ) {

        return;

    }


    function filtrarOrdenes() {

        const searchText =
            searchInput.value
                .toLowerCase()
                .trim();


        const selectedStatus =
            statusFilter.value;


        const selectedDate =
            dateFilter.value;


        const rows =
            tableBody.querySelectorAll("tr");


        rows.forEach(function (row) {

            const rowText =
                row.textContent
                    .toLowerCase();


            const rowStatus =
                row.getAttribute(
                    "data-status"
                ) || obtenerEstadoDeFila(row);


            const rowDate =
                row.getAttribute(
                    "data-date"
                ) || obtenerFechaDeFila(row);


            const matchesSearch =
                rowText.includes(
                    searchText
                );


            let matchesStatus = true;


            if (selectedStatus) {

                matchesStatus =
                    rowStatus === selectedStatus;

            }


            let matchesDate = true;


            if (selectedDate) {

                matchesDate =
                    validarFiltroFecha(
                        rowDate,
                        selectedDate
                    );

            }


            if (
                matchesSearch &&
                matchesStatus &&
                matchesDate
            ) {

                row.style.display = "";

            } else {

                row.style.display = "none";

            }

        });

    }


    searchInput.addEventListener(
        "input",
        filtrarOrdenes
    );


    statusFilter.addEventListener(
        "change",
        filtrarOrdenes
    );


    dateFilter.addEventListener(
        "change",
        filtrarOrdenes
    );


    filtrarOrdenes();

}


// =====================================================
// OBTENER ESTADO DE FILA
// =====================================================

function obtenerEstadoDeFila(row) {

    const statusElement =
        row.querySelector(".order-status");


    if (!statusElement) {
        return "";
    }


    return normalizarEstado(
        statusElement.textContent
    );

}




// =====================================================
// OBTENER FECHA DE FILA
// =====================================================

function obtenerFechaDeFila(row) {

    if (row.children.length < 6) {
        return "";
    }


    const fechaTexto =
        row.children[5].textContent.trim();


    const partes =
        fechaTexto.split("/");


    if (partes.length !== 3) {
        return fechaTexto;
    }


    return `${partes[2]}-${partes[1]}-${partes[0]}`;

}


// =====================================================
// VALIDAR FILTRO DE FECHA
// =====================================================

function validarFiltroFecha(fecha, filtro) {

    if (!fecha) {
        return false;
    }


    const fechaOrden =
        new Date(`${fecha}T00:00:00`);


    if (isNaN(fechaOrden.getTime())) {
        return false;
    }


    const hoy =
        new Date();


    hoy.setHours(
        0,
        0,
        0,
        0
    );


    if (filtro === "hoy") {

        return (
            fechaOrden.getTime() ===
            hoy.getTime()
        );

    }


    if (filtro === "semana") {

        const diferencia =
            hoy - fechaOrden;


        const sieteDias =
            7 * 24 * 60 * 60 * 1000;


        return (
            diferencia >= 0 &&
            diferencia <= sieteDias
        );

    }


    if (filtro === "mes") {

        return (
            fechaOrden.getMonth() ===
            hoy.getMonth() &&
            fechaOrden.getFullYear() ===
            hoy.getFullYear()
        );

    }


    return true;

}




// =====================================================
// BOTONES VER ORDEN
// =====================================================

function configurarBotonesVerOrden() {

    const buttons =
        document.querySelectorAll(
            ".view-order"
        );


    buttons.forEach(function (button) {

        button.addEventListener(
            "click",
            function () {

                const numero =
                    button.getAttribute(
                        "data-order"
                    );


                alert(
                    `Mostrando información de la orden ${numero}`
                );

            }
        );

    });

}


// =====================================================
