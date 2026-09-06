import React from 'react';

function summaryText(lastTelemetry) {
  if (!lastTelemetry || !lastTelemetry.metrics) return 'No data';
  const m = lastTelemetry.metrics;
  if (m.occupiedSlots !== undefined) return `${m.occupiedSlots}/${lastTelemetry.totalSlots||8} occupied`;
  if (m.fillLevel !== undefined) return `${m.fillLevel}% full`;
  if (m.waterLevel !== undefined) return `${m.waterLevel}%`;
  if (m.pH !== undefined) return `pH ${m.pH}`;
  if (m.voltage !== undefined) return `${m.voltage}V`;
  return Object.keys(m).slice(0,3).map(k=>`${k}:${m[k]}`).join(' ');
}

export default function DeviceCard({ device, onOpen }) {
  const last = device.lastTelemetry;
  const online = device.status ? device.status.status !== 'offline' : true;
  return (
    <div className="bg-white rounded-lg p-4 shadow">
      <div className="flex items-start justify-between">
        <div>
          <h3 className="text-lg font-medium">{device.deviceId}</h3>
          <div className="text-xs text-gray-500">{device.type || 'unknown'}</div>
        </div>
        <div className={`px-2 py-1 text-xs rounded ${online ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'}`}>
          {online ? 'Online' : 'Offline'}
        </div>
      </div>

      <div className="mt-3">
        <div className="text-sm text-gray-600">Summary</div>
        <div className="text-xl font-semibold">{summaryText(last)}</div>
      </div>

      <div className="mt-4 flex items-center justify-between">
        <div className="text-sm text-gray-500">
          Last: {device.lastSeen ? new Date(device.lastSeen).toLocaleTimeString() : '—'}
        </div>
        <button onClick={onOpen} className="px-3 py-1 bg-blue-600 text-white rounded">View</button>
      </div>
    </div>
  );
}
