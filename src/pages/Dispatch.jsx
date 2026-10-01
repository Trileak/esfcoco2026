const db = globalThis.__B44_DB__ || { auth:{ isAuthenticated: async()=>false, me: async()=>null }, entities:new Proxy({}, { get:()=>({ filter:async()=>[], get:async()=>null, create:async()=>({}), update:async()=>({}), delete:async()=>({}) }) }), integrations:{ Core:{ UploadFile:async()=>({ file_url:'' }) } } };

import { useEffect, useState, useMemo } from 'react';

import TaskCard from '@/components/TaskCard';
import { PRESET_STOPS } from '@/lib/presetStops';
import { useNavigate } from 'react-router-dom';
import { TrendingUp, Package, Plus } from 'lucide-react';

export default function Dispatch() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    db.entities.PickupTask.list('route_order', 50)
      .then(setTasks)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handleMarkDone = async (taskId) => {
    const task = tasks.find(t => t.id === taskId);
    const newStatus = task.status === 'completed' ? 'pending' : 'completed';
    await db.entities.PickupTask.update(taskId, { status: newStatus });
    setTasks(prev => prev.map(t => t.id === taskId ? { ...t, status: newStatus } : t));
  };

  const handleResetData = async () => {
    await db.entities.PickupTask.deleteMany({});
    const created = await db.entities.PickupTask.bulkCreate(PRESET_STOPS);
    setTasks([...created].sort((a, b) => a.route_order - b.route_order));
  };

  const handleTimeChange = async (taskId, start, end) => {
    await db.entities.PickupTask.update(taskId, { pickup_window_start: start, pickup_window_end: end, eta: start });
    setTasks(prev => prev.map(t => t.id === taskId ? { ...t, pickup_window_start: start, pickup_window_end: end, eta: start } : t));
  };

  const handleDelete = async (taskId) => {
    await db.entities.PickupTask.delete(taskId);
    setTasks(prev => prev.filter(t => t.id !== taskId));
  };

  const completed = useMemo(() => tasks.filter(t => t.status === 'completed').length, [tasks]);
  const total = tasks.length;
  const progress = total > 0 ? Math.round((completed / total) * 100) : 0;
  const totalBoxes = useMemo(() => tasks.reduce((s, t) => s + (t.box_count || 0), 0), [tasks]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="w-8 h-8 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="h-full overflow-y-auto p-4 space-y-4">
      <div className="flex items-end justify-between">
        <div>
          <h1 className="text-2xl font-bold">Dispatch</h1>
          <p className="text-sm text-muted-foreground">Tonight's food rescue operations</p>
        </div>
        <button
          onClick={() => navigate('/?add=1')}
          className="flex items-center gap-1 text-xs font-semibold text-primary bg-primary/15 px-2.5 py-1 rounded-lg hover:bg-primary hover:text-primary-foreground transition-colors"
        >
          <Plus size={14} /> Add
        </button>
      </div>

      <div className="bg-gradient-to-br from-primary/20 to-accent/10 border border-primary/30 rounded-2xl p-4">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <TrendingUp size={18} className="text-primary" />
            <span className="font-bold text-sm">Completion Rate</span>
          </div>
          <span className="text-2xl font-bold text-primary">{progress}%</span>
        </div>
        <div className="h-2.5 bg-background/50 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-primary to-accent rounded-full transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>
        <div className="flex justify-between mt-2.5 text-xs text-muted-foreground">
          <span>{completed} of {total} stops done</span>
          <span className="flex items-center gap-1"><Package size={12} /> {totalBoxes} boxes</span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {tasks.map(task => (
          <TaskCard key={task.id} task={task} onMarkDone={handleMarkDone} onDelete={handleDelete} onTimeChange={handleTimeChange} />
        ))}
      </div>

      <div className="pt-2 pb-1 text-center">
        <button
          onClick={handleResetData}
          className="text-[10px] text-muted-foreground/50 hover:text-destructive transition-colors"
        >
          Reset demo data
        </button>
      </div>
    </div>
  );
}