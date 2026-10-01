const db = globalThis.__B44_DB__ || { auth:{ isAuthenticated: async()=>false, me: async()=>null }, entities:new Proxy({}, { get:()=>({ filter:async()=>[], get:async()=>null, create:async()=>({}), update:async()=>({}), delete:async()=>({}) }) }), integrations:{ Core:{ UploadFile:async()=>({ file_url:'' }) } } };

import React, { useState, useEffect } from 'react';
import { ChevronDown, Target, MapPin, Leaf } from 'lucide-react';

const SDG_GOALS = [
  { number: 2, title: 'Zero Hunger', color: '#DDA63A' },
  { number: 11, title: 'Sustainable Cities', color: '#FD9D24' },
  { number: 12, title: 'Responsible Consumption', color: '#BF8B2E' },
  { number: 13, title: 'Climate Action', color: '#3F7E44' },
];

export default function SDGActionExplorer() {
  const [actions, setActions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedSDG, setSelectedSDG] = useState(2);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  useEffect(() => {
    db.entities.SDGAction.list('-created_date', 50)
      .then(setActions)
      .catch(() => setActions([]))
      .finally(() => setLoading(false));
  }, []);

  const filteredActions = actions.filter((a) => a.sdg_number === selectedSDG);
  const currentSDG = SDG_GOALS.find((g) => g.number === selectedSDG);

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <Target className="w-5 h-5 text-primary" />
        <h2 className="text-base font-bold">SDG Impact Actions</h2>
      </div>

      {/* SDG Dropdown */}
      <div className="relative">
        <button
          onClick={() => setDropdownOpen(!dropdownOpen)}
          className="w-full glass-panel rounded-2xl p-4 flex items-center justify-between"
        >
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center text-lg font-bold text-white"
              style={{ backgroundColor: currentSDG?.color }}
            >
              {currentSDG?.number}
            </div>
            <div className="text-left">
              <p className="text-sm font-bold">SDG {currentSDG?.number}: {currentSDG?.title}</p>
              <p className="text-xs text-muted-foreground">{filteredActions.length} partners contributing</p>
            </div>
          </div>
          <ChevronDown className={`w-5 h-5 text-muted-foreground transition-transform ${dropdownOpen ? 'rotate-180' : ''}`} />
        </button>

        {dropdownOpen && (
          <div className="absolute top-full left-0 right-0 mt-2 glass-panel rounded-2xl p-2 z-20 space-y-1">
            {SDG_GOALS.map((goal) => (
              <button
                key={goal.number}
                onClick={() => {
                  setSelectedSDG(goal.number);
                  setDropdownOpen(false);
                }}
                className={`w-full flex items-center gap-3 p-2.5 rounded-xl transition-all ${
                  selectedSDG === goal.number ? 'bg-primary/10' : 'hover:bg-muted/30'
                }`}
              >
                <div
                  className="w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold text-white"
                  style={{ backgroundColor: goal.color }}
                >
                  {goal.number}
                </div>
                <span className="text-sm font-medium">SDG {goal.number}: {goal.title}</span>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Action cards */}
      {loading ? (
        <div className="space-y-2">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-20 rounded-xl bg-muted/30 animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="space-y-2">
          {filteredActions.map((action) => (
            <div key={action.id} className="glass-panel rounded-2xl p-3.5">
              <div className="flex items-start gap-3">
                <div
                  className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0"
                  style={{ backgroundColor: `${currentSDG?.color}20` }}
                >
                  <Leaf className="w-4 h-4" style={{ color: currentSDG?.color }} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <p className="text-sm font-bold truncate">{action.business_name}</p>
                    <span
                      className={`text-[10px] px-2 py-0.5 rounded-full flex-shrink-0 ml-2 ${
                        action.scope === 'local' ? 'bg-primary/15 text-primary' : 'bg-secondary/15 text-secondary'
                      }`}
                    >
                      {action.scope === 'local' ? 'HK' : 'Global'}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground flex items-center gap-1 mb-2">
                    <MapPin className="w-3 h-3" /> {action.location}
                  </p>
                  <p className="text-xs text-foreground/80 leading-relaxed">{action.action_description}</p>
                </div>
              </div>
            </div>
          ))}
          {filteredActions.length === 0 && (
            <div className="glass-panel rounded-2xl p-6 text-center">
              <p className="text-sm text-muted-foreground">No partners contributing to this SDG yet.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}