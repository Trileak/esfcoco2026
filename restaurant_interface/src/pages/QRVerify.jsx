import { useEffect, useState, useCallback } from 'react';
import QRCodeDisplay from '@/components/QRCodeDisplay';
import BakerySelector from '@/components/BakerySelector';
import { ShieldCheck, ScanLine, Lock, RefreshCw, Unlock, Store } from 'lucide-react';

export default function QRVerify() {
  const [selectedStop, setSelectedStop] = useState(null);
  const [code, setCode] = useState('');
  const [seconds, setSeconds] = useState(30);

  const generateCode = useCallback(() => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    const part = (n) => Array.from({ length: n }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
    setCode(`FB-${part(4)}-${part(4)}`);
  }, []);

  useEffect(() => { generateCode(); }, [generateCode]);

  useEffect(() => {
    if (seconds <= 0) {
      generateCode();
      setSeconds(30);
      return;
    }
    const timer = setTimeout(() => setSeconds(s => s - 1), 1000);
    return () => clearTimeout(timer);
  }, [seconds, generateCode]);

  if (!selectedStop) {
    return <BakerySelector onSelect={setSelectedStop} />;
  }

  return (
    <div className="h-full overflow-y-auto p-4 space-y-5">
      <div className="flex items-center gap-3 bg-secondary/50 border border-border rounded-2xl p-3">
        <div className="w-9 h-9 rounded-xl bg-primary/20 text-primary flex items-center justify-center flex-shrink-0">
          <Store size={18} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-[10px] text-muted-foreground uppercase tracking-wider">Verifying at</div>
          <div className="font-bold text-sm truncate">{selectedStop.restaurant_name}</div>
        </div>
        <button
          onClick={() => setSelectedStop(null)}
          className="text-xs text-muted-foreground hover:text-primary transition-colors flex-shrink-0"
        >
          Change
        </button>
      </div>

      <div>
        <h1 className="text-2xl font-bold">QR Verification</h1>
        <p className="text-sm text-muted-foreground">Two-way secure authentication</p>
      </div>

      <div className="bg-secondary/50 border border-border rounded-2xl p-6 flex flex-col items-center gap-4">
        <div className="flex items-center gap-2 text-primary">
          <Lock size={16} />
          <span className="text-xs font-semibold uppercase tracking-wider">Secure Access Code</span>
        </div>

        <div className="relative">
          <div
            className="absolute inset-0 border-2 border-primary/20 rounded-2xl animate-spin pointer-events-none"
            style={{ animationDuration: '8s' }}
          />
          <div className="absolute -inset-2 border border-dashed border-accent/20 rounded-2xl animate-spin pointer-events-none" style={{ animationDuration: '12s', animationDirection: 'reverse' }} />
          <div className="bg-background p-4 rounded-2xl relative">
            <QRCodeDisplay value={code} size={200} />
          </div>
        </div>

        <div className="text-center">
          <div className="font-mono font-bold text-lg text-primary tracking-wider">{code}</div>
          <div className="text-xs text-muted-foreground mt-1">Expires in {seconds}s</div>
        </div>

        <button
          onClick={() => { generateCode(); setSeconds(30); }}
          className="flex items-center gap-2 text-xs text-muted-foreground hover:text-primary transition-colors"
        >
          <RefreshCw size={12} /> Regenerate Code
        </button>
      </div>

      <div className="bg-secondary/50 border border-border rounded-2xl p-5 space-y-3">
        <div className="flex items-center gap-2">
          <ScanLine size={18} className="text-primary" />
          <h3 className="font-bold text-sm">How It Works</h3>
        </div>
        <div className="space-y-3">
          {[
            { icon: ScanLine, text: 'Present this QR code to the storage bin scanner' },
            { icon: ShieldCheck, text: 'Scanner verifies code against dispatch system' },
            { icon: Unlock, text: 'Food compartment unlocks automatically upon match' },
          ].map((step, i) => (
            <div key={i} className="flex items-start gap-3">
              <div className="w-7 h-7 rounded-full bg-primary/20 text-primary text-xs font-bold flex items-center justify-center flex-shrink-0">
                {i + 1}
              </div>
              <p className="text-xs text-muted-foreground pt-1">{step.text}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground pb-2">
        <ShieldCheck size={14} className="text-green-500" />
        End-to-end encrypted · Two-way verified
      </div>
    </div>
  );
}