import { navegar } from "../Core/Router.js";

export function inicializarClientes() {

    const search =
        document.getElementById(
            "clientSearch"
        );

    const statusFilter =
        document.getElementById(
            "clientStatusFilter"
        );

    const rows =
        document.querySelectorAll(
            "#clientsTableBody tr"
        );


    function filtrarClientes() {

        const searchText =
            search.value
                .toLowerCase()
                .trim();

        const status =
            statusFilter.value;


        rows.forEach(function (row) {

            const rowSearch =
                row
                    .getAttribute("data-search")
                    .toLowerCase();


            const rowStatus =
                row.getAttribute(
                    "data-status"
                );


            const matchesSearch =
                rowSearch.includes(
                    searchText
                );


            const matchesStatus =
                !status ||
                rowStatus === status;


            row.style.display =
                matchesSearch &&
                    matchesStatus
                    ? ""
                    : "none";

        });

    }


    search.addEventListener(
        "input",
        filtrarClientes
    );


    statusFilter.addEventListener(
        "change",
        filtrarClientes
    );


    // Agregar cliente

    const newClientButton =
        document.getElementById(
            "newClientButton"
        );


    if (newClientButton) {

        newClientButton.addEventListener(
            "click",
            function () {

                navegar("NuevoCliente");

            }
        );

    }


    // Acciones

    const actionButtons =
        document.querySelectorAll(
            ".client-action"
        );


    actionButtons.forEach(
        function (button) {

            button.addEventListener(
                "click",
                function () {

                    const action =
                        button.getAttribute(
                            "data-action"
                        );

                    const client =
                        button.getAttribute(
                            "data-client"
                        );


                    if (
                        action === "view"
                    ) {

                        alert(
                            `Mostrando información de ${client}`
                        );

                    }


                    if (
                        action === "edit"
                    ) {

                        alert(
                            `Editando a ${client}`
                        );

                    }

                }
            );

        }
    );

}

export function inicializarNuevoCliente() {

    const form =
        document.getElementById(
            "newClientForm"
        );


    if (!form) {
        return;
    }


    form.addEventListener(
        "submit",
        function (event) {

            event.preventDefault();


            const name =
                document.getElementById(
                    "clientName"
                ).value.trim();


            const company =
                document.getElementById(
                    "clientCompany"
                ).value.trim();


            const phone =
                document.getElementById(
                    "clientPhone"
                ).value.trim();


            const email =
                document.getElementById(
                    "clientEmail"
                ).value.trim();


            const rfc =
                document.getElementById(
                    "clientRFC"
                ).value.trim();


            if (
                !name ||
                !company ||
                !phone ||
                !email ||
                !rfc
            ) {

                alert(
                    "Completa todos los campos obligatorios."
                );

                return;

            }


            if (
                rfc.length !== 12 &&
                rfc.length !== 13
            ) {

                alert(
                    "El RFC debe tener 12 o 13 caracteres."
                );

                return;

            }


            alert(
                `El cliente ${company} fue registrado correctamente.`
            );


            navegar("Clientes");

        }
    );


    const cancelButton =
        document.getElementById(
            "cancelClient"
        );


    if (cancelButton) {

        cancelButton.addEventListener(
            "click",
            function () {

                navegar("Clientes");

            }
        );

    }

}

