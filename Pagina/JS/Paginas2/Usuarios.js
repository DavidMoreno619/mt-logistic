
import {
    crearUsuario,
    listarUsuarios,
    actualizarUsuario
} from "../Core/Auth.js";


export function inicializarUsuarios() {

    const formulario = document.getElementById("createUserForm");
    const lista = document.getElementById("usersList");
    const mensaje = document.getElementById("userFormMessage");

    const seleccionarTodos = document.getElementById(
        "selectAllPermissions"
    );

    const checkboxes = Array.from(
        formulario.querySelectorAll('input[name="permissions"]')
    );


    // SELECCIONAR TODOS LOS PERMISOS

    seleccionarTodos?.addEventListener("change", () => {
        checkboxes.forEach(c => c.checked = seleccionarTodos.checked);
    });

    checkboxes.forEach(c => {
        c.addEventListener("change", () => {
            seleccionarTodos.checked = checkboxes.every(x => x.checked);
        });
    });


    // MOSTRAR USUARIOS

    function mostrarUsuarios() {

        lista.innerHTML = "";

        listarUsuarios().forEach(usuario => {

            const elemento = document.createElement("div");
            elemento.className = "user-list-item";

            const informacion = document.createElement("div");
            informacion.className = "user-info";

            const nombre = document.createElement("strong");
            nombre.textContent = usuario.name;

            const cuenta = document.createElement("p");
            cuenta.textContent = "Usuario: " + usuario.username;

            const tipo = document.createElement("p");
            tipo.textContent = "Tipo: " + (usuario.tipo || "Sin especificar");

            const permisos = document.createElement("p");
            permisos.textContent = "Permisos: " +
                (usuario.role === "admin"
                    ? "Todos"
                    : (usuario.permissions || []).join(", "));

            informacion.append(nombre, cuenta, tipo, permisos);
            elemento.appendChild(informacion);


            if (usuario.role !== "admin") {

                const acciones = document.createElement("div");
                acciones.className = "user-actions";

                const editar = document.createElement("button");
                editar.type = "button";
                editar.textContent = "Editar";
                editar.className = "edit-user-button";

                editar.addEventListener("click", () => {
                    abrirEdicion(usuario);
                });

                const eliminar = document.createElement("button");
                eliminar.type = "button";
                eliminar.textContent = "Eliminar";
                eliminar.className = "delete-user-button";

                eliminar.addEventListener("click", () => {
                    eliminarUsuario(usuario);
                });

                acciones.append(editar, eliminar);
                elemento.appendChild(acciones);
            }

            lista.appendChild(elemento);

        });

    }


    // REGISTRAR USUARIO

    formulario.addEventListener("submit", e => {

        e.preventDefault();

        const datos = new FormData(formulario);

        const permisos = datos.getAll("permissions");

        if (!permisos.length) {
            mensaje.textContent = "Selecciona al menos un permiso.";
            return;
        }

        const resultado = crearUsuario({

            name: datos.get("name"),
            username: datos.get("username"),
            password: datos.get("password"),
            tipo: datos.get("tipo"),
            permissions: permisos

        });

        mensaje.textContent = resultado.ok
            ? "Usuario registrado correctamente."
            : resultado.message;

        if (resultado.ok) {
            formulario.reset();
            if (seleccionarTodos) seleccionarTodos.checked = false;
            mostrarUsuarios();
        }

    });


    // VENTANA DE EDICIÓN

    function abrirEdicion(usuario) {

        let modal = document.getElementById("editUserModal");

        if (!modal) {

            modal = document.createElement("div");
            modal.id = "editUserModal";
            modal.className = "order-modal";

            modal.innerHTML = `
                <div class="order-modal-content">

                    <div class="order-modal-header">
                        <h2>Editar usuario</h2>
                        <button type="button"
                            class="modal-close"
                            id="closeEditUser">×</button>
                    </div>

                    <div class="order-modal-body">

                        <form id="editUserForm">

                            <div class="modal-form-group">
                                <label>Nombre completo</label>
                                <input name="name" required>
                            </div>

                            <div class="modal-form-group">
                                <label>Nombre de usuario</label>
                                <input name="username" required>
                            </div>

                            <div class="modal-form-group">
                                <label>Tipo de usuario</label>
                                <input name="tipo" required>
                            </div>

                            <div class="modal-form-group">
                                <label>Nueva contraseña</label>
                                <input name="password"
                                    type="password"
                                    minlength="6"
                                    placeholder="Dejar vacío para conservarla">
                            </div>

                            <h3>Permisos de acceso</h3>

                            <div class="permissions-grid">

                                <label>
                                    <input type="checkbox"
                                        id="editSelectAll">
                                    Todos los permisos
                                </label>

                                ${[
                                    ["Dashboard", "Dashboard"],
                                    ["Ordenes", "Órdenes"],
                                    ["Monitoreo", "Monitoreo"],
                                    ["Camiones", "Unidades"],
                                    ["Remolques", "Remolques"],
                                    ["Operadores", "Operadores"],
                                    ["Clientes", "Clientes"],
                                    ["Facturacion", "Facturación"],
                                    ["Cobranza", "Cobranza"]
                                ].map(([value, label]) => `
                                    <label>
                                        <input type="checkbox"
                                            name="permissions"
                                            value="${value}">
                                        ${label}
                                    </label>
                                `).join("")}

                            </div>

                        </form>

                    </div>

                    <div class="order-modal-footer">

                        <button type="button"
                            class="modal-btn-secondary"
                            id="cancelEditUser">
                            Cancelar
                        </button>

                        <button type="button"
                            class="modal-btn-primary"
                            id="saveEditUser">
                            Guardar cambios
                        </button>

                    </div>

                </div>
            `;

            document.body.appendChild(modal);

            const cerrar = () => modal.classList.remove("active");

            modal.querySelector("#closeEditUser")
                .addEventListener("click", cerrar);

            modal.querySelector("#cancelEditUser")
                .addEventListener("click", cerrar);

            modal.addEventListener("click", e => {
                if (e.target === modal) cerrar();
            });

            const checks = Array.from(
                modal.querySelectorAll(
                    'input[name="permissions"]'
                )
            );

            modal.querySelector("#editSelectAll")
                .addEventListener("change", e => {
                    checks.forEach(c => c.checked = e.target.checked);
                });

            checks.forEach(c => {
                c.addEventListener("change", () => {
                    modal.querySelector("#editSelectAll").checked =
                        checks.every(x => x.checked);
                });
            });

            modal.querySelector("#saveEditUser")
                .addEventListener("click", guardarEdicion);
        }


        const form = modal.querySelector("#editUserForm");

        form.elements.name.value = usuario.name;
        form.elements.username.value = usuario.username;
        form.elements.tipo.value = usuario.tipo || "";
        form.elements.password.value = "";

        const permisos = usuario.permissions || [];

        modal.querySelectorAll(
            'input[name="permissions"]'
        ).forEach(check => {
            check.checked = permisos.includes(check.value);
        });

        modal.querySelector("#editSelectAll").checked =
            modal.querySelectorAll(
                'input[name="permissions"]:checked'
            ).length === 9;

        modal.dataset.userId = usuario.id;

        modal.classList.add("active");

    }


    // GUARDAR EDICIÓN

    function guardarEdicion() {

        const modal = document.getElementById("editUserModal");
        const form = modal.querySelector("#editUserForm");

        if (!form.reportValidity()) return;

        const datos = new FormData(form);

        const permisos = datos.getAll("permissions");

        if (!permisos.length) {
            mostrarMensajeModal("Selecciona al menos un permiso.");
            return;
        }

        const resultado = actualizarUsuario(
            modal.dataset.userId,
            {
                name: datos.get("name"),
                username: datos.get("username"),
                tipo: datos.get("tipo"),
                password: datos.get("password"),
                permissions: permisos
            }
        );

        if (!resultado.ok) {
            mostrarMensajeModal(resultado.message);
            return;
        }

        modal.classList.remove("active");

        mensaje.textContent = "Usuario actualizado correctamente.";

        mostrarUsuarios();

    }


    // AVISO DENTRO DEL MODAL

    function mostrarMensajeModal(texto) {

        let aviso = document.getElementById("editUserMessage");

        if (!aviso) {
            aviso = document.createElement("p");
            aviso.id = "editUserMessage";
            aviso.className = "form-error";

            document.querySelector("#editUserForm")
                .appendChild(aviso);
        }

        aviso.textContent = texto;

    }


    // ELIMINAR USUARIO

    function eliminarUsuario(usuario) {

        if (!confirm("¿Deseas eliminar este usuario?")) return;

        const usuarios = JSON.parse(
            localStorage.getItem("mtUsuarios") || "[]"
        );

        const actualizados = usuarios.filter(
            u => String(u.id) !== String(usuario.id)
        );

        localStorage.setItem(
            "mtUsuarios",
            JSON.stringify(actualizados)
        );

        mensaje.textContent = "Usuario eliminado correctamente.";

        mostrarUsuarios();

    }


    mostrarUsuarios();

}
