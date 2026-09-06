# Docker and security

This repository now includes a Docker Compose setup to run a local MQTT broker (Eclipse Mosquitto) and the Node bridge (which serves the dashboard).

Files added:
- docker-compose.yml
- Dockerfile
- mosquitto/config/mosquitto.conf
- .env.example

Quick start (development)

1. Copy .env.example to .env and set values (DO NOT commit .env with secrets):

   cp .env.example .env
   # edit .env and set MQTT_USER, MQTT_PASS, DASH_USER, DASH_PASS

2. Create mosquitto password file (on host) and place it under mosquitto/config/passwordfile:

   # Replace <user> with your chosen MQTT username
   docker run --rm -v $(pwd)/mosquitto/config:/mosquitto/config eclipse-mosquitto mosquitto_passwd -c /mosquitto/config/passwordfile <user>

3. Start with docker-compose:

   docker-compose up --build

4. Access the dashboard (bridge serves static app) at:

   http://localhost:3000

Notes
- The dashboard and websocket endpoint are protected by HTTP Basic Auth; set DASH_USER and DASH_PASS in your .env and the browser will prompt for credentials.
- The Mosquitto broker is configured to require authentication (allow_anonymous false) and to listen on port 1883 and websockets on 9001.
- For production, put the bridge behind an HTTPS reverse proxy (nginx) and use TLS for MQTT.
