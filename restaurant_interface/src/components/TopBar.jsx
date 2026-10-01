import { Croissant } from 'lucide-react';

export default function TopBar() {
  return (
    <header className="bg-card border-b border-border px-4 py-2.5 flex items-center gap-2 flex-shrink-0">
      <div className="w-7 h-7 rounded-lg bg-primary/15 flex items-center justify-center">
        <Croissant size={16} className="text-primary" />
      </div>
      <span className="font-bold text-sm tracking-tight">BreadBox</span>
    </header>
  );
}