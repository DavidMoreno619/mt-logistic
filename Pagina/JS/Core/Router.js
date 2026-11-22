import { cargarPagina } from "./Loader.js";

import {
    inicializarDashboard
} from "../Paginas2/Dashboard.js";

import {
    inicializarOrdenes
} from "../Paginas2/Ordenes.js";

import {
    inicializarNuevaOrden
} from "../Paginas2/NuevaOrden.js";

import {
    inicializarCamiones,
    inicializarNuevoCamion
} from "../Paginas2/Camiones.js";

import {
    inicializarRemolques,
    inicializarNuevoRemolque
} from "../Paginas2/Remolques.js";

import {
    inicializarMonitoreo
} from "../Paginas2/Monitoreo.js";

import {
    inicializarOperadores,
    inicializarNuevoOperador
} from "../Paginas2/Operadores.js";

import {
    inicializarClientes,
    inicializarNuevoCliente
} from "../Paginas2/Clientes.js";

import {
    inicializarFacturacion,
    inicializarNuevaFactura
} from "../Paginas2/Facturacion.js";

import {
    inicializarCobranza,
    inicializarRegistrarPago
} from "../Paginas2/Cobranza.js";

import {
    tienePermiso,
    obtenerSesion
} from "./Auth.js";

import {
    inicializarUsuarios
} from "../Paginas2/Usuarios.js";


/* =========================================================
   RUTAS
   ========================================================= */

const RUTAS = {

    Dashboard:
        "../Paginas/Dashboard.html",

    Ordenes:
        "../Paginas/Ordenes.html",

    NuevaOrden:
        "../Paginas/N_orden.html",

    Camiones:
        "../Paginas/Camiones.html",

    NuevoCamion:
        "../Paginas/N_camion.html",

    Remolques:
        "../Paginas/Remolques.html",

    NuevoRemolque:
        "../Paginas/N_remolque.html",

    Monitoreo:
        "../Paginas/Monitoreo.html",

    Operadores:
        "../Paginas/Operadores.html",

    NuevoOperador:
        "../Paginas/N_operador.html",

    Clientes:
        "../Paginas/Clientes.html",

    NuevoCliente:
        "../Paginas/N_cliente.html",

    Facturacion:
        "../Paginas/Facturacion.html",

    NuevaFactura:
        "../Paginas/N_factura.html",

    Cobranza:
        "../Paginas/Cobranza.html",

    RegistrarPago:
        "../Paginas/Pago.html",

    Usuarios:
        "../Paginas/Usuarios.html"
};


/* =========================================================
   INICIALIZADORES
   ========================================================= */

const INICIALIZADORES = {

    Dashboard:
        inicializarDashboard,

    Ordenes:
        inicializarOrdenes,

    NuevaOrden:
        inicializarNuevaOrden,

    Camiones:
        inicializarCamiones,

    NuevoCamion:
        inicializarNuevoCamion,


    Remolques:
        inicializarRemolques,

    NuevoRemolque:
        inicializarNuevoRemolque,

    Monitoreo:
        inicializarMonitoreo,

    Operadores:
        inicializarOperadores,

    NuevoOperador:
        inicializarNuevoOperador,

    Clientes:
        inicializarClientes,

    NuevoCliente:
        inicializarNuevoCliente,

    Facturacion:
        inicializarFacturacion,

    NuevaFactura:
        inicializarNuevaFactura,

    Cobranza:
        inicializarCobranza,

    RegistrarPago:
        inicializarRegistrarPago,

    Usuarios:
        inicializarUsuarios
};


/* =========================================================
   ALIAS DEL MENÚ
   ========================================================= */

const ALIAS = {

    monitoring: "Monitoreo",
    trucks: "Camiones",
    remolques: "Remolques",
    operators: "Operadores",
    clients: "Clientes",
    billing: "Facturacion",
    collections: "Cobranza"

};


/* =========================================================
   PÁGINA PADRE
   ---------------------------------------------------------
   Sirve para que las páginas secundarias mantengan
   seleccionado su apartado principal.
   ========================================================= */

const PAGINA_PADRE = {

    NuevaOrden: "Ordenes",

    NuevoCamion: "Camiones",

    NuevoRemolque: "Remolques",

    NuevoOperador: "Operadores",

    NuevoCliente: "Clientes",

    NuevaFactura: "Facturacion",

    RegistrarPago: "Cobranza"
};


/* =========================================================
   NAVEGAR
   ========================================================= */

export function navegar(pagina) {

    /*
     * Convertir alias a nombre real
     *
     * Ejemplo:
     *
     * monitoring → Monitoreo
     * trucks     → Camiones
     */
    pagina =
        ALIAS[pagina] || pagina;


    /* -----------------------------------------------------
       Verificar que exista la página
       ----------------------------------------------------- */

    const ruta =
        RUTAS[pagina];

    if (!ruta) {

        console.error(
            `No existe una ruta para: ${pagina}`
        );

        return;
    }

    const sesion = obtenerSesion();

    if (!sesion) return;

    if (pagina === "Usuarios" && sesion.role !== "admin") {
        return;
    }

    if (!tienePermiso(pagina)) {
        return;
    }

    /* -----------------------------------------------------
       Actualizar menú
       ----------------------------------------------------- */

    actualizarMenu(pagina);


    /* -----------------------------------------------------
       Cargar página
       ----------------------------------------------------- */

    cargarPagina(
        ruta,
        INICIALIZADORES[pagina]
    );
}


/* =========================================================
   CONFIGURAR ROUTER
   ========================================================= */

export function configurarRouter() {

    document.addEventListener(
        "click",
        function (event) {

            const item =
                event.target.closest(
                    ".sidebar-item"
                );


            /* ---------------------------------------------
               Si el clic no fue en una opción del menú
               --------------------------------------------- */

            if (!item) {
                return;
            }


            event.preventDefault();


            /* ---------------------------------------------
               Obtener página
               --------------------------------------------- */

            const pagina =
                item.getAttribute(
                    "data-page"
                );


            if (!pagina) {
                return;
            }


            /* ---------------------------------------------
               Navegar
               --------------------------------------------- */

            navegar(pagina);
        }
    );
}


/* =========================================================
   ACTUALIZAR MENÚ
   ========================================================= */

function actualizarMenu(pagina) {

    /*
     * Si estamos en una página secundaria,
     * obtenemos su página principal.
     *
     * Ejemplo:
     *
     * NuevaOrden → Ordenes
     * NuevoCamion → Camiones
     */

    const paginaMenu =
        PAGINA_PADRE[pagina] || pagina;


    document
        .querySelectorAll(".sidebar-item")
        .forEach(item => {

            const paginaItem =
                item.getAttribute(
                    "data-page"
                );


            /*
             * Convertimos también el valor del menú
             * mediante ALIAS.
             *
             * Ejemplo:
             *
             * monitoring → Monitoreo
             */

            const paginaNormalizada =
                ALIAS[paginaItem] || paginaItem;


            /*
             * Activar únicamente la opción
             * correspondiente.
             */

            item.classList.toggle(
                "active",
                paginaNormalizada === paginaMenu
            );

        });
}


/* =========================================================
   OBTENER RUTA
   ========================================================= */

export function obtenerRuta(nombre) {

    return RUTAS[nombre] || null;
}