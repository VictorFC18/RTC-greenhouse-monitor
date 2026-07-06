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

            ph REAL,

            tds REAL

        )
    """)

    cursor.execute("""
        PRAGMA table_info(mediciones)
    """)

    columnas = [
        columna[1]
        for columna in cursor.fetchall()
    ]

    if "tds" not in columnas:

        cursor.execute("""
            ALTER TABLE mediciones
            ADD COLUMN tds REAL
        """)

        print("Columna TDS agregada a la base de datos.")

    conexion.commit()

    conexion.close()
    
# =====================================
# GUARDAR MEDICIÓN
# =====================================

def guardar_medicion(
    temperatura,
    humedad_aire,
    humedad_suelo,
    ph,
    tds
):

    conexion = sqlite3.connect(DATABASE_NAME)

    cursor = conexion.cursor()

    cursor.execute("""
        INSERT INTO mediciones
        (
            temperatura,
            humedad_aire,
            humedad_suelo,
            ph,
            tds
        )

        VALUES (?, ?, ?, ?, ?)
    """, (
        temperatura,
        humedad_aire,
        humedad_suelo,
        ph,
        tds
    ))

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

    registros = []

    for fila in cursor.fetchall():

        registro = dict(fila)

        # Convertir timestamp al formato ISO 8601
        if registro["timestamp"]:
            registro["timestamp"] = registro["timestamp"].replace(" ", "T")

        registros.append(registro)

    conexion.close()

    return registros


def obtener_ultima_medicion():

    registros = obtener_ultimas_mediciones(1)

    if registros:
        return registros[0]

    return None

# =====================================
# CONSULTAR HISTORIAL PAGINADO
# =====================================

def obtener_historial_paginado(
    limite=20,
    offset=0,
    fecha_desde=None,
    fecha_hasta=None
):

    conexion = sqlite3.connect(DATABASE_NAME)

    conexion.row_factory = sqlite3.Row

    cursor = conexion.cursor()


    condiciones = []

    parametros = []


    if fecha_desde:

        condiciones.append(
            "timestamp >= ?"
        )

        parametros.append(fecha_desde)


    if fecha_hasta:

        condiciones.append(
            "timestamp <= ?"
        )

        parametros.append(fecha_hasta)


    where_sql = ""

    if condiciones:

        where_sql = (
            "WHERE "
            + " AND ".join(condiciones)
        )


    cursor.execute(
        f"""
        SELECT *
        FROM mediciones

        {where_sql}

        ORDER BY id DESC

        LIMIT ?
        OFFSET ?
        """,

        parametros + [
            limite,
            offset
        ]
    )


    registros = []

    for fila in cursor.fetchall():

        registro = dict(fila)

        if registro["timestamp"]:

            registro["timestamp"] = (
                registro["timestamp"]
                .replace(" ", "T")
            )

        registros.append(registro)


    cursor.execute(
        f"""
        SELECT

            COUNT(*) AS total,

            AVG(temperatura) AS temperatura_promedio,

            AVG(humedad_aire) AS humedad_promedio,

            AVG(tds) AS tds_promedio

        FROM mediciones

        {where_sql}
        """,

        parametros
    )


    resumen = dict(
        cursor.fetchone()
    )


    conexion.close()


    return {

        "registros": registros,

        "total": resumen["total"],

        "resumen": {

            "temperatura_promedio":
                resumen["temperatura_promedio"],

            "humedad_promedio":
                resumen["humedad_promedio"],

            "tds_promedio":
                resumen["tds_promedio"]

        }

    }

# =====================================
# OBTENER REGISTROS PARA EXPORtACIÓN
# =====================================

def obtener_registros_exportacion(
    fecha_desde=None,
    fecha_hasta=None
):

    conexion = sqlite3.connect(DATABASE_NAME)

    conexion.row_factory = sqlite3.Row

    cursor = conexion.cursor()


    condiciones = []

    parametros = []


    if fecha_desde:

        condiciones.append(
            "timestamp >= ?"
        )

        parametros.append(fecha_desde)


    if fecha_hasta:

        condiciones.append(
            "timestamp <= ?"
        )

        parametros.append(fecha_hasta)


    where_sql = ""

    if condiciones:

        where_sql = (
            "WHERE "
            + " AND ".join(condiciones)
        )


    cursor.execute(
        f"""
        SELECT

            id,
            timestamp,
            temperatura,
            humedad_aire,
            humedad_suelo,
            ph,
            tds

        FROM mediciones

        {where_sql}

        ORDER BY id ASC
        """,

        parametros
    )


    registros = [

        dict(fila)

        for fila in cursor.fetchall()

    ]


    conexion.close()


    return registros
