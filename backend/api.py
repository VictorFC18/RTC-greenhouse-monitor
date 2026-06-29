from fastapi import FastAPI
from database import obtener_ultimas_mediciones

app = FastAPI()


@app.get("/")
def inicio():

    return {
        "mensaje": "Sistema IoT funcionando correctamente"
    }


@app.get("/mediciones")
def mediciones():

    registros = obtener_ultimas_mediciones(10)

    return registros
