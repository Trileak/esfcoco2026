import React, { useState } from 'react';
import { Bell, Croissant } from 'lucide-react';
import CalendarBooking from '@/components/shelf/CalendarBooking';
import StorageMonitor from '@/components/shelf/StorageMonitor';
import SDGPlaque from '@/components/leaderboards/SDGPlaque';
import ResetDemoButton from '@/components/shelf/ResetDemoButton';
import Leaderboards from '@/components/leaderboards/Leaderboards';
import BottomNav from '@/components/layout/BottomNav';

export default function Home() {
  const [activeTab, setActiveTab] = useState('shelf');

  return (
    <div className="min-h-screen bg-background flex justify-center">
      <div className="w-full max-w-lg min-h-screen flex flex-col relative bg-[rgb(30_28_25)] border-x border-border">
        <header className="sticky top-0 z-30 glass-panel border-b border-border/50 px-5 py-3.5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
              <Croissant className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-base">BreadBox</span>
          </div>
          <button className="w-9 h-9 rounded-full glass-panel flex items-center justify-center relative">
            <Bell className="w-4 h-4 text-muted-foreground" />
            <div className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-primary" />
          </button>
        </header>

        <main className="flex-1 overflow-y-auto px-5 py-4 pb-24">
          {activeTab === 'shelf' ? (
            <div className="space-y-6">
              <CalendarBooking />
              <StorageMonitor />
              <SDGPlaque />
              <ResetDemoButton />
            </div>
          ) : (
            <Leaderboards />
          )}
        </main>

        <BottomNav activeTab={activeTab} onTabChange={setActiveTab} />
      </div>
    </div>
  );
}