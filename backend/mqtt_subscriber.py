import paho.mqtt.client as mqtt
import json
from database import guardar_medicion

# ==============================
# CONFIGURACIÓN MQTT
# ==============================

BROKER = "192.168.100.95"
PORT = 1883
TOPIC = "invernadero/sensores"

# ==============================
# CALLBACK DE CONEXIÓN
# ==============================

def on_connect(client, userdata, flags, reason_code, properties=None):

    if reason_code == 0:
        print("Conectado al broker MQTT")

        client.subscribe(TOPIC)

        print(f"Suscrito a: {TOPIC}")

    else:
        print(f"Error de conexión: {reason_code}")

# ==============================
# CALLBACK DE MENSAJES
# ==============================

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

        print("\n===== NUEVA LECTURA =====")

        print(f"Temperatura     : {datos['temperatura']} °C")
        print(f"Humedad aire    : {datos['humedad']} %")
        print(f"Humedad suelo   : {datos['suelo']} %")
        print(f"pH              : {datos['ph']}")

        print("Medición almacenada correctamente.\n")

    except Exception as e:

        print(f"Error: {e}")

# ==============================
# CLIENTE MQTT
# ==============================

client = mqtt.Client(mqtt.CallbackAPIVersion.VERSION2)

client.on_connect = on_connect
client.on_message = on_message

# ==============================
# CONEXIÓN
# ==============================

print("Conectando al broker...")

client.connect(BROKER, PORT)

client.loop_forever()
