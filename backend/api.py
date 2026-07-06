from fastapi import FastAPI

from database import (
    obtener_ultimas_mediciones,
    obtener_historial_paginado,
    obtener_registros_exportacion
)

from datetime import datetime

from fastapi.staticfiles import StaticFiles

from pathlib import Path

import system_state

from typing import Optional

import csv

import io

from fastapi.responses import (
    FileResponse,
    StreamingResponse
)

app = FastAPI()


BASE_DIR = Path(__file__).resolve().parent.parent

FRONTEND_DIR = BASE_DIR / "frontend" / "src"


# =====================================
# ARCHIVOS ESTÁTICOS
# =====================================

app.mount(
    "/css",
    StaticFiles(directory=FRONTEND_DIR / "css"),
    name="css"
)

app.mount(
    "/js",
    StaticFiles(directory=FRONTEND_DIR / "js"),
    name="js"
)

app.mount(
    "/img",
    StaticFiles(directory=FRONTEND_DIR / "img"),
    name="img"
)

app.mount(
    "/icons",
    StaticFiles(directory=FRONTEND_DIR / "icons"),
    name="icons"
)


# =====================================
# PÁGINAS
# =====================================

@app.get("/")
def inicio():

    return FileResponse(
        FRONTEND_DIR / "index.html"
    )


@app.get("/historial")
def pagina_historial():

    return FileResponse(
        FRONTEND_DIR / "historial.html"
    )


# =====================================
# API - MEDICIONES
# =====================================

@app.get("/api/mediciones")
def mediciones():

    registros = obtener_ultimas_mediciones(10)

    return registros


@app.get("/api/historial")
def historial():

    registros = obtener_ultimas_mediciones(60)

    return registros


# =====================================
# API - ESTADO DEL SISTEMA
# =====================================

@app.get("/api/estado")
def estado():

    if system_state.ultima_medicion is None:

        segundos = None

        esp32 = False

    else:

        diferencia = (
            datetime.now()
            - system_state.ultima_medicion
        )

        segundos = round(
            diferencia.total_seconds(),
            1
        )

        esp32 = segundos < 5


    uptime = (
        datetime.now()
        - system_state.inicio_programa
    )


    return {

        "mqtt":
            system_state.mqtt_conectado,

        "esp32":
            esp32,

        "database":
            True,

        "api":
            True,

        "uptime_segundos":
            int(uptime.total_seconds()),

        "ultima_medicion": (

            system_state
            .ultima_medicion
            .strftime("%Y-%m-%d %H:%M:%S")

            if system_state.ultima_medicion

            else None

        ),

        "segundos_desde_ultima":
            segundos

    }
    
# =====================================
# API - HISTORIAL PAGINADO
# =====================================

@app.get("/api/registros")
def registros(
    pagina: int = 1,
    limite: int = 20,
    desde: Optional[str] = None,
    hasta: Optional[str] = None
):

    offset = (
        pagina - 1
    ) * limite


    resultado = obtener_historial_paginado(

        limite=limite,

        offset=offset,

        fecha_desde=desde,

        fecha_hasta=hasta

    )


    return resultado

# =====================================
# API - EXPORTAR CSV
# =====================================

@app.get("/api/exportar-csv")
def exportar_csv(
    desde: Optional[str] = None,
    hasta: Optional[str] = None
):

    registros = obtener_registros_exportacion(
        fecha_desde=desde,
        fecha_hasta=hasta
    )


    salida = io.StringIO()


    escritor = csv.writer(salida)


    escritor.writerow([

        "id",

        "timestamp",

        "temperatura_C",

        "humedad_aire_pct",

        "humedad_suelo_pct",

        "ph",

        "tds_ppm"

    ])


    for registro in registros:

        escritor.writerow([

            registro["id"],

            registro["timestamp"],

            registro["temperatura"],

            registro["humedad_aire"],

            registro["humedad_suelo"],

            registro["ph"],

            registro["tds"]

        ])


    salida.seek(0)


    nombre_archivo = (
        "historial_invernadero.csv"
    )


    return StreamingResponse(

        iter([salida.getvalue()]),

        media_type="text/csv",

        headers={

            "Content-Disposition":
                f'attachment; filename="{nombre_archivo}"'

        }

    )
