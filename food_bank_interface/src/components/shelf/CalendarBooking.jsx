const db = globalThis.__B44_DB__ || { auth:{ isAuthenticated: async()=>false, me: async()=>null }, entities:new Proxy({}, { get:()=>({ filter:async()=>[], get:async()=>null, create:async()=>({}), update:async()=>({}), delete:async()=>({}) }) }), integrations:{ Core:{ UploadFile:async()=>({ file_url:'' }) } } };

import React, { useState, useRef, useEffect } from 'react';
import { Calendar, Package, Truck, Check, Plus, Minus, Clock } from 'lucide-react';

const TIMES = Array.from({ length: 96 }, (_, i) => {
  const h24 = Math.floor(i / 4);
  const m = (i % 4) * 15;
  const ampm = h24 < 12 ? 'AM' : 'PM';
  const h12 = h24 % 12 === 0 ? 12 : h24 % 12;
  return `${h12}:${String(m).padStart(2, '0')} ${ampm}`;
});

function getDateCarousel() {
  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const dates = [];
  for (let i = 0; i < 14; i++) {
    const d = new Date();
    d.setDate(d.getDate() + i);
    dates.push({
      day: days[d.getDay()],
      date: d.getDate(),
      month: d.getMonth() + 1,
      full: d.toISOString().split('T')[0],
      label: `${days[d.getDay()]} ${d.getDate()}`,
    });
  }
  return dates;
}

export default function CalendarBooking() {
  const dates = getDateCarousel();
  const [selectedDate, setSelectedDate] = useState(0);
  const [selectedTime, setSelectedTime] = useState(90); // 10:30 PM
  const [boxCount, setBoxCount] = useState(12);
  const [schedules, setSchedules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [confirming, setConfirming] = useState(false);
  const [confirmed, setConfirmed] = useState(false);
  const scrollRef = useRef(null);

  useEffect(() => {
    db.entities.PickupSchedule.list('-created_date', 5)
      .then(setSchedules)
      .catch(() => setSchedules([]))
      .finally(() => setLoading(false));
    if (scrollRef.current) {
      scrollRef.current.scrollTop = 90 * 32;
    }
    const unsubscribe = db.entities.PickupSchedule.subscribe(() => {
      db.entities.PickupSchedule.list('-created_date', 5)
        .then(setSchedules)
        .catch(() => {});
    });
    return unsubscribe;
  }, []);

  const handleScroll = (e) => {
    const index = Math.round(e.target.scrollTop / 32);
    if (index !== selectedTime && index >= 0 && index < TIMES.length) {
      setSelectedTime(index);
    }
  };

  const handleConfirm = async () => {
    setConfirming(true);
    try {
      const newSchedule = await db.entities.PickupSchedule.create({
        label: `Pickup ${dates[selectedDate].label}`,
        time_slot: TIMES[selectedTime],
        box_count: boxCount,
        status: 'dispatched',
        scheduled_date: dates[selectedDate].full,
      });
      setSchedules((prev) => [newSchedule, ...prev]);
      setConfirmed(true);
      setTimeout(() => setConfirmed(false), 3000);
    } catch (e) {
      console.error(e);
    }
    setConfirming(false);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 rounded-lg bg-primary/15 flex items-center justify-center">
          <Calendar className="w-4 h-4 text-primary" />
        </div>
        <h2 className="text-base font-bold">Schedule Pickup</h2>
      </div>

      {/* Date carousel */}
      <div className="flex gap-2 overflow-x-auto pb-2 -mx-1 px-1 scrollbar-hide">
        {dates.map((d, i) => (
          <button
            key={i}
            onClick={() => setSelectedDate(i)}
            className={`flex-shrink-0 w-14 rounded-2xl py-3 flex flex-col items-center gap-0.5 transition-all ${
              selectedDate === i ? 'bg-primary text-primary-foreground' : 'glass-panel'
            }`}
          >
            <span className="text-lg font-bold">{d.date}</span>
            <span className="text-[10px] opacity-60">{String(d.month).padStart(2, '0')}</span>
          </button>
        ))}
      </div>

      {/* Time wheel picker */}
      <div className="glass-panel rounded-2xl p-4">
        <div className="flex items-center gap-2 mb-3">
          <Clock className="w-4 h-4 text-secondary" />
          <span className="text-sm font-medium">Select Time</span>
          <span className="ml-auto text-lg font-bold text-primary">{TIMES[selectedTime]}</span>
        </div>
        <div className="relative h-32 overflow-hidden rounded-xl bg-black/30">
          <div className="absolute top-1/2 left-2 right-2 h-8 -translate-y-1/2 border-y border-primary/30 bg-primary/5 rounded-lg pointer-events-none z-10" />
          <div
            ref={scrollRef}
            onScroll={handleScroll}
            className="h-full overflow-y-auto scrollbar-hide snap-y snap-mandatory"
            style={{ paddingTop: '48px', paddingBottom: '48px' }}
          >
            {TIMES.map((time, i) => (
              <div
                key={i}
                className={`h-8 flex items-center justify-center snap-center text-sm transition-all ${
                  i === selectedTime ? 'text-primary font-bold scale-110' : 'text-muted-foreground/60'
                }`}
              >
                {time}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Box volume counter */}
      <div className="glass-panel rounded-2xl p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Package className="w-4 h-4 text-secondary" />
            <span className="text-sm font-medium">Box Volume Estimate</span>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={() => setBoxCount(Math.max(1, boxCount - 1))} className="w-8 h-8 rounded-lg glass-panel flex items-center justify-center">
              <Minus className="w-4 h-4" />
            </button>
            <span className="text-2xl font-bold w-10 text-center">{boxCount}</span>
            <button onClick={() => setBoxCount(boxCount + 1)} className="w-8 h-8 rounded-lg glass-panel flex items-center justify-center">
              <Plus className="w-4 h-4" />
            </button>
          </div>
        </div>
        <p className="text-xs text-muted-foreground mt-2">Est. weight: {(boxCount * 8).toFixed(0)} kg</p>
      </div>

      {/* Confirm Dispatch */}
      <button
        onClick={handleConfirm}
        disabled={confirming}
        className="w-full py-4 rounded-2xl bg-primary text-primary-foreground font-bold text-base flex items-center justify-center gap-2 hover:opacity-90 transition-all disabled:opacity-50"
      >
        {confirming ? (
          <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
        ) : confirmed ? (
          <><Check className="w-5 h-5" /> Dispatch Confirmed!</>
        ) : (
          <><Truck className="w-5 h-5" /> Confirm Dispatch</>
        )}
      </button>

      {/* Recent dispatches */}
      {!loading && schedules.length > 0 && (
        <div>
          <p className="text-sm font-bold mb-2">Recent Dispatches</p>
          <div className="space-y-2">
            {schedules.map((s) => (
              <div key={s.id} className="glass-panel rounded-xl p-3 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-primary/15 flex items-center justify-center">
                    <Truck className="w-4 h-4 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">{s.label}</p>
                    <p className="text-xs text-muted-foreground">{s.time_slot} · {s.box_count} boxes</p>
                  </div>
                </div>
                <span className={`text-xs px-2 py-1 rounded-full ${s.status === 'dispatched' ? 'bg-green-400/15 text-green-400' : 'bg-muted text-muted-foreground'}`}>
                  {s.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}