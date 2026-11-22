
from flask import Flask, jsonify, request
from flask_cors import CORS
from conexion import obtener_conexion

# =====================================================
# CONFIGURACIÓN DEL SERVIDOR
# =====================================================

app = Flask(__name__)
CORS(app)


# =====================================================
# RUTA PRINCIPAL
# =====================================================

@app.route("/")
def inicio():
    return jsonify({
        "mensaje": "Servidor MT Logística funcionando"
    })


# =====================================================
# PROBAR CONEXIÓN CON MYSQL
# =====================================================

@app.route("/api/probar-db")
def probar_db():

    conexion = None
    cursor = None

    try:
        conexion = obtener_conexion()
        cursor = conexion.cursor()

        cursor.execute("SELECT DATABASE()")
        resultado = cursor.fetchone()

        return jsonify({
            "estado": "Conectado",
            "base_datos": resultado[0]
        })

    except Exception as error:
        return jsonify({
            "estado": "Error",
            "mensaje": str(error)
        }), 500

    finally:
        if cursor:
            cursor.close()

        if conexion:
            conexion.close()


# =====================================================
# OBTENER CATÁLOGOS DESDE MYSQL
# =====================================================

@app.route("/api/catalogos", methods=["GET"])
def obtener_catalogos():

    conexion = None
    cursor = None

    try:
        conexion = obtener_conexion()
        cursor = conexion.cursor(dictionary=True)

        # CLIENTES
        cursor.execute("""
            SELECT ID_CLIENTE, NOMBRE, EMPRESA
            FROM clientes
        """)
        clientes = cursor.fetchall()

        # CAMIONES
        cursor.execute("""
            SELECT ID_CAMION, NUMERO_CAMION, PLACAS, ESTADO
            FROM camiones
        """)
        camiones = cursor.fetchall()

        # OPERADORES
        cursor.execute("""
            SELECT ID_OPERADOR, NOMBRE, ESTATUS_OPERADOR
            FROM operadores
        """)
        operadores = cursor.fetchall()

        # REMOLQUES