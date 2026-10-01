import { Outlet } from 'react-router-dom';
import BottomNav from './BottomNav';
import TopBar from './TopBar';

export default function MobileLayout() {
  return (
    <div className="min-h-screen bg-background flex justify-center">
      <div className="w-full max-w-[430px] h-screen bg-card flex flex-col shadow-2xl overflow-hidden">
        <TopBar />
        <main className="flex-1 overflow-hidden min-h-0">
          <Outlet />
        </main>
        <BottomNav />
      </div>
    </div>
  );
}