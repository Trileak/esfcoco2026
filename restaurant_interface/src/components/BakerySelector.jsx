const db = globalThis.__B44_DB__ || { auth:{ isAuthenticated: async()=>false, me: async()=>null }, entities:new Proxy({}, { get:()=>({ filter:async()=>[], get:async()=>null, create:async()=>({}), update:async()=>({}), delete:async()=>({}) }) }), integrations:{ Core:{ UploadFile:async()=>({ file_url:'' }) } } };

import { useEffect, useState, useMemo } from 'react';

import { Store, MapPin, Package, Navigation } from 'lucide-react';

function distanceKm([lat1, lng1], [lat2, lng2]) {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export default function BakerySelector({ onSelect }) {
  const [tasks, setTasks] = useState(null);
  const [myPos, setMyPos] = useState(null);

  useEffect(() => {
    db.entities.PickupTask.list('route_order', 50)
      .then(list => setTasks(list.filter(t => t.status !== 'completed')))
      .catch(() => setTasks([]));
  }, []);

  useEffect(() => {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(
      pos => setMyPos([pos.coords.latitude, pos.coords.longitude]),
      () => {},
      { timeout: 5000 }
    );
  }, []);

  const { sorted, closestId } = useMemo(() => {
    if (!tasks) return { sorted: [], closestId: null };
    const dist = t => (myPos && t.lat && t.lng) ? distanceKm(myPos, [t.lat, t.lng]) : Infinity;
    let closestId = null;
    let best = Infinity;
    tasks.forEach(t => {
      const d = dist(t);
      if (d < best) { best = d; closestId = t.id; }
    });
    const sorted = myPos ? [...tasks].sort((a, b) => dist(a) - dist(b)) : tasks;
    return { sorted, closestId };
  }, [tasks, myPos]);

  if (!tasks) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="w-8 h-8 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="h-full overflow-y-auto p-4 space-y-4">
      <div>
        <h1 className="text-2xl font-bold">QR Verification</h1>
        <p className="text-sm text-muted-foreground">Which restaurant are you at?</p>
      </div>

      <div className="space-y-2.5">
        {sorted.length === 0 && (
          <p className="text-sm text-muted-foreground text-center py-8">No active pickups right now.</p>
        )}
        {sorted.map(task => {
          const isClosest = task.id === closestId;
          return (
            <button
              key={task.id}
              onClick={() => onSelect(task)}
              className={`w-full text-left p-3.5 rounded-2xl border transition-colors flex items-center gap-3 ${
                isClosest
                  ? 'bg-accent/10 border-accent'
                  : 'bg-secondary/50 border-border hover:border-primary/50'
              }`}
            >
              <div
                className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
                  isClosest ? 'bg-accent text-accent-foreground' : 'bg-primary/20 text-primary'
                }`}
              >
                <Store size={18} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-sm truncate">{task.restaurant_name}</span>
                  {isClosest && (
                    <span className="flex items-center gap-1 text-[9px] font-bold uppercase tracking-wider text-accent-foreground bg-accent px-1.5 py-0.5 rounded-md flex-shrink-0">
                      <Navigation size={9} /> Closest to you
                    </span>
                  )}
                </div>
                <div className="text-xs text-muted-foreground truncate flex items-center gap-1 mt-0.5">
                  <MapPin size={11} className="flex-shrink-0" /> {task.address}
                </div>
              </div>
              <div className="text-right flex-shrink-0">
                {isClosest && myPos && task.lat && task.lng && (
                  <div className="text-[10px] font-semibold text-accent">
                    {distanceKm(myPos, [task.lat, task.lng]).toFixed(1)} km
                  </div>
                )}
                <div className="text-[10px] text-muted-foreground flex items-center gap-1 justify-end mt-0.5">
                  <Package size={10} /> {task.box_count} boxes
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}