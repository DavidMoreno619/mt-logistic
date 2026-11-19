require("dotenv").config();

const express = require("express");
const cors = require("cors");
const pool = require("./db");

const app = express();

const rutasCamiones = require("./routes/camiones");
const rutasOperadores = require("./routes/operadores");

app.use(cors({
    origin: process.env.FRONTEND_ORIGIN || "http://127.0.0.1:5500"
}));

app.use(express.json({ limit: "1mb" }));

// Ruta inicial
app.get("/api", (req, res) => {
    res.json({
        sistema: "MT Logística Especializada",
        mensaje: "API disponible",
        version: "1.0.0"
    });
});

// Comprobar conexión con MySQL
app.get("/api/health", async (req, res) => {
    try {
        const [rows] = await pool.query(
            "SELECT 1 AS conexion"
        );

        res.json({
            servidor: "funcionando",
            mysql: rows[0].conexion === 1 ? "conectado" : "error"
        });
    } catch (error) {
        console.error("Error de conexión con MySQL:", error.message);

        res.status(503).json({
            servidor: "funcionando",
            mysql: "no disponible"
        });
    }
});

app.use("/api/camiones", rutasCamiones);
app.use("/api/operadores", rutasOperadores);

// Ruta para errores de endpoints inexistentes
app.use((req, res) => {
    res.status(404).json({
        error: "Ruta no encontrada"
    });
});

const PORT = Number(process.env.PORT || 3000);

app.listen(PORT, () => {
    console.log(`Backend MT disponible en http://localhost:${PORT}`);
});