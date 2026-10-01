const db = globalThis.__B44_DB__ || { auth:{ isAuthenticated: async()=>false, me: async()=>null }, entities:new Proxy({}, { get:()=>({ filter:async()=>[], get:async()=>null, create:async()=>({}), update:async()=>({}), delete:async()=>({}) }) }), integrations:{ Core:{ UploadFile:async()=>({ file_url:'' }) } } };

import { useEffect, useState, useMemo } from 'react';
import { MapContainer, TileLayer, Polyline, CircleMarker, Popup, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Clock, MapPin, Navigation as NavIcon, Check, Plus } from 'lucide-react';

function MapClickHandler({ onMapClick }) {
  useMapEvents({
    click: (e) => onMapClick(e.latlng),
  });
  return null;
}

export default function Navigation() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [addingStop, setAddingStop] = useState(false);
  const [newStopCoords, setNewStopCoords] = useState(null);
  const [newStopName, setNewStopName] = useState('');
  const [newStopAddress, setNewStopAddress] = useState('');
  const [newStopBoxes, setNewStopBoxes] = useState('');

  useEffect(() => {
    db.entities.PickupTask.list('route_order', 50)
      .then(setTasks)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('add') === '1') setAddingStop(true);
  }, []);

  const activeTasks = useMemo(() => tasks.filter(t => t.status !== 'completed'), [tasks]);
  const nextStop = activeTasks[0] || tasks[0];

  const routeCoords = useMemo(
    () => tasks.filter(t => t.lat && t.lng).map(t => [t.lat, t.lng]),
    [tasks]
  );

  const center = useMemo(() => {
    const withCoords = tasks.filter(t => t.lat && t.lng);
    if (withCoords.length === 0) return [22.2900, 114.1680];
    const avgLat = withCoords.reduce((s, t) => s + t.lat, 0) / withCoords.length;
    const avgLng = withCoords.reduce((s, t) => s + t.lng, 0) / withCoords.length;
    return [avgLat, avgLng];
  }, [tasks]);

  const handleMarkDone = async (taskId) => {
    await db.entities.PickupTask.update(taskId, { status: 'completed' });
    setTasks(prev => prev.map(t => t.id === taskId ? { ...t, status: 'completed' } : t));
  };

  const handleSaveStop = async () => {
    if (!newStopName.trim() || !newStopCoords) return;
    const nextOrder = tasks.length > 0 ? Math.max(...tasks.map(t => t.route_order || 0)) + 1 : 1;
    const created = await db.entities.PickupTask.create({
      restaurant_name: newStopName.trim(),
      address: newStopAddress.trim() || `${newStopCoords[0].toFixed(4)}, ${newStopCoords[1].toFixed(4)}`,
      status: 'pending',
      box_count: parseInt(newStopBoxes) || 0,
      lat: newStopCoords[0],
      lng: newStopCoords[1],
      route_order: nextOrder,
    });
    setTasks(prev => [...prev, created]);
    cancelAdd();
  };

  const cancelAdd = () => {
    setAddingStop(false);
    setNewStopCoords(null);
    setNewStopName('');
    setNewStopAddress('');
    setNewStopBoxes('');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="w-8 h-8 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      {addingStop ? (
        <div className="bg-accent text-accent-foreground px-4 py-3 flex items-center gap-3 flex-shrink-0">
          <MapPin size={20} />
          <span className="text-sm font-semibold flex-1">
            {newStopCoords ? 'Fill in details below' : 'Tap the map to place your stop'}
          </span>
          <button onClick={cancelAdd} className="text-xs font-medium underline">
            Cancel
          </button>
        </div>
      ) : nextStop ? (
        <div className="bg-primary text-primary-foreground px-4 py-3 flex items-center gap-3 flex-shrink-0">
          <div className="w-10 h-10 rounded-full bg-primary-foreground/20 flex items-center justify-center flex-shrink-0">
            <NavIcon size={20} />
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-[10px] font-medium opacity-80 uppercase tracking-wider">
              Next Stop · #{nextStop.route_order}
            </div>
            <div className="font-bold text-sm truncate">{nextStop.restaurant_name}</div>
          </div>
          <div className="text-right flex-shrink-0">
            <div className="text-[10px] opacity-80">Pickup Window</div>
            <div className="font-bold text-xs">{nextStop.pickup_window_start} – {nextStop.pickup_window_end}</div>
          </div>
        </div>
      ) : null}

      <div className="flex-1 relative min-h-0">
        <MapContainer
          center={center}
          zoom={12}
          className="absolute inset-0"
          zoomControl={false}
          attributionControl={false}
        >
          <TileLayer url="https://basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}.png?key=cb1_3qnl_1_562cdc5a578867b0e5145f05" />
          <MapClickHandler onMapClick={(latlng) => { if (addingStop) setNewStopCoords([latlng.lat, latlng.lng]); }} />
          {routeCoords.length > 1 && (
            <Polyline
              positions={routeCoords}
              pathOptions={{ color: '#FF7A00', weight: 4, opacity: 0.85 }}
            />
          )}
          {tasks.filter(t => t.lat && t.lng).map((task) => (
            <CircleMarker
              key={task.id}
              center={[task.lat, task.lng]}
              radius={9}
              pathOptions={{
                color: '#FFC107',
                fillColor: task.status === 'completed' ? '#22c55e' : '#FF7A00',
                fillOpacity: 0.85,
                weight: 2,
              }}
            >
              <Popup>
                <div className="text-xs">
                  <div className="font-bold text-sm">{task.restaurant_name}</div>
                  <div className="text-gray-500">{task.address}</div>
                  <div className="mt-1 font-semibold text-orange-500">
                    {task.pickup_window_start} – {task.pickup_window_end}
                  </div>
                </div>
              </Popup>
            </CircleMarker>
          ))}
          {newStopCoords && (
            <CircleMarker
              center={newStopCoords}
              radius={11}
              pathOptions={{
                color: '#FFC107',
                fillColor: '#FFC107',
                fillOpacity: 0.4,
                weight: 3,
                dashArray: '4 4',
              }}
            />
          )}
        </MapContainer>
      </div>

      {addingStop && newStopCoords ? (
        <div className="bg-card border-t border-border p-4 space-y-3 flex-shrink-0">
          <h3 className="font-bold text-sm">New Stop Details</h3>
          <Input
            placeholder="Restaurant name"
            value={newStopName}
            onChange={(e) => setNewStopName(e.target.value)}
          />
          <Input
            placeholder="Address (optional)"
            value={newStopAddress}
            onChange={(e) => setNewStopAddress(e.target.value)}
          />
          <div className="flex gap-2">
            <Input
              placeholder="Box count"
              type="number"
              value={newStopBoxes}
              onChange={(e) => setNewStopBoxes(e.target.value)}
              className="flex-1"
            />
            <Button onClick={handleSaveStop} disabled={!newStopName.trim()} className="flex-1">
              <Plus size={16} /> Save Stop
            </Button>
          </div>
        </div>
      ) : (
        <div className="bg-card border-t border-border p-4 max-h-[38%] overflow-y-auto flex-shrink-0">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-bold text-sm">Upcoming Stops</h3>
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground">{activeTasks.length} remaining</span>
              <button
                onClick={() => setAddingStop(true)}
                className="flex items-center gap-1 text-xs font-semibold text-primary bg-primary/15 px-2.5 py-1 rounded-lg hover:bg-primary hover:text-primary-foreground transition-colors"
              >
                <Plus size={14} /> Add
              </button>
            </div>
          </div>
          <div className="space-y-2">
            {activeTasks.length === 0 && (
              <p className="text-sm text-muted-foreground text-center py-4">All stops completed! 🎉</p>
            )}
            {activeTasks.map(task => (
              <div key={task.id} className="flex items-center gap-3 p-2.5 rounded-xl bg-secondary/50">
                <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center text-primary font-bold text-xs flex-shrink-0">
                  {task.route_order}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-xs truncate">{task.restaurant_name}</div>
                  <div className="text-[10px] text-muted-foreground truncate">{task.address}</div>
                </div>
                <div className="text-right flex-shrink-0">
                  <div className="text-[10px] text-muted-foreground flex items-center gap-1 justify-end">
                    <Clock size={10} /> {task.pickup_window_start}
                  </div>
                  <div className="text-[10px] font-semibold text-primary">{task.box_count} boxes</div>
                </div>
                <button
                  onClick={() => handleMarkDone(task.id)}
                  className="w-8 h-8 rounded-lg bg-primary/20 text-primary flex items-center justify-center flex-shrink-0 hover:bg-primary hover:text-primary-foreground transition-colors"
                >
                  <Check size={16} />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}