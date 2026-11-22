
import { cargarComponente } from "./Core/Loader.js";

import {
    configurarRouter,
    navegar
} from "./Core/Router.js";

import {
    prepararUsuarios,
    iniciarSesion,
    obtenerSesion,
    cerrarSesion,
    tienePermiso
} from "./Core/Auth.js";


document.addEventListener("DOMContentLoaded", iniciarAplicacion);


async function iniciarAplicacion() {

    prepararUsuarios();

    const sesion = obtenerSesion();

    if (!sesion) {
        mostrarLogin();
        return;
    }

    await mostrarSistema(sesion);
}


async function mostrarLogin() {

    document.getElementById("systemShell")
        .classList.add("hidden");

    const pantalla = document.getElementById("loginScreen");

    const respuesta = await fetch("../Paginas/Bienvenida.html");

    pantalla.innerHTML = await respuesta.text();

    document.getElementById("loginForm")
        .addEventListener("submit", async (e) => {

            e.preventDefault();

            const datos = new FormData(e.currentTarget);

            const resultado = iniciarSesion(
                datos.get("username"),
                datos.get("password")
            );

            if (!resultado.ok) {

                document.getElementById("loginError").textContent =
                    resultado.message;

                return;
            }

            pantalla.innerHTML = "";

            await mostrarSistema(resultado.session);

        });
}


async function mostrarSistema(sesion) {

    document.getElementById("loginScreen").innerHTML = "";

    document.getElementById("systemShell")
        .classList.remove("hidden");

    await cargarComponente(
        "../Componentes/header.html",
        "header"
    );

    await cargarComponente(
        "../Componentes/Menu.html",
        "sidebar"
    );

    document.getElementById("currentUserLabel").textContent =
        sesion.name;

    document.getElementById("logoutButton")
        .addEventListener("click", () => {

            cerrarSesion();

            document.getElementById("systemShell")
                .classList.add("hidden");

            mostrarLogin();

        });


    document.querySelectorAll(".sidebar-item")
        .forEach(item => {

            const pagina = item.dataset.page;

            if (
                item.classList.contains("admin-only") &&
                sesion.role !== "admin"
            ) {
                item.remove();
                return;
            }

            if (!tienePermiso(pagina)) {
                item.remove();
            }

        });


    configurarRouter();

    const primeraPagina = sesion.role === "admin"
        ? "Dashboard"
        : sesion.permissions[0];

    navegar(primeraPagina || "Dashboard");

}
