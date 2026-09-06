import React, { useEffect, useState } from 'react';
import io from 'socket.io-client';
import DeviceGrid from './components/DeviceGrid';
import DeviceDetail from './components/DeviceDetail';

const SOCKET_URL = process.env.REACT_APP_SOCKET_URL || 'http://localhost:3000';

export default function App() {
  const [devices, setDevices] = useState({});
  const [activeDevice, setActiveDevice] = useState(null);

  useEffect(() => {
    const socket = io(SOCKET_URL, { transports: ['websocket', 'polling'] });

    socket.on('connect', () => console.log('socket connected', socket.id));
    socket.on('devices_snapshot', (arr) => {
      const map = {};
      (arr || []).forEach(d => map[d.deviceId] = d);
      setDevices(prev => ({ ...prev, ...map }));
    });

    socket.on('mqtt_message', (evt) => {
      if (!evt || !evt.deviceId) return;
      setDevices(prev => {
        const copy = { ...prev };
        const cur = copy[evt.deviceId] || { deviceId: evt.deviceId };
        if (evt.topic.endsWith('/telemetry')) {
          cur.lastTelemetry = evt.payload;
          cur.lastSeen = evt.ts;
          cur.type = evt.payload.type || cur.type;
        } else if (evt.topic.endsWith('/status')) {
          cur.status = evt.payload;
          cur.lastSeen = evt.ts;
        }
        copy[evt.deviceId] = cur;
        return copy;
      });
    });

    return () => socket.disconnect();
  }, []);

  return (
    <div className="min-h-screen p-6">
      <header className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold">IoT Multi-Device Dashboard</h1>
        <div className="text-sm text-gray-600">Connected devices: {Object.keys(devices).length}</div>
      </header>

      <DeviceGrid devices={devices} onOpen={setActiveDevice} />

      {activeDevice && (
        <div className="fixed right-6 top-6 z-50">
          <DeviceDetail device={devices[activeDevice]} onClose={() => setActiveDevice(null)} />
        </div>
      )}
    </div>
  );
}
