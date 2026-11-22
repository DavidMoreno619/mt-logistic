
const USERS_KEY = "mtUsuarios";
const SESSION_KEY = "mtSesion";

export const PAGINAS = [
    "Dashboard",
    "Ordenes",
    "Monitoreo",
    "Camiones",
    "Remolques",
    "Operadores",
    "Clientes",
    "Facturacion",
    "Cobranza"
];

function obtenerUsuarios() {
    return JSON.parse(localStorage.getItem(USERS_KEY) || "[]");
}

function guardarUsuarios(usuarios) {
    localStorage.setItem(USERS_KEY, JSON.stringify(usuarios));
}

export function prepararUsuarios() {
    const usuarios = obtenerUsuarios();

    if (!usuarios.some(u => u.role === "admin")) {
        usuarios.push({
            id: Date.now(),
            name: "Administrador",
            username: "admin",
            password: "Admin123!",
            role: "admin",
            permissions: [...PAGINAS]
        });

        guardarUsuarios(usuarios);
    }
}

export function iniciarSesion(username, password) {
    const usuario = obtenerUsuarios().find(u =>
        u.username.toLowerCase() === username.trim().toLowerCase() &&
        u.password === password
    );

    if (!usuario) {
        return {
            ok: false,
            message: "Usuario o contraseña incorrectos"
        };
    }

    const sesion = {
        id: usuario.id,
        name: usuario.name,
        username: usuario.username,
        role: usuario.role,
        permissions: usuario.permissions
    };

    sessionStorage.setItem(
        SESSION_KEY,
        JSON.stringify(sesion)
    );

    return { ok: true, session: sesion };
}

export function obtenerSesion() {
    return JSON.parse(
        sessionStorage.getItem(SESSION_KEY) || "null"
    );
}

export function cerrarSesion() {
    sessionStorage.removeItem(SESSION_KEY);
}

export function tienePermiso(pagina) {
    const usuario = obtenerSesion();

    if (!usuario) return false;

    return usuario.role === "admin" ||
        usuario.permissions.includes(pagina);
}

export function listarUsuarios() {
    return obtenerUsuarios().map(({ password, ...u }) => u);
}


export function crearUsuario(datos) {

    const usuarios = obtenerUsuarios();

    if (usuarios.some(u =>
        u.username.toLowerCase() === datos.username.trim().toLowerCase()
    )) {

        return {
            ok: false,
            message: "El usuario ya existe."
        };

    }

    usuarios.push({

        id: Date.now(),

        name: datos.name.trim(),

        username: datos.username.trim(),

        password: datos.password,

        // NUEVO: TIPO DE USUARIO
        tipo: datos.tipo.trim(),

        role: "user",

        // PERMISOS ASIGNADOS
        permissions: datos.permissions

    });

    guardarUsuarios(usuarios);

    return {
        ok: true
    };

}


export function actualizarUsuario(id, datos) {

    const usuarios = obtenerUsuarios();

    const indice = usuarios.findIndex(
        u => String(u.id) === String(id)
    );

    if (indice === -1) {
        return {
            ok: false,
            message: "Usuario no encontrado."
        };
    }

    const usuario = usuarios[indice];

    if (usuario.role === "admin") {
        return {
            ok: false,
            message: "No puedes modificar esta cuenta."
        };
    }

    const username = datos.username.trim();

    const repetido = usuarios.some(u =>
        u.id !== usuario.id &&
        u.username.toLowerCase() === username.toLowerCase()
    );

    if (repetido) {
        return {
            ok: false,
            message: "Ese nombre de usuario ya existe."
        };
    }

    usuario.name = datos.name.trim();
    usuario.username = username;
    usuario.tipo = datos.tipo.trim();
    usuario.permissions = datos.permissions;

    if (datos.password && datos.password.trim() !== "") {
        usuario.password = datos.password;
    }

    guardarUsuarios(usuarios);

    return { ok: true };
}
