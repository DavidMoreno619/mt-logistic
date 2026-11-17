import { cargarComponente } from "./Core/Loader.js";
import { configurarRouter, navegar } from "./Core/Router.js";


document.addEventListener(
    "DOMContentLoaded",
    iniciarAplicacion
);


async function iniciarAplicacion() {

    console.log("MT iniciando...");


    // ==============================
    // CARGAR HEADER
    // ==============================

    await cargarComponente(
        "../Componentes/header.html",
        "header"
    );


    // ==============================
    // CARGAR MENU
    // ==============================

    await cargarComponente(
        "../Componentes/Menu.html",
        "sidebar"
    );


    // ==============================
    // CONFIGURAR ROUTER
    // ==============================

    configurarRouter();


    // ==============================
    // CARGAR DASHBOARD
    // ==============================

    navegar("Dashboard");
}