import React, { useState, useEffect } from 'react';
import { Boxes, Lock, RefreshCw } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';

export default function StorageMonitor() {
  const [qrCode, setQrCode] = useState(null);
  const [generating, setGenerating] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState(30);

  useEffect(() => {
    generateQR();
  }, []);

  useEffect(() => {
    if (!qrCode) return;
    if (secondsLeft <= 0) {
      generateQR();
      return;
    }
    const timer = setTimeout(() => setSecondsLeft((s) => s - 1), 1000);
    return () => clearTimeout(timer);
  }, [secondsLeft, qrCode]);

  const generateQR = () => {
    setGenerating(true);
    setTimeout(() => {
      const part = () => Math.random().toString(36).substring(2, 6).toUpperCase();
      setQrCode(`FB-${part()}-${part()}`);
      setSecondsLeft(30);
      setGenerating(false);
    }, 800);
  };

  return (
    <div className="space-y-4">
      {/* Storage status + Conveyor speed */}
      <div className="glass-panel rounded-2xl p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-green-400/15 flex items-center justify-center">
              <Boxes className="w-4 h-4 text-green-400" />
            </div>
            <div>
              <h2 className="text-sm font-bold">Smart Storage Bin</h2>
              <p className="text-xs text-muted-foreground">Bin #HK-4472 · Central</p>
            </div>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
            <span className="text-xs text-green-400 font-medium">Active</span>
          </div>
        </div>

      </div>

      {/* QR Verification */}
      <div className="glass-panel rounded-2xl p-5">
        <div className="flex items-center gap-2 mb-4">
          <Lock className="w-4 h-4 text-primary" />
          <span className="text-sm font-bold tracking-widest text-primary">SECURE ACCESS CODE</span>
        </div>

        {/* QR code with wireframe background */}
        <div className="relative flex items-center justify-center mb-4 py-2">
          <div className="absolute w-44 h-44 border border-primary/20 rotate-12 rounded-lg" />
          <div className="absolute w-44 h-44 border border-primary/10 -rotate-6 rounded-lg" />
          <div className="relative rounded-xl bg-black p-3 z-10">
            {qrCode ? (
              <QRCodeSVG value={qrCode} size={140} fgColor="#e67b35" bgColor="#000000" level="M" />
            ) : (
              <div className="w-[140px] h-[140px] flex items-center justify-center">
                <div className="w-6 h-6 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
              </div>
            )}
          </div>
        </div>

        <p className="text-center text-base font-mono font-bold text-white tracking-widest mb-1">
          {qrCode || 'Generating...'}
        </p>
        <p className="text-center text-xs text-muted-foreground mb-4">Expires in {secondsLeft}s</p>

        <button
          onClick={generateQR}
          disabled={generating}
          className="w-full py-2.5 flex items-center justify-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 ${generating ? 'animate-spin' : ''}`} />
          Regenerate Code
        </button>
      </div>
    </div>
  );
}