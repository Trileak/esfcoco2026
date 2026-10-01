const db = globalThis.__B44_DB__ || { auth:{ isAuthenticated: async()=>false, me: async()=>null }, entities:new Proxy({}, { get:()=>({ filter:async()=>[], get:async()=>null, create:async()=>({}), update:async()=>({}), delete:async()=>({}) }) }), integrations:{ Core:{ UploadFile:async()=>({ file_url:'' }) } } };

import React, { useState, useEffect } from 'react';
import { MapPin, Globe } from 'lucide-react';

import LeaderboardPanel from './LeaderboardPanel';
import SDGActionExplorer from './SDGActionExplorer';

export default function Leaderboards() {
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    db.entities.LeaderboardEntry.list('-tons_saved', 50)
      .then(setEntries)
      .catch(() => setEntries([]))
      .finally(() => setLoading(false));
  }, []);

  const localEntries = entries.filter((e) => e.scope === 'local').sort((a, b) => a.rank - b.rank);
  const globalEntries = entries.filter((e) => e.scope === 'global').sort((a, b) => a.rank - b.rank);

  return (
    <div className="space-y-4">
      <LeaderboardPanel title="Hong Kong Leaderboard" icon={MapPin} entries={localEntries} loading={loading} />
      <LeaderboardPanel title="Global Leaderboard" icon={Globe} entries={globalEntries} loading={loading} />
      <SDGActionExplorer />
    </div>
  );
}