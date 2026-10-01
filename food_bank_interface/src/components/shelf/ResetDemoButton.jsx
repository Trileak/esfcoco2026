const db = globalThis.__B44_DB__ || { auth:{ isAuthenticated: async()=>false, me: async()=>null }, entities:new Proxy({}, { get:()=>({ filter:async()=>[], get:async()=>null, create:async()=>({}), update:async()=>({}), delete:async()=>({}) }) }), integrations:{ Core:{ UploadFile:async()=>({ file_url:'' }) } } };

import React, { useState } from 'react';

export default function ResetDemoButton() {
  const [resetting, setResetting] = useState(false);

  const handleReset = async () => {
    setResetting(true);
    try {
      await db.entities.PickupSchedule.deleteMany({});
      await db.entities.PickupSchedule.create({
        label: 'Default Pickup',
        time_slot: '10:30 PM',
        box_count: 12,
        status: 'dispatched',
        scheduled_date: new Date().toISOString().split('T')[0],
      });
    } catch (e) {
      console.error(e);
    }
    setResetting(false);
  };

  return (
    <div className="flex justify-center pt-2">
      <button
        onClick={handleReset}
        disabled={resetting}
        className="text-xs text-muted-foreground/60 hover:text-muted-foreground transition-colors disabled:opacity-50"
      >
        {resetting ? 'Resetting…' : 'Reset demo data'}
      </button>
    </div>
  );
}