from flask import Flask, jsonify, request
from flask_cors import CORS
from Pagina.Backend.conexion import obtener_conexion

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

        # TIPOS DE SERVICIO
        cursor.execute("""
            SELECT ID_TIPO_SERVICIO, NOMBRE_SERVICIO
            FROM tipos_servicio
        """)
        servicios = cursor.fetchall()

        # TIPOS DE CARGA
        cursor.execute("""
            SELECT ID_TIPO_CARGA, NOMBRE_CARGA
            FROM tipos_carga
        """)
        cargas = cursor.fetchall()

        return jsonify({
            "clientes": clientes,
            "camiones": camiones,
            "operadores": operadores,
            "servicios": servicios,
            "cargas": cargas
        })

    except Exception as error:
        return jsonify({
            "error": str(error)
        }), 500

    finally:
        if cursor:
            cursor.close()

        if conexion:
            conexion.close()


# =====================================================
# INICIAR SERVIDOR
# =====================================================

# =====================================================
# REMOLQUES
# =====================================================

@app.route("/api/remolques/<int:id_remolque>", methods=["PUT"])
def actualizar_remolque(id_remolque):
    conexion = None
    cursor = None

    try:
        datos = request.get_json()

        numero = datos.get("numero_remolque", "").strip()
        placas = datos.get("placas", "").strip()
        marca = datos.get("marca", "").strip()
        modelo = datos.get("modelo", "").strip()
        anio = datos.get("anio") or None
        capacidad = datos.get("capacidad")

        estado = datos.get("estado", "Disponible")

        if not all([numero, placas, marca, capacidad]):
            return jsonify({"error": "Completa los campos obligatorios"}), 400

        conexion = obtener_conexion()
        cursor = conexion.cursor()

        sql = """
            UPDATE remolques
            SET NUMERO_REMOLQUE = %s,
                PLACAS = %s,
                MARCA = %s,
                MODELO = %s,
                AÑO_REMOLQUE = %s,
                CAPACIDAD = %s,
                ESTADO = %s
            WHERE ID_REMOLQUE = %s
        """

        valores = (
            numero,
            placas,
            marca,
            modelo or None,
            int(anio) if anio else None,
            float(capacidad),
            estado,
            id_remolque
        )

        cursor.execute(sql, valores)
        conexion.commit()

        if cursor.rowcount == 0:
            return jsonify({"error": "No se encontró el remolque"}), 404

        return jsonify({"mensaje": "Remolque actualizado correctamente"}), 200

    except Exception as error:
        if conexion:
            conexion.rollback()
        return jsonify({"error": str(error)}), 500

    finally:
        if cursor:
            cursor.close()
        if conexion:
            conexion.close()


@app.route("/api/remolques/<int:id_remolque>", methods=["DELETE"])
def eliminar_remolque(id_remolque):
    conexion = None
    cursor = None

    try:
        conexion = obtener_conexion()
        cursor = conexion.cursor()

        cursor.execute("""
            UPDATE remolques
            SET ESTADO = 'Inactivo'
            WHERE ID_REMOLQUE = %s
        """, (id_remolque,))

        conexion.commit()

        if cursor.rowcount == 0:
            return jsonify({"error": "No se encontró el remolque"}), 404

        return jsonify({"mensaje": "Remolque dado de baja correctamente"}), 200

    except Exception as error:
        if conexion:
            conexion.rollback()
        return jsonify({"error": str(error)}), 500

    finally:
        if cursor:
            cursor.close()
        if conexion:
            conexion.close()



@app.route("/api/remolques", methods=["GET"])
def obtener_remolques():
    conexion = None
    cursor = None

    try:
        conexion = obtener_conexion()
        cursor = conexion.cursor(dictionary=True)

        cursor.execute("""
            SELECT
                ID_REMOLQUE,
                NUMERO_REMOLQUE,
                PLACAS,
                MARCA,
                MODELO,
                AÑO_REMOLQUE,
                CAPACIDAD,
                ESTADO
            FROM remolques
            WHERE ESTADO <> 'Inactivo'
            ORDER BY ID_REMOLQUE DESC
        """)

        remolques = cursor.fetchall()
        return jsonify(remolques)

    except Exception as error:
        return jsonify({"error": str(error)}), 500

    finally:
        if cursor:
            cursor.close()
        if conexion:
            conexion.close()


@app.route("/api/remolques", methods=["POST"])
def registrar_remolque():
    conexion = None
    cursor = None

    try:
        datos = request.get_json()

        if not datos:
            return jsonify({"error": "No se recibieron datos"}), 400

        numero = datos.get("numero_remolque", "").strip()
        placas = datos.get("placas", "").strip()
        marca = datos.get("marca", "").strip()
        modelo = datos.get("modelo", "").strip()
        anio = datos.get("anio")
        capacidad = datos.get("capacidad")
        estado = datos.get("estado", "Disponible")

        if not all([numero, placas, marca, capacidad]):
         return jsonify({
         "error": "El número, las placas, la marca y la capacidad son obligatorios"
         }), 400

        conexion = obtener_conexion()
        cursor = conexion.cursor()

        sql = """
            INSERT INTO remolques
            (NUMERO_REMOLQUE, PLACAS, MARCA, MODELO,
             AÑO_REMOLQUE, CAPACIDAD, ESTADO)
            VALUES (%s, %s, %s, %s, %s, %s, %s)
        """

        valores = (
            numero, placas, marca, modelo,
            int(anio) if anio else None, float(capacidad), estado
        )

        cursor.execute(sql, valores)
        conexion.commit()

        return jsonify({
            "mensaje": "Remolque registrado correctamente",
            "id": cursor.lastrowid
        }), 201

    except Exception as error:
        if conexion:
            conexion.rollback()
        return jsonify({"error": str(error)}), 500

    finally:
        if cursor:
            cursor.close()
        if conexion:
            conexion.close()



if __name__ == "__main__":
    app.run(
        host="127.0.0.1",
        port=5000,
        debug=True
    )


