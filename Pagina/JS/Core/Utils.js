export function escaparHTML(valor) {

    return String(valor ?? "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}


export function formatearFecha(fecha) {

    if (!fecha) {
        return "";
    }

    const partes =
        fecha.split("-");

    if (partes.length !== 3) {
        return fecha;
    }

    return `${partes[2]}/${partes[1]}/${partes[0]}`;
}


export function normalizarEstado(estado) {

    const valor =
        String(estado)
            .toLowerCase()
            .trim();

    if (
        valor === "en curso" ||
        valor === "curso"
    ) {
        return "curso";
    }

    if (valor === "pendiente") {
        return "pendiente";
    }

    if (valor === "finalizada") {
        return "finalizada";
    }

    if (valor === "cancelada") {
        return "cancelada";
    }

    return valor;
}