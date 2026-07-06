import json
import paho.mqtt.client as mqtt
import system_state
from datetime import datetime

from config import BROKER, PORT, TOPIC
from database import guardar_medicion, obtener_ultimas_mediciones


# =====================================
# CALLBACK DE CONEXIÓN
# =====================================

def on_connect(client, userdata, flags, reason_code, properties=None):

    if reason_code == 0:

        print("Conectado al broker MQTT")

        system_state.mqtt_conectado = True
        
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

        system_state.ultima_medicion = datetime.now()
        
        guardar_medicion(
            datos["temperatura"],
            datos["humedad"],
            datos["suelo"],
            datos["ph"],
            datos["tds"]
        )

        registros = obtener_ultimas_mediciones()

        print("\n===== ÚLTIMAS MEDICIONES =====\n")

        print(
            f"{'ID':<8}"
            f"{'Timestamp':<20}"
            f"{'Temp (°C)':<12}"
            f"{'Hum. Aire':<12}"
            f"{'Hum. Suelo':<13}"
            f"{'pH':<8}"
            f"{'TDS (ppm)':<12}"
        )

        print("-" * 87)

        for fila in registros:
        
            tds = fila["tds"]
        
            tds_texto = (
                f"{tds:.1f}"
                if tds is not None
                else "--"
            )
        
            print(
                f"{fila['id']:<8}"
                f"{fila['timestamp']:<20}"
                f"{fila['temperatura']:<12.1f}"
                f"{fila['humedad_aire']:<12.1f}"
                f"{fila['humedad_suelo']:<13}"
                f"{fila['ph']:<8.2f}"
                f"{tds_texto:<12}"
            )

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
