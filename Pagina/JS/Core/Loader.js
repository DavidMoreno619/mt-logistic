// =====================================================
// CARGAR COMPONENTES
// =====================================================

export async function cargarComponente(ruta, id) {

    try {

        const respuesta = await fetch(ruta);

        if (!respuesta.ok) {

            throw new Error(
                `No se pudo cargar: ${ruta}`
            );

        }

        const contenido = await respuesta.text();

        const elemento = document.getElementById(id);

        if (!elemento) {

            throw new Error(
                `No existe el elemento #${id}`
            );

        }

        elemento.innerHTML = contenido;

        console.log(
            `Componente cargado correctamente: ${ruta}`
        );

        return true;

    } catch (error) {

        console.error(
            "Error al cargar componente:",
            error
        );

        return false;
    }
}


// =====================================================
// CARGAR PAGINAS
// =====================================================

export async function cargarPagina(
    ruta,
    inicializador
) {

    try {

        console.log(
            `Cargando página: ${ruta}`
        );


        const respuesta = await fetch(ruta);


        if (!respuesta.ok) {

            throw new Error(
                `No se pudo cargar la página: ${ruta}`
            );

        }


        const contenido = await respuesta.text();


        const app =
            document.getElementById("app");


        if (!app) {

            throw new Error(
                "No existe el elemento #app"
            );

        }


        app.innerHTML = contenido;


        console.log(
            `Página cargada correctamente: ${ruta}`
        );


        // Ejecutar JS de la página
        if (typeof inicializador === "function") {

            inicializador();

        }


        return true;

    } catch (error) {

        console.error(
            "Error al cargar página:",
            error
        );


        const app =
            document.getElementById("app");


        if (app) {

            app.innerHTML = `
                <div style="
                    padding: 30px;
                    color: red;
                    font-family: Arial;
                ">
                    <h2>Error al cargar la página</h2>

                    <p>
                        ${error.message}
                    </p>
                </div>
            `;

        }

        return false;
    }
}