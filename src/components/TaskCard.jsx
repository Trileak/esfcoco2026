import { useState } from 'react';
import { Clock, Package, Check, RotateCcw, Trash2, PencilLine } from 'lucide-react';

const statusConfig = {
  pending: { label: 'Pending', cls: 'bg-yellow-500/15 text-yellow-400 border-yellow-500/30' },
  in_transit: { label: 'In Transit', cls: 'bg-orange-500/15 text-orange-400 border-orange-500/30' },
  arrived: { label: 'Arrived', cls: 'bg-blue-500/15 text-blue-400 border-blue-500/30' },
  completed: { label: 'Done', cls: 'bg-green-500/15 text-green-400 border-green-500/30' },
};

function to12(t) {
  const [h, m] = (t || '21:00').split(':').map(Number);
  return { hour: ((h + 11) % 12) + 1, minute: Math.floor(m / 15) * 15, period: h >= 12 ? 'PM' : 'AM' };
}

function to24(hour, minute, period) {
  let h = hour % 12;
  if (period === 'PM') h += 12;
  return `${String(h).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;
}

function plus15(t) {
  let [h, m] = t.split(':').map(Number);
  m += 15;
  if (m >= 60) {
    m -= 60;
    h = (h + 1) % 24;
  }
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
}

export default function TaskCard({ task, onMarkDone, onDelete, onTimeChange }) {
  const status = statusConfig[task.status] || statusConfig.pending;
  const [editingTime, setEditingTime] = useState(false);
  const initial = to12(task.pickup_window_start);
  const [hour, setHour] = useState(initial.hour);
  const [minute, setMinute] = useState(initial.minute);
  const [period, setPeriod] = useState(initial.period);

  const applyTime = (h, m, p) => {
    setHour(h);
    setMinute(m);
    setPeriod(p);
    const start = to24(h, m, p);
    onTimeChange(task.id, start, plus15(start));
  };

  return (
    <div className="bg-secondary/50 border border-border rounded-2xl p-3.5 shadow-lg">
      <div className="flex items-start justify-between mb-2.5">
        <div className="flex items-center gap-2 min-w-0">
          <div className="w-9 h-9 rounded-xl bg-primary/20 flex items-center justify-center text-primary font-bold text-sm flex-shrink-0">
            {task.restaurant_name?.[0] || 'R'}
          </div>
          <div className="min-w-0">
            <div className="font-bold text-xs truncate">{task.restaurant_name}</div>
            <div className="text-[10px] text-muted-foreground truncate">{task.address}</div>
          </div>
        </div>
        {onDelete && (
          <button
            onClick={() => onDelete(task.id)}
            className="text-muted-foreground hover:text-destructive transition-colors p-1 flex-shrink-0"
          >
            <Trash2 size={13} />
          </button>
        )}
      </div>

      <span className={`inline-block text-[9px] font-semibold px-2 py-0.5 rounded-full border ${status.cls}`}>
        {status.label}
      </span>

      <div className="flex items-center justify-between mt-2.5 text-[10px]">
        <div className="flex items-center gap-1 text-muted-foreground">
          <Clock size={11} /> {task.eta || '--:--'}
          {onTimeChange && (
            <button
              onClick={() => setEditingTime(v => !v)}
              className="text-muted-foreground/60 hover:text-primary transition-colors ml-0.5"
              title="Change pickup time"
            >
              <PencilLine size={10} />
            </button>
          )}
        </div>
        <div className="flex items-center gap-1 text-primary font-semibold">
          <Package size={11} /> {task.box_count || 0}
        </div>
      </div>

      {editingTime && onTimeChange && (
        <div className="flex items-center gap-1 mt-2">
          <select
            value={hour}
            onChange={(e) => applyTime(Number(e.target.value), minute, period)}
            className="bg-secondary border border-border rounded-md text-[10px] text-foreground px-1.5 py-1"
          >
            {Array.from({ length: 12 }, (_, i) => i + 1).map(h => (
              <option key={h} value={h}>{h}</option>
            ))}
          </select>
          <select
            value={minute}
            onChange={(e) => applyTime(hour, Number(e.target.value), period)}
            className="bg-secondary border border-border rounded-md text-[10px] text-foreground px-1.5 py-1"
          >
            {[0, 15, 30, 45].map(m => (
              <option key={m} value={m}>{String(m).padStart(2, '0')}</option>
            ))}
          </select>
          <select
            value={period}
            onChange={(e) => applyTime(hour, minute, e.target.value)}
            className="bg-secondary border border-border rounded-md text-[10px] text-foreground px-1.5 py-1"
          >
            <option value="AM">AM</option>
            <option value="PM">PM</option>
          </select>
        </div>
      )}

      {task.driver_name && (
        <div className="flex items-center gap-1.5 mt-2.5 pt-2.5 border-t border-border">
          <div className="w-5 h-5 rounded-full bg-accent/20 flex items-center justify-center text-[9px] font-bold text-accent">
            {task.driver_name[0]}
          </div>
          <span className="text-[10px] text-muted-foreground truncate">{task.driver_name}</span>
        </div>
      )}

      {onMarkDone && (
        <button
          onClick={() => onMarkDone(task.id)}
          className={`w-full mt-2.5 py-1.5 rounded-lg text-[10px] font-semibold transition-colors flex items-center justify-center gap-1 ${
            task.status === 'completed'
              ? 'bg-secondary text-muted-foreground hover:bg-border'
              : 'bg-primary/15 text-primary hover:bg-primary hover:text-primary-foreground'
          }`}
        >
          {task.status === 'completed' ? <RotateCcw size={12} /> : <Check size={12} />}
          {task.status === 'completed' ? 'Undo' : 'Mark Done'}
        </button>
      )}
    </div>
  );
}