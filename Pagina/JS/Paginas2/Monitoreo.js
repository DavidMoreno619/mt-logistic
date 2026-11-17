import { navegar } from "../Core/Router.js";

export function inicializarMonitoreo() {

    const units =
        document.querySelectorAll(
            ".unit-item"
        );


    const markers =
        document.querySelectorAll(
            ".truck-marker"
        );


    const unidades = {

        "MT-001": {

            estado: "En movimiento",

            velocidad: "78 km/h",

            ubicacion: "Guadalajara, Jalisco",

            direccion: "Norte",

            actualizacion: "Hace 10 segundos",

            origen: "Guadalajara",

            destino: "Monterrey",

            progreso: 42

        },


        "MT-004": {

            estado: "Detenido",

            velocidad: "0 km/h",

            ubicacion: "León, Guanajuato",

            direccion: "Oeste",

            actualizacion: "Hace 25 segundos",

            origen: "León",

            destino: "Guadalajara",

            progreso: 67

        },


        "MT-008": {

            estado: "En movimiento",

            velocidad: "65 km/h",

            ubicacion: "Tepic, Nayarit",

            direccion: "Sureste",

            actualizacion: "Hace 8 segundos",

            origen: "Tepic",

            destino: "Ciudad de México",

            progreso: 31

        }

    };


    function seleccionarUnidad(id) {

        const unidad =
            unidades[id];


        if (!unidad) {
            return;
        }


        units.forEach(function (item) {

            item.classList.remove(
                "selected"
            );

        });


        const selectedItem =
            document.querySelector(
                `.unit-item[data-unit="${id}"]`
            );


        if (selectedItem) {

            selectedItem.classList.add(
                "selected"
            );

        }


        markers.forEach(function (marker) {

            marker.classList.remove(
                "marker-selected"
            );

        });


        const selectedMarker =
            document.querySelector(
                `.truck-marker[data-unit="${id}"]`
            );


        if (selectedMarker) {

            selectedMarker.classList.add(
                "marker-selected"
            );

        }


        const selectedUnit =
            document.getElementById(
                "selectedUnit"
            );


        const selectedStatus =
            document.getElementById(
                "selectedStatus"
            );


        const selectedSpeed =
            document.getElementById(
                "selectedSpeed"
            );


        const selectedLocation =
            document.getElementById(
                "selectedLocation"
            );


        const selectedDirection =
            document.getElementById(
                "selectedDirection"
            );


        const selectedUpdate =
            document.getElementById(
                "selectedUpdate"
            );


        const tripOrigin =
            document.getElementById(
                "tripOrigin"
            );


        const tripDestination =
            document.getElementById(
                "tripDestination"
            );


        const tripPercentage =
            document.getElementById(
                "tripPercentage"
            );


        if (selectedUnit) {
            selectedUnit.textContent = id;
        }


        if (selectedStatus) {
            selectedStatus.textContent = unidad.estado;
        }


        if (selectedSpeed) {
            selectedSpeed.textContent = unidad.velocidad;
        }


        if (selectedLocation) {
            selectedLocation.textContent = unidad.ubicacion;
        }


        if (selectedDirection) {
            selectedDirection.textContent = unidad.direccion;
        }


        if (selectedUpdate) {
            selectedUpdate.textContent = unidad.actualizacion;
        }


        if (tripOrigin) {
            tripOrigin.textContent = unidad.origen;
        }


        if (tripDestination) {
            tripDestination.textContent = unidad.destino;
        }


        if (tripPercentage) {
            tripPercentage.textContent =
                `${unidad.progreso}%`;
        }


        const progress =
            document.querySelector(
                ".progress-value"
            );


        if (progress) {

            progress.style.width =
                `${unidad.progreso}%`;

        }

    }


    units.forEach(function (unit) {

        unit.addEventListener(
            "click",
            function () {

                const id =
                    unit.getAttribute(
                        "data-unit"
                    );


                seleccionarUnidad(id);

            }
        );

    });


    markers.forEach(function (marker) {

        marker.addEventListener(
            "click",
            function () {

                const id =
                    marker.getAttribute(
                        "data-unit"
                    );


                seleccionarUnidad(id);

            }
        );

    });


    seleccionarUnidad("MT-001");

}


// =====================================================
// ESCAPAR HTML
// =====================================================

