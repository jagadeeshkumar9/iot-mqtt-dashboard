import React, { useEffect, useRef, useState } from 'react';
import { Line } from 'react-chartjs-2';
import { Chart, LineElement, PointElement, CategoryScale, LinearScale, TimeScale, Tooltip } from 'chart.js';
import MapView from './MapView';

Chart.register(LineElement, PointElement, CategoryScale, LinearScale, TimeScale, Tooltip);

export default function DeviceDetail({ device, onClose }) {
  const [history, setHistory] = useState([]);
  const keyRef = useRef(null);

  useEffect(() => {
    const metrics = (device && device.lastTelemetry && device.lastTelemetry.metrics) || {};
    const numeric = Object.keys(metrics).find(k => typeof metrics[k] === 'number');
    keyRef.current = numeric || null;

    if (numeric) {
      setHistory([{ ts: device.lastSeen || Date.now(), v: metrics[numeric] }]);
    } else {
      setHistory([]);
    }
  }, [device]);

  const labels = history.map(h => new Date(h.ts).toLocaleTimeString());
  const values = history.map(h => h.v);

  return (
    <div className="w-[420px] bg-white rounded-lg shadow-lg p-4">
      <div className="flex items-start justify-between">
        <div>
          <h3 className="text-lg font-semibold">{device.deviceId}</h3>
          <div className="text-sm text-gray-500">{device.type}</div>
        </div>
        <button onClick={onClose} className="text-gray-400">✖</button>
      </div>

      <div className="mt-3">
        {keyRef.current ? (
          <div>
            <div className="text-sm text-gray-500">Metric: {keyRef.current}</div>
            <div className="h-40">
              <Line data={{
                labels,
                datasets: [{ label: keyRef.current, data: values, borderColor:'#2563eb', tension:0.2 }]
              }} options={{ responsive:true, maintainAspectRatio:false, animation:false }} />
            </div>
          </div>
        ) : <div className="text-sm text-gray-500">No numeric metric available</div>}
      </div>

      <div className="mt-3">
        <div className="text-sm font-medium mb-1">Location</div>
        <div className="h-40"><MapView telemetry={device.lastTelemetry} /></div>
      </div>

      <div className="mt-3">
        <div className="text-sm font-medium">Raw</div>
        <pre className="text-xs bg-gray-50 p-2 rounded max-h-32 overflow-auto">
          {JSON.stringify(device.lastTelemetry || device.status || {}, null, 2)}
        </pre>
      </div>
    </div>
  );
}
