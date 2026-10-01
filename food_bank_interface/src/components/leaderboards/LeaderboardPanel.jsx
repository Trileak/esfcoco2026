import React from 'react';
import { Crown, MapPin } from 'lucide-react';

const TIER_STYLES = {
  Platinum: 'bg-green-400/15 text-green-300 border-green-400/30',
  Gold: 'bg-green-500/15 text-green-400 border-green-500/30',
  Silver: 'bg-green-600/15 text-green-500 border-green-600/30',
  Bronze: 'bg-green-700/15 text-green-600 border-green-700/30',
};

export default function LeaderboardPanel({ title, icon: Icon, entries, loading }) {
  return (
    <div className="glass-panel rounded-2xl p-4">
      <div className="flex items-center gap-2 mb-3">
        <Icon className="w-4 h-4 text-primary" />
        <h3 className="text-sm font-bold">{title}</h3>
      </div>
      {loading ? (
        <div className="space-y-2">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-12 rounded-xl bg-muted/30 animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="space-y-2">
          {entries.map((entry) => (
            <div
              key={entry.id}
              className={`flex items-center gap-3 p-2.5 rounded-xl transition-all ${
                entry.is_current_user
                  ? 'bg-primary/10 border border-primary/50'
                  : 'bg-muted/20'
              }`}
            >
              <span
                className={`w-7 h-7 rounded-lg flex items-center justify-center text-sm font-bold flex-shrink-0 ${
                  entry.rank === 1
                    ? 'bg-primary/20 text-primary'
                    : entry.rank === 2
                    ? 'bg-gray-300/20 text-gray-200'
                    : entry.rank === 3
                    ? 'bg-orange-700/20 text-orange-500'
                    : 'bg-muted text-muted-foreground'
                }`}
              >
                {entry.rank === 1 ? <Crown className="w-3.5 h-3.5" /> : entry.rank}
              </span>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{entry.name}</p>
                <p className="text-xs text-muted-foreground flex items-center gap-1">
                  <MapPin className="w-3 h-3" /> {entry.location}
                </p>
              </div>
              <div className="text-right flex-shrink-0">
                <p className="text-sm font-bold text-primary">{(entry.tons_saved * 1000).toLocaleString()}kg</p>
                <span className={`text-[10px] px-1.5 py-0.5 rounded border ${TIER_STYLES[entry.tier] || ''}`}>
                  {entry.tier}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}