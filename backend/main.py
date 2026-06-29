from threading import Thread

import uvicorn

from database import crear_base_datos
from mqtt_subscriber import iniciar_mqtt


print("====================================")
print(" Sistema IoT - Invernadero")
print("====================================")

crear_base_datos()
print("Base de datos inicializada.")


# -----------------------------
# MQTT en segundo plano
# -----------------------------
mqtt_thread = Thread(
    target=iniciar_mqtt,
    daemon=True
)

mqtt_thread.start()

print("Servicio MQTT iniciado.")


# -----------------------------
# API REST + Frontend
# -----------------------------
print("Iniciando servidor web...")

uvicorn.run(
    "api:app",
    host="0.0.0.0",
    port=8000,
    reload=False
)
