# iot-mqtt-dashboard

MQTT → WebSocket bridge + simple static dashboard for multi-device IoT telemetry.

This repository contains a lightweight Node.js bridge that subscribes to telemetry/status topics on an MQTT broker and forwards messages to connected browser clients over Socket.IO. The project also includes a simple static dashboard in `public/` that shows live device snapshots.

Features
- Subscribes to `device/+/telemetry` and `device/+/status`
- Broadcasts MQTT messages to WebSocket clients (Socket.IO)
- Serves a simple static dashboard (public/index.html)
- Easy to extend: add more topic subscriptions, authentication, or a full React frontend

Getting started

Requirements:
- Node.js 16+ and npm
- Access to an MQTT broker (default: mqtt://3.107.84.202:1883)

1. Clone

```bash
git clone https://github.com/jagadeeshkumar9/iot-mqtt-dashboard.git
cd iot-mqtt-dashboard
```

2. Install

```bash
npm install
```

3. Run

```bash
# optional: override the MQTT broker
export MQTT_BROKER='mqtt://your-broker:1883'

npm start
```

The server listens on port 3000 by default. Open `http://localhost:3000` to view the dashboard.

Integration notes
- Devices should publish telemetry to `device/<DEVICE_ID>/telemetry` and status to `device/<DEVICE_ID>/status`.
- Telemetry JSON should include `deviceId`, `type`, `metrics` (object) and optional `location`.
- Example telemetry payload:

```json
{
  "deviceId":"PARK-001",
  "type":"parking",
  "time":1680000000,
  "metrics": { "occupiedSlots": 3, "freeSlots": 5 },
  "location": {"lat":12.97, "lon":77.59}
}
```

Security & production
- Use MQTT authentication (username/password) and TLS in production.
- Protect the dashboard with authentication and serve over HTTPS (use nginx reverse proxy + LetsEncrypt).
- For long-term history and charts, add a time-series DB (InfluxDB) or a simple persistence layer.

Extending
- Replace `public/index.html` with the React/Tailwind app (not included in this minimal push) for a richer UI.
- Add command endpoints that publish to `device/<ID>/command`.

