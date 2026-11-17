import { navegar } from "../Core/Router.js";

export function inicializarCobranza() {

    const search =
        document.getElementById(
            "collectionSearch"
        );

    const statusFilter =
        document.getElementById(
            "collectionStatusFilter"
        );

    const rows =
        document.querySelectorAll(
            "#collectionTableBody tr"
        );


    function filtrarCobranza() {

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
        filtrarCobranza
    );


    statusFilter.addEventListener(
        "change",
        filtrarCobranza
    );


    const paymentButtons =
        document.querySelectorAll(
            ".payment-action"
        );


    paymentButtons.forEach(
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


                    if (
                        action === "payment"
                    ) {

                        navegar("RegistrarPago");

                    }


                    if (
                        action === "view"
                    ) {

                        alert(
                            `Mostrando pagos de ${invoice}`
                        );

                    }

                }
            );

        }
    );

}

export function inicializarRegistrarPago() {

    const form =
        document.getElementById(
            "paymentForm"
        );


    if (!form) {
        return;
    }


    const saldoPendiente = 12000;


    form.addEventListener(
        "submit",
        function (event) {

            event.preventDefault();


            const amount =
                Number(
                    document.getElementById(
                        "paymentAmount"
                    ).value
                );


            if (amount <= 0) {

                alert(
                    "El monto debe ser mayor a cero."
                );

                return;

            }


            if (
                amount >
                saldoPendiente
            ) {

                alert(
                    "El pago no puede ser mayor al saldo pendiente."
                );

                return;

            }


            if (
                amount ===
                saldoPendiente
            ) {

                alert(
                    "Pago registrado. La factura queda PAGADA."
                );

            } else {

                alert(
                    "Pago registrado. La factura queda con PAGO PARCIAL."
                );

            }


            navegar("Cobranza");

        }
    );


    const cancelButton =
        document.getElementById(
            "cancelPayment"
        );


    if (cancelButton) {

        cancelButton.addEventListener(
            "click",
            function () {

                navegar("Cobranza");

            }
        );

    }

}

// =====================================================
