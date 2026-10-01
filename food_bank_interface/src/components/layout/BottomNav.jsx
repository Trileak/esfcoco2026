import React from 'react';
import { CalendarClock, Trophy } from 'lucide-react';

export default function BottomNav({ activeTab, onTabChange }) {
  const tabs = [
    { id: 'shelf', label: 'Pickup', icon: CalendarClock },
    { id: 'leaderboards', label: 'Leaderboards', icon: Trophy },
  ];

  return (
    <div className="sticky bottom-0 z-30 bg-[rgb(30_28_26)] border-t border-border/50 px-5 py-3 flex justify-around">
      {tabs.map((tab) => {
        const Icon = tab.icon;
        const isActive = activeTab === tab.id;
        return (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={`flex flex-col items-center gap-1 px-6 py-1.5 rounded-xl transition-all ${
              isActive ? 'text-primary' : 'text-muted-foreground'
            }`}
          >
            <Icon className="w-5 h-5" />
            <span className="text-xs font-medium">{tab.label}</span>
            {isActive && <div className="w-1 h-1 rounded-full bg-primary" />}
          </button>
        );
      })}
    </div>
  );
}