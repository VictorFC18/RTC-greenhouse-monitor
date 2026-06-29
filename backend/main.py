from database import crear_base_datos
from mqtt_subscriber import iniciar_mqtt

print("====================================")
print(" Sistema IoT - Invernadero")
print("====================================")

crear_base_datos()
print("Base de datos inicializada.")

iniciar_mqtt()
