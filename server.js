// server.js
const express = require('express');
const http = require('http');
const socketio = require('socket.io');
const mqtt = require('mqtt');
const cors = require('cors');

const MQTT_BROKER = process.env.MQTT_BROKER || 'mqtt://mosquitto:1883';
const MQTT_USER = process.env.MQTT_USER || '';
const MQTT_PASS = process.env.MQTT_PASS || '';
const DASH_USER = process.env.DASH_USER || '';
const DASH_PASS = process.env.DASH_PASS || '';

const MQTT_OPTIONS = {};
if (MQTT_USER) MQTT_OPTIONS.username = MQTT_USER;
if (MQTT_PASS) MQTT_OPTIONS.password = MQTT_PASS;
if (process.env.MQTT_TLS === 'true') MQTT_OPTIONS.rejectUnauthorized = false; // allow self-signed if needed

const app = express();
app.use(cors());

// Basic HTTP auth middleware for dashboard
function checkBasicAuthHeader(header) {
  if (!DASH_USER) return true; // no auth configured
  if (!header) return false;
  if (!header.startsWith('Basic ')) return false;
  const b64 = header.slice(6);
  const decoded = Buffer.from(b64, 'base64').toString('utf8');
  const [user, pass] = decoded.split(':');
  return user === DASH_USER && pass === DASH_PASS;
}

// Apply basic auth for all static requests and socket.io handshake (socket.io handshake hits HTTP endpoints)
app.use((req, res, next) => {
  // Allow health checks without auth
  if (req.path === '/health' || req.path === '/favicon.ico') return next();
  if (!DASH_USER) return next(); // if no dash user configured, skip auth
  const auth = req.headers['authorization'];
  if (checkBasicAuthHeader(auth)) return next();
  res.setHeader('WWW-Authenticate', 'Basic realm="IoT Dashboard"');
  return res.status(401).send('Authentication required');
});

app.use(express.static('public'));

const server = http.createServer(app);
const io = socketio(server, {
  cors: { origin: '*' }
});

// Socket auth for websockets (handshake can include Authorization header)
io.use((socket, next) => {
  if (!DASH_USER) return next();
  const auth = socket.request.headers['authorization'] || socket.handshake.headers['authorization'];
  if (checkBasicAuthHeader(auth)) return next();
  return next(new Error('Unauthorized'));
});

const mqttClient = mqtt.connect(MQTT_BROKER, MQTT_OPTIONS);

let devices = {}; // deviceId => latest snapshot

mqttClient.on('connect', () => {
  console.log('MQTT connected to', MQTT_BROKER);
  mqttClient.subscribe('device/+/telemetry', { qos: 1 });
  mqttClient.subscribe('device/+/status', { qos: 1 });
  // subscribe additional patterns if your devices use other topics
});

mqttClient.on('message', (topic, payloadBuf) => {
  const payload = payloadBuf.toString();
  try {
    const msg = JSON.parse(payload);
    const parts = topic.split('/');
    let deviceId = parts.length >= 2 ? parts[1] : (msg.deviceId || 'unknown');
    if (!deviceId) deviceId = 'unknown';

    const event = { topic, deviceId, payload: msg, raw: payload, ts: Date.now() };

    if (!devices[deviceId]) devices[deviceId] = { deviceId, lastSeen: 0, lastTelemetry: null, type: msg.type || 'unknown' };
    devices[deviceId].lastSeen = Date.now();

    if (topic.endsWith('/telemetry')) {
      devices[deviceId].lastTelemetry = msg;
      devices[deviceId].type = msg.type || devices[deviceId].type;
    } else if (topic.endsWith('/status')) {
      devices[deviceId].status = msg;
    }

    // Broadcast to connected web clients
    io.emit('mqtt_message', event);

    // Periodically emit device snapshot for overview
    io.emit('devices_snapshot', Object.values(devices));
  } catch (err) {
    console.warn('Invalid JSON from MQTT topic', topic, err.message);
  }
});

io.on('connection', socket => {
  console.log('web client connected', socket.id);

  // Send current snapshot on connect
  socket.emit('devices_snapshot', Object.values(devices));

  socket.on('send_command', (data) => {
    // data: { deviceId, topicSuffix: 'command', payload: { ... } }
    if (!data || !data.deviceId || !data.payload) return;
    const topic = `device/${data.deviceId}/${data.topicSuffix || 'command'}`;
    mqttClient.publish(topic, JSON.stringify(data.payload), { qos: 1 }, (err) => {
      socket.emit('command_result', { ok: !err, err: err && err.message });
    });
  });

  socket.on('disconnect', () => {
    console.log('web client disconnected', socket.id);
  });
});

// health endpoint
app.get('/health', (req, res) => res.json({ ok: true }));

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log(`Server listening on ${PORT}`));
