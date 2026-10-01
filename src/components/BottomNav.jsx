import { NavLink } from 'react-router-dom';
import { Navigation, LayoutGrid, QrCode } from 'lucide-react';

const tabs = [
  { to: '/', icon: Navigation, label: 'Navigate' },
  { to: '/dispatch', icon: LayoutGrid, label: 'Dispatch' },
  { to: '/verify', icon: QrCode, label: 'Verify' },
];

export default function BottomNav() {
  return (
    <nav className="bg-card/90 backdrop-blur-lg border-t border-border px-6 py-3 flex justify-around flex-shrink-0">
      {tabs.map(({ to, icon: Icon, label }) => (
        <NavLink
          key={to}
          to={to}
          end={to === '/'}
          className={({ isActive }) =>
            `flex flex-col items-center gap-1 transition-colors ${isActive ? 'text-primary' : 'text-muted-foreground'}`
          }
        >
          {({ isActive }) => (
            <>
              <Icon size={22} strokeWidth={isActive ? 2.5 : 2} />
              <span className="text-[10px] font-medium">{label}</span>
            </>
          )}
        </NavLink>
      ))}
    </nav>
  );
}