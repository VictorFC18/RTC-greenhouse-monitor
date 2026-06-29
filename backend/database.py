import sqlite3

from config import DATABASE_NAME


# =====================================
# CREAR BASE DE DATOS
# =====================================

def crear_base_datos():

    conexion = sqlite3.connect(DATABASE_NAME)

    cursor = conexion.cursor()

    cursor.execute("""
        CREATE TABLE IF NOT EXISTS mediciones (

            id INTEGER PRIMARY KEY AUTOINCREMENT,

            timestamp DATETIME DEFAULT (datetime('now', 'localtime')),

            temperatura REAL,

            humedad_aire REAL,

            humedad_suelo INTEGER,

            ph REAL

        )
    """)

    conexion.commit()

    conexion.close()


# =====================================
# GUARDAR MEDICIÓN
# =====================================

def guardar_medicion(temperatura, humedad_aire, humedad_suelo, ph):

    conexion = sqlite3.connect(DATABASE_NAME)

    cursor = conexion.cursor()

    cursor.execute("""
        INSERT INTO mediciones
        (temperatura, humedad_aire, humedad_suelo, ph)

        VALUES (?, ?, ?, ?)
    """, (temperatura, humedad_aire, humedad_suelo, ph))

    conexion.commit()

    conexion.close()


# =====================================
# OBTENER ÚLTIMAS MEDICIONES
# =====================================

def obtener_ultimas_mediciones(limite=5):

    conexion = sqlite3.connect(DATABASE_NAME)

    conexion.row_factory = sqlite3.Row

    cursor = conexion.cursor()

    cursor.execute("""
        SELECT *
        FROM mediciones
        ORDER BY id DESC
        LIMIT ?
    """, (limite,))

    registros = cursor.fetchall()

    conexion.close()

    return [dict(fila) for fila in registros]

def obtener_ultima_medicion():

    registros = obtener_ultimas_mediciones(1)

    if registros:
        return registros[0]

    return None
