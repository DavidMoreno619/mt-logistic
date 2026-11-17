const express = require("express");
const router = express.Router();
const pool = require("../db");

const ESTADOS = ["Disponible", "En ruta", "Inactivo"];

function validarId(valor) {
    const id = Number(valor);
    return Number.isInteger(id) && id > 0 ? id : null;
}

function validarDatos(datos) {
    if (
        !datos.nombre_completo?.trim() ||
        !datos.telefono?.trim() ||
        !datos.numero_licencia?.trim()
    ) {
        return "Nombre, teléfono y licencia son obligatorios.";
    }

    if (!ESTADOS.includes(datos.estado || "Disponible")) {
        return "El estado del operador no es válido.";
    }

    return null;
}

// GET: listar operadores activos
router.get("/", async (req, res) => {
    try {
        const [filas] = await pool.execute(`
            SELECT
                o.id_operador,
                o.nombre AS nombre_completo,
                o.telefono,
                o.correo,
                o.numero_licencia,
                o.id_camion,
                o.estado,
                c.numero_camion
            FROM operadores o
            LEFT JOIN camiones c
                ON c.id_camion = o.id_camion
            WHERE o.eliminado_en IS NULL
            ORDER BY o.nombre
        `);

        res.json(filas);
    } catch (error) {
        console.error("Error al consultar operadores:", error.message);
        res.status(500).json({ error: "No fue posible consultar los operadores." });
    }
});

// GET: consultar un operador
router.get("/:id", async (req, res) => {
    const id = validarId(req.params.id);

    if (!id) {
        return res.status(400).json({ error: "ID de operador no válido." });
    }

    try {
        const [filas] = await pool.execute(`
            SELECT
                o.id_operador,
                o.nombre AS nombre_completo,
                o.telefono,
                o.correo,
                o.numero_licencia,
                o.id_camion,
                o.estado,
                c.numero_camion
            FROM operadores o
            LEFT JOIN camiones c
                ON c.id_camion = o.id_camion
            WHERE o.id_operador = ?
              AND o.eliminado_en IS NULL
        `, [id]);

        if (!filas.length) {
            return res.status(404).json({ error: "Operador no encontrado." });
        }

        res.json(filas[0]);
    } catch (error) {
        console.error("Error al consultar operador:", error.message);
        res.status(500).json({ error: "No fue posible consultar el operador." });
    }
});

// POST: registrar operador
router.post("/", async (req, res) => {
    const datos = req.body;
    const errorValidacion = validarDatos(datos);

    if (errorValidacion) {
        return res.status(400).json({ error: errorValidacion });
    }

    try {
        const idCamion = datos.id_camion || null;

        if (idCamion) {
            const [camiones] = await pool.execute(`
                SELECT id_camion
                FROM camiones
                WHERE id_camion = ?
                  AND eliminado_en IS NULL
                  AND estado <> 'Inactivo'
            `, [idCamion]);

            if (!camiones.length) {
                return res.status(400).json({
                    error: "El camión seleccionado no existe o está archivado."
                });
            }

            const [asignados] = await pool.execute(`
                SELECT id_operador
                FROM operadores
                WHERE id_camion = ?
                  AND eliminado_en IS NULL
                LIMIT 1
            `, [idCamion]);

            if (asignados.length) {
                return res.status(409).json({
                    error: "Ese camión ya está asignado a otro operador."
                });
            }
        }

        const [resultado] = await pool.execute(`
            INSERT INTO operadores
                (nombre, telefono, correo, numero_licencia, id_camion, estado)
            VALUES (?, ?, ?, ?, ?, ?)
        `, [
            datos.nombre_completo.trim(),
            datos.telefono.trim(),
            datos.correo?.trim() || null,
            datos.numero_licencia.trim(),
            idCamion,
            datos.estado || "Disponible"
        ]);

        res.status(201).json({
            mensaje: "Operador registrado correctamente.",
            id_operador: resultado.insertId
        });
    } catch (error) {
        console.error("Error al registrar operador:", error.message);

        if (error.code === "ER_DUP_ENTRY") {
            return res.status(409).json({
                error: "Ya existe un operador con alguno de esos datos únicos."
            });
        }

        res.status(500).json({ error: "No fue posible registrar el operador." });
    }
});

// PUT: actualizar operador
router.put("/:id", async (req, res) => {
    const id = validarId(req.params.id);
    const datos = req.body;
    const errorValidacion = validarDatos(datos);

    if (!id) {
        return res.status(400).json({ error: "ID de operador no válido." });
    }

    if (errorValidacion) {
        return res.status(400).json({ error: errorValidacion });
    }

    try {
        const [actual] = await pool.execute(`
            SELECT id_operador
            FROM operadores
            WHERE id_operador = ?
              AND eliminado_en IS NULL
        `, [id]);

        if (!actual.length) {
            return res.status(404).json({ error: "Operador no encontrado." });
        }

        const idCamion = datos.id_camion || null;

        if (idCamion) {
            const [camiones] = await pool.execute(`
                SELECT id_camion
                FROM camiones
                WHERE id_camion = ?
                  AND eliminado_en IS NULL
                  AND estado <> 'Inactivo'
            `, [idCamion]);

            if (!camiones.length) {
                return res.status(400).json({
                    error: "El camión seleccionado no existe o está archivado."
                });
            }

            const [asignados] = await pool.execute(`
                SELECT id_operador
                FROM operadores
                WHERE id_camion = ?
                  AND id_operador <> ?
                  AND eliminado_en IS NULL
                LIMIT 1
            `, [idCamion, id]);

            if (asignados.length) {
                return res.status(409).json({
                    error: "Ese camión ya está asignado a otro operador."
                });
            }
        }

        await pool.execute(`
            UPDATE operadores
            SET nombre = ?,
                telefono = ?,
                correo = ?,
                numero_licencia = ?,
                id_camion = ?,
                estado = ?
            WHERE id_operador = ?
              AND eliminado_en IS NULL
        `, [
            datos.nombre_completo.trim(),
            datos.telefono.trim(),
            datos.correo?.trim() || null,
            datos.numero_licencia.trim(),
            idCamion,
            datos.estado || "Disponible",
            id
        ]);

        res.json({ mensaje: "Operador actualizado correctamente." });
    } catch (error) {
        console.error("Error al actualizar operador:", error.message);

        if (error.code === "ER_DUP_ENTRY") {
            return res.status(409).json({
                error: "Ya existe un operador con alguno de esos datos únicos."
            });
        }

        res.status(500).json({ error: "No fue posible actualizar el operador." });
    }
});

// DELETE: baja lógica del operador
router.delete("/:id", async (req, res) => {
    const id = validarId(req.params.id);

    if (!id) {
        return res.status(400).json({ error: "ID de operador no válido." });
    }

    try {
        const [operadores] = await pool.execute(`
            SELECT id_operador, nombre
            FROM operadores
            WHERE id_operador = ?
              AND eliminado_en IS NULL
        `, [id]);

        if (!operadores.length) {
            return res.status(404).json({ error: "Operador no encontrado o archivado." });
        }

        const [ordenes] = await pool.execute(`
            SELECT id_orden
            FROM ordenes
            WHERE id_operador = ?
              AND eliminado_en IS NULL
              AND estado IN ('Pendiente', 'En curso')
            LIMIT 1
        `, [id]);

        if (ordenes.length) {
            return res.status(409).json({
                error: "No se puede archivar al operador porque tiene órdenes pendientes o en curso."
            });
        }

        await pool.execute(`
            UPDATE operadores
            SET eliminado_en = CURRENT_TIMESTAMP,
                estado = 'Inactivo',
                id_camion = NULL
            WHERE id_operador = ?
              AND eliminado_en IS NULL
        `, [id]);

        res.json({ mensaje: "Operador archivado correctamente." });
    } catch (error) {
        console.error("Error al archivar operador:", error.message);
        res.status(500).json({ error: "No fue posible archivar el operador." });
    }
});

module.exports = router;