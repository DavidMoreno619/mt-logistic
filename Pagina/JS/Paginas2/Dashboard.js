import { navegar } from "../Core/Router.js";

export function inicializarDashboard() {

    const mapButton =
        document.querySelector(".panel-button");


    if (mapButton) {

        mapButton.addEventListener(
            "click",
            function () {

                navegar("Monitoreo");

            }
        );

    }

}


