# Broker MQTT para clase de IoT

Broker MQTT simple en Node.js con [Aedes](https://github.com/moscajs/aedes).

- **MQTT TCP**: puerto `1883`
- **MQTT sobre WebSocket**: puerto `8883` (para clientes web)
- Autenticacion opcional con variables de entorno `MQTT_USER` y `MQTT_PASS` (si no se definen, acceso anonimo)

## Local

```bash
npm install
npm start
```

## Docker

```bash
docker compose up -d --build
```

## Despliegue en Coolify

1. Nuevo recurso -> Public/Private Repository -> este repo -> Build Pack: **Dockerfile** (o Docker Compose).
2. **Ports Exposes**: `8883` (WebSocket; asignale un dominio si quieres usarlo, ej. `wss://mqtt.tudominio.com`).
3. **Ports Mappings**: `1883:1883` para exponer MQTT TCP directamente en la IP del VPS (Traefik solo maneja HTTP).
4. Abre el puerto `1883` en el firewall del VPS.
5. (Opcional) Define `MQTT_USER` y `MQTT_PASS` en Environment Variables.

## Probar

```bash
mosquitto_sub -h IP_VPS -p 1883 -t "clase/#" -v
mosquitto_pub -h IP_VPS -p 1883 -t "clase/temp" -m "25.5"
```
