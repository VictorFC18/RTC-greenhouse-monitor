import sqlite3

from config import DATABASE_NAME

def crear_base_datos():

    conexion = sqlite3.connect(DATABASE_NAME)

    cursor = conexion.cursor()

    cursor.execute("""
    CREATE TABLE IF NOT EXISTS mediciones (

        id INTEGER PRIMARY KEY AUTOINCREMENT,

        timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,

        temperatura REAL,

        humedad_aire REAL,

        humedad_suelo INTEGER,

        ph REAL

    )
    """)

    conexion.commit()

    conexion.close()

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
