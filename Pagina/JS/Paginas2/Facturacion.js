import { navegar } from "../Core/Router.js";

export function inicializarFacturacion() {

    const search =
        document.getElementById(
            "invoiceSearch"
        );

    const statusFilter =
        document.getElementById(
            "invoiceStatusFilter"
        );

    const rows =
        document.querySelectorAll(
            "#invoicesTableBody tr"
        );


    function filtrarFacturas() {

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
        filtrarFacturas
    );


    statusFilter.addEventListener(
        "change",
        filtrarFacturas
    );


    const newInvoiceButton =
        document.getElementById(
            "newInvoiceButton"
        );


    if (newInvoiceButton) {

        newInvoiceButton.addEventListener(
            "click",
            function () {

                navegar("NuevaFactura");

            }
        );

    }


    const actionButtons =
        document.querySelectorAll(
            ".invoice-action"
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

                    const invoice =
                        button.getAttribute(
                            "data-invoice"
                        );


                    if (action === "view") {

                        alert(
                            `Mostrando ${invoice}`
                        );

                    }


                    if (action === "download") {

                        alert(
                            `Generando PDF de ${invoice}`
                        );

                    }


                    if (action === "correct") {

                        alert(
                            `Abriendo corrección de ${invoice}`
                        );

                    }

                }
            );

        }
    );

}

export function inicializarNuevaFactura() {

    const form =
        document.getElementById(
            "newInvoiceForm"
        );


    if (!form) {
        return;
    }


    const quantity =
        document.getElementById(
            "invoiceQuantity"
        );

    const price =
        document.getElementById(
            "invoicePrice"
        );


    function calcularFactura() {

        const cantidad =
            Number(quantity.value) || 0;


        const precio =
            Number(price.value) || 0;


        const subtotal =
            cantidad * precio;


        const iva =
            subtotal * 0.16;


        const total =
            subtotal + iva;


        document.getElementById(
            "invoiceSubtotal"
        ).textContent =
            `$${subtotal.toFixed(2)}`;


        document.getElementById(
            "invoiceTax"
        ).textContent =
            `$${iva.toFixed(2)}`;


        document.getElementById(
            "invoiceTotal"
        ).textContent =
            `$${total.toFixed(2)}`;

    }


    quantity.addEventListener(
        "input",
        calcularFactura
    );


    price.addEventListener(
        "input",
        calcularFactura
    );


    form.addEventListener(
        "submit",
        function (event) {

            event.preventDefault();


            const order =
                document.getElementById(
                    "invoiceOrder"
                ).value;


            const client =
                document.getElementById(
                    "invoiceClient"
                ).value;


            const description =
                document.getElementById(
                    "invoiceDescription"
                ).value.trim();


            if (
                !order ||
                !client ||
                !description
            ) {

                alert(
                    "Completa todos los campos obligatorios."
                );

                return;

            }


            alert(
                "Factura guardada como pendiente de validación."
            );


            navegar("Facturacion");

        }
    );


    const cancelButton =
        document.getElementById(
            "cancelInvoice"
        );


    if (cancelButton) {

        cancelButton.addEventListener(
            "click",
            function () {

                navegar("Facturacion");

            }
        );

    }

}

