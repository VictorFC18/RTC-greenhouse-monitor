from fastapi import FastAPI
from database import obtener_ultimas_mediciones
from datetime import datetime
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles
from pathlib import Path

import system_state

app = FastAPI()

BASE_DIR = Path(__file__).resolve().parent.parent

FRONTEND_DIR = BASE_DIR / "frontend" / "src"

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

@app.get("/")
def inicio():

    return FileResponse(
        FRONTEND_DIR / "index.html"
    )

@app.get("/mediciones")
def mediciones():

    registros = obtener_ultimas_mediciones(10)

    return registros

@app.get("/historial")
def historial():

    registros = obtener_ultimas_mediciones(60)

    return registros

@app.get("/estado")
def estado():

    if system_state.ultima_medicion is None:

        segundos = None
        esp32 = False

    else:

        diferencia = datetime.now() - system_state.ultima_medicion

        segundos = round(diferencia.total_seconds(), 1)

        esp32 = segundos < 5

    uptime = datetime.now() - system_state.inicio_programa

    return {

        "mqtt": system_state.mqtt_conectado,

        "esp32": esp32,

        "database": True,

        "api": True,

        "uptime_segundos": int(uptime.total_seconds()),

        "ultima_medicion": (
            system_state.ultima_medicion.strftime("%Y-%m-%d %H:%M:%S")
            if system_state.ultima_medicion
            else None
        ),

        "segundos_desde_ultima": segundos

    }
