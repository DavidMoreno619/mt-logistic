
const express = require("express");
const router = express.Router();
const pool = require("../db");

const ESTADOS = ["Activo", "Inactivo"];

function validarId(valor) {
    const id = Number(valor);
    return Number.isInteger(id) && id > 0 ? id : null;
}

function limpiar(valor) {
    return typeof valor === "string" ? valor.trim() : "";
}

function validarDatos(datos) {
    if (!limpiar(datos.nombre_completo)) {
        return "El nombre del operador es obligatorio.";
    }

    if (!limpiar(datos.numero_licencia)) {
        return "El número de licencia es obligatorio.";
    }

    const estado = datos.estado || "Activo";

    if (!ESTADOS.includes(estado)) {
        return "El estado debe ser Activo o Inactivo.";
    }

    return null;
}

// GET: listar operadores
router.get("/", async (req, res) => {
    try {
        const [filas] = await pool.execute(`
            SELECT
                ID_OPERADOR AS id_operador,
                NOMBRE AS nombre_completo,
                TELEFONO AS telefono,
                LICENCIA AS numero_licencia,
                VIGENCIA_LICENCIA AS vigencia_licencia,
                ESTATUS_OPERADOR AS estado,
                NUMERO_SEGURO_SOCIAL AS numero_seguro_social,
                \`N°_INE\` AS numero_ine
            FROM operadores
            WHERE eliminado_en IS NULL
            ORDER BY NOMBRE
        `);

        res.json(filas);

    } catch (error) {
        console.error("Error al consultar operadores:", error.message);

        res.status(500).json({
            error: "No fue posible consultar los operadores."
        });
    }
});

// GET: consultar operador por ID
router.get("/:id", async (req, res) => {
    const id = validarId(req.params.id);

    if (!id) {
        return res.status(400).json({
            error: "ID de operador no válido."
        });
    }

    try {
        const [filas] = await pool.execute(`
            SELECT
                ID_OPERADOR AS id_operador,
                NOMBRE AS nombre_completo,
                TELEFONO AS telefono,
                LICENCIA AS numero_licencia,
                VIGENCIA_LICENCIA AS vigencia_licencia,
                ESTATUS_OPERADOR AS estado,
                NUMERO_SEGURO_SOCIAL AS numero_seguro_social,
                \`N°_INE\` AS numero_ine
            FROM operadores
            WHERE ID_OPERADOR = ?
              AND eliminado_en IS NULL
        `, [id]);

        if (!filas.length) {
            return res.status(404).json({
                error: "Operador no encontrado."
            });
        }

        res.json(filas[0]);

    } catch (error) {
        console.error("Error al consultar operador:", error.message);

        res.status(500).json({
            error: "No fue posible consultar el operador."
        });
    }
});

// POST: registrar operador
router.post("/", async (req, res) => {
    const datos = req.body || {};
    const errorValidacion = validarDatos(datos);

    if (errorValidacion) {
        return res.status(400).json({
            error: errorValidacion
        });
    }

    try {
        const nombre = limpiar(datos.nombre_completo);
        const telefono = limpiar(datos.telefono) || null;
        const licencia = limpiar(datos.numero_licencia);
        const vigencia = datos.vigencia_licencia || null;
        const nss = limpiar(datos.numero_seguro_social) || null;
        const ine = limpiar(datos.numero_ine || datos.n_ine) || null;
        const estado = datos.estado || "Activo";

        const [resultado] = await pool.execute(`
            INSERT INTO operadores (
                NOMBRE,
                TELEFONO,
                LICENCIA,
                VIGENCIA_LICENCIA,
                ESTATUS_OPERADOR,
                NUMERO_SEGURO_SOCIAL,
                \`N°_INE\`
            )
            VALUES (?, ?, ?, ?, ?, ?, ?)
        `, [
            nombre,
            telefono,
            licencia,
            vigencia,
            estado,
            nss,
            ine
        ]);

        res.status(201).json({
            mensaje: "Operador registrado correctamente.",
            id_operador: resultado.insertId
        });

    } catch (error) {
        console.error("Error al registrar operador:", error.message);

        if (error.code === "ER_DUP_ENTRY") {
            return res.status(409).json({
                error: "La licencia o el NSS ya están registrados."
            });
        }

        res.status(500).json({
            error: "No fue posible registrar el operador."
        });
    }
});

// PUT: actualizar operador
router.put("/:id", async (req, res) => {
    const id = validarId(req.params.id);
    const datos = req.body || {};
    const errorValidacion = validarDatos(datos);

    if (!id) {
        return res.status(400).json({
            error: "ID de operador no válido."
        });
    }

    if (errorValidacion) {
        return res.status(400).json({
            error: errorValidacion
        });
    }

    try {
        const [actual] = await pool.execute(`
            SELECT ID_OPERADOR
            FROM operadores
            WHERE ID_OPERADOR = ?
              AND eliminado_en IS NULL
        `, [id]);

        if (!actual.length) {
            return res.status(404).json({
                error: "Operador no encontrado."
            });
        }

        const nombre = limpiar(datos.nombre_completo);
        const telefono = limpiar(datos.telefono) || null;
        const licencia = limpiar(datos.numero_licencia);
        const vigencia = datos.vigencia_licencia || null;
        const nss = limpiar(datos.numero_seguro_social) || null;
        const ine = limpiar(datos.numero_ine || datos.n_ine) || null;
        const estado = datos.estado || "Activo";

        await pool.execute(`
            UPDATE operadores
            SET
                NOMBRE = ?,
                TELEFONO = ?,
                LICENCIA = ?,
                VIGENCIA_LICENCIA = ?,
                ESTATUS_OPERADOR = ?,
                NUMERO_SEGURO_SOCIAL = ?,
                \`N°_INE\` = ?
            WHERE ID_OPERADOR = ?
              AND eliminado_en IS NULL
        `, [
            nombre,
            telefono,
            licencia,
            vigencia,
            estado,
            nss,
            ine,
            id
        ]);

        res.json({
            mensaje: "Operador actualizado correctamente."
        });

    } catch (error) {
        console.error("Error al actualizar operador:", error.message);

        if (error.code === "ER_DUP_ENTRY") {
            return res.status(409).json({
                error: "La licencia o el NSS ya están registrados."
            });
        }

        res.status(500).json({
            error: "No fue posible actualizar el operador."
        });
    }
});

// DELETE: baja lógica del operador
router.delete("/:id", async (req, res) => {
    const id = validarId(req.params.id);

    if (!id) {
        return res.status(400).json({
            error: "ID de operador no válido."
        });
    }

    try {
        const [resultado] = await pool.execute(`
            UPDATE operadores
            SET
                eliminado_en = CURRENT_TIMESTAMP,
                ESTATUS_OPERADOR = 'Inactivo'
            WHERE ID_OPERADOR = ?
              AND eliminado_en IS NULL
        `, [id]);

        if (resultado.affectedRows === 0) {
            return res.status(404).json({
                error: "Operador no encontrado o ya dado de baja."
            });
        }

        res.json({
            mensaje: "Operador dado de baja correctamente."
        });

    } catch (error) {
        console.error("Error al dar de baja al operador:", error.message);

        res.status(500).json({
            error: "No fue posible dar de baja al operador."
        });
    }
});

module.exports = router;
