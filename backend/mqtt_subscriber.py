import json
import paho.mqtt.client as mqtt

from config import BROKER, PORT, TOPIC
from database import guardar_medicion, obtener_ultimas_mediciones


# =====================================
# CALLBACK DE CONEXIÓN
# =====================================

def on_connect(client, userdata, flags, reason_code, properties=None):

    if reason_code == 0:

        print("Conectado al broker MQTT")

        client.subscribe(TOPIC)

        print(f"Suscrito a: {TOPIC}")

    else:

        print(f"Error de conexión: {reason_code}")


# =====================================
# CALLBACK DE MENSAJES
# =====================================

def on_message(client, userdata, msg):

    try:

        mensaje = msg.payload.decode()

        datos = json.loads(mensaje)

        guardar_medicion(
            datos["temperatura"],
            datos["humedad"],
            datos["suelo"],
            datos["ph"]
        )

        registros = obtener_ultimas_mediciones()

        print("\n===== ÚLTIMAS MEDICIONES =====\n")

        print(
            f"{'ID':<4}"
            f"{'Timestamp':<20}"
            f"{'Temp (°C)':<12}"
            f"{'Hum. Aire':<12}"
            f"{'Hum. Suelo':<13}"
            f"{'pH':<8}"
        )

        print("-" * 75)

        for fila in registros:

            print(
                f"{fila[0]:<4}"
                f"{fila[1]:<20}"
                f"{fila[2]:<12.1f}"
                f"{fila[3]:<12.1f}"
                f"{fila[4]:<13}"
                f"{fila[5]:<8.2f}"
            )

        print()

    except Exception as e:

        print(f"Error: {e}")


# =====================================
# INICIAR MQTT
# =====================================

def iniciar_mqtt():

    client = mqtt.Client(mqtt.CallbackAPIVersion.VERSION2)

    client.on_connect = on_connect
    client.on_message = on_message

    print("Conectando al broker...")

    client.connect(BROKER, PORT)

    client.loop_forever()
