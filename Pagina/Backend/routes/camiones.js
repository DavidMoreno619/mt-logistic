const express = require("express");
const router = express.Router();
const pool = require("../db");

function validarCamion(datos) {
    const obligatorios = [
        "numero_camion",
        "placas",
        "marca",
        "modelo"
    ];

    for (const campo of obligatorios) {
        if (
            datos[campo] === undefined ||
            datos[campo] === null ||
            String(datos[campo]).trim() === ""
        ) {
            return `El campo ${campo} es obligatorio.`;
        }
    }

    if (
        datos.anio_unidad !== undefined &&
        datos.anio_unidad !== null &&
        datos.anio_unidad !== ""
    ) {
        const anio = Number(datos.anio_unidad);
        const anioActual = new Date().getFullYear();

        if (
            !Number.isInteger(anio) ||
            anio < 1900 ||
            anio > anioActual + 1
        ) {
            return "El año del camión no es válido.";
        }
    }

    return null;
}

function prepararDatos(datos) {
    return {
        numero_camion: String(datos.numero_camion).trim(),
        placas: String(datos.placas).trim().toUpperCase(),
        marca: String(datos.marca).trim(),
        modelo: String(datos.modelo).trim(),
        anio_unidad:
            datos.anio_unidad === "" ||
            datos.anio_unidad === undefined ||
            datos.anio_unidad === null
                ? null
                : Number(datos.anio_unidad),
        wialon_id:
            datos.wialon_id && String(datos.wialon_id).trim()
                ? String(datos.wialon_id).trim()
                : null
    };
}

function responderError(res, error) {
    if (error.code === "ER_DUP_ENTRY") {
        return res.status(409).json({
            error: "El número de unidad, las placas o el ID de Wialon ya están registrados."
        });
    }

    console.error("Error en API de camiones:", error.message);

    return res.status(500).json({
        error: "Ocurrió un error al procesar el camión."
    });
}

// GET /api/camiones: lista camiones no archivados.
router.get("/", async (req, res) => {
    try {
        const [camiones] = await pool.execute(`
            SELECT
                id_camion,
                numero_camion,
                placas,
                marca,
                modelo,
                anio_unidad,
                wialon_id
            FROM camiones
            WHERE eliminado_en IS NULL
            ORDER BY id_camion DESC
        `);

        res.json(camiones);
    } catch (error) {
        responderError(res, error);
    }
});

// GET /api/camiones/:id: consulta un camión no archivado.
router.get("/:id", async (req, res) => {
    const id = Number(req.params.id);

    if (!Number.isInteger(id) || id <= 0) {
        return res.status(400).json({
            error: "El ID del camión no es válido."
        });
    }

    try {
        const [camiones] = await pool.execute(
            `SELECT
                id_camion,
                numero_camion,
                placas,
                marca,
                modelo,
                anio_unidad,
                wialon_id
             FROM camiones
             WHERE id_camion = ?
               AND eliminado_en IS NULL`,
            [id]
        );

        if (camiones.length === 0) {
            return res.status(404).json({
                error: "Camión no encontrado."
            });
        }

        res.json(camiones[0]);
    } catch (error) {
        responderError(res, error);
    }
});

// POST /api/camiones: registra un camión.
router.post("/", async (req, res) => {
    const errorValidacion = validarCamion(req.body);

    if (errorValidacion) {
        return res.status(400).json({ error: errorValidacion });
    }

    const datos = prepararDatos(req.body);

    try {
        const [resultado] = await pool.execute(
            `INSERT INTO camiones (
                numero_camion,
                placas,
                marca,
                modelo,
                anio_unidad,
                wialon_id
            ) VALUES (?, ?, ?, ?, ?, ?)`,
            [
                datos.numero_camion,
                datos.placas,
                datos.marca,
                datos.modelo,
                datos.anio_unidad,
                datos.wialon_id
            ]
        );

        res.status(201).json({
            mensaje: "Camión registrado correctamente.",
            id_camion: resultado.insertId
        });
    } catch (error) {
        responderError(res, error);
    }
});

// PUT /api/camiones/:id: actualiza un camión.
router.put("/:id", async (req, res) => {
    const id = Number(req.params.id);

    if (!Number.isInteger(id) || id <= 0) {
        return res.status(400).json({
            error: "El ID del camión no es válido."
        });
    }

    const errorValidacion = validarCamion(req.body);

    if (errorValidacion) {
        return res.status(400).json({ error: errorValidacion });
    }

    const datos = prepararDatos(req.body);

    try {
        const [resultado] = await pool.execute(
            `UPDATE camiones
             SET numero_camion = ?,
                 placas = ?,
                 marca = ?,
                 modelo = ?,
                 anio_unidad = ?,
                 wialon_id = ?
             WHERE id_camion = ?
               AND eliminado_en IS NULL`,
            [
                datos.numero_camion,
                datos.placas,
                datos.marca,
                datos.modelo,
                datos.anio_unidad,
                datos.wialon_id,
                id
            ]
        );

        if (resultado.affectedRows === 0) {
            const [existentes] = await pool.execute(
                `SELECT id_camion
                 FROM camiones
                 WHERE id_camion = ?
                   AND eliminado_en IS NULL`,
                [id]
            );

            if (existentes.length === 0) {
                return res.status(404).json({
                    error: "Camión no encontrado."
                });
            }
        }

        res.json({ mensaje: "Camión actualizado correctamente." });
    } catch (error) {
        responderError(res, error);
    }
});

// DELETE /api/camiones/:id: baja lógica mediante eliminado_en.
router.delete("/:id", async (req, res) => {
    const id = Number(req.params.id);

    if (!Number.isInteger(id) || id <= 0) {
        return res.status(400).json({
            error: "El identificador del camión no es válido."
        });
    }

    try {
        const [camiones] = await pool.execute(
            `SELECT id_camion, numero_camion
             FROM camiones
             WHERE id_camion = ?
               AND eliminado_en IS NULL`,
            [id]
        );

        if (camiones.length === 0) {
            return res.status(404).json({
                error: "El camión no existe o ya está archivado."
            });
        }

        const [ordenesActivas] = await pool.execute(
            `SELECT id_orden
             FROM ordenes
             WHERE id_camion = ?
               AND eliminado_en IS NULL
               AND estado IN ('Pendiente', 'En curso')
             LIMIT 1`,
            [id]
        );

        if (ordenesActivas.length > 0) {
            return res.status(409).json({
                error: "No se puede archivar esta unidad porque tiene órdenes pendientes o en curso."
            });
        }

        const [resultado] = await pool.execute(
            `UPDATE camiones
             SET eliminado_en = CURRENT_TIMESTAMP
             WHERE id_camion = ?
               AND eliminado_en IS NULL`,
            [id]
        );

        if (resultado.affectedRows === 0) {
            return res.status(409).json({
                error: "No fue posible archivar el camión."
            });
        }

        return res.json({
            mensaje: "Camión archivado correctamente.",
            id_camion: id
        });
    } catch (error) {
        console.error("Error al archivar camión:", error.message);

        return res.status(500).json({
            error: "Ocurrió un error al archivar el camión."
        });
    }
});

module.exports = router;
