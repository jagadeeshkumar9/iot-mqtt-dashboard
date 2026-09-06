import React, { useMemo, useState } from 'react';
import DeviceCard from './DeviceCard';

export default function DeviceGrid({ devices, onOpen }) {
  const [q, setQ] = useState('');

  const list = useMemo(() => {
    return Object.values(devices)
      .filter(d => d.deviceId && d.deviceId.toLowerCase().includes(q.toLowerCase()))
      .sort((a,b)=> (b.lastSeen || 0) - (a.lastSeen || 0));
  }, [devices, q]);

  return (
    <>
      <div className="mb-4 flex items-center gap-4">
        <input value={q} onChange={e=>setQ(e.target.value)} placeholder="Search device..."
               className="px-3 py-2 border rounded shadow-sm w-64" />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {list.map(d => (
          <DeviceCard key={d.deviceId} device={d} onOpen={() => onOpen(d.deviceId)} />
        ))}
      </div>
    </>
  );
}
