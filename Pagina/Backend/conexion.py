
import mysql.connector

def obtener_conexion():
    conexion = mysql.connector.connect(
        host="localhost",
        user="David",
        password="admin",
        database="mt_logistica"
    )

    return conexion

