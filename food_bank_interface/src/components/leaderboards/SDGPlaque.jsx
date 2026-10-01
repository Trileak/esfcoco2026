import React from 'react';
import { Award, Leaf } from 'lucide-react';

const SDG_COLORS = [
  '#E5243B', '#DDA63A', '#4C9F38', '#C5192D', '#FF3A21',
  '#26BDE2', '#FCC30B', '#A21942', '#FD6925', '#DD1367',
  '#FD9D24', '#BF8B2E', '#3F7E44', '#0A97D9', '#56C02B',
  '#00689D', '#19486A',
];

export default function SDGPlaque() {
  return (
    <div className="relative rounded-2xl p-[2px] bg-primary">
      <div className="rounded-2xl bg-card p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center">
              <Award className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-sm font-bold">SDG Certified Partner</p>
              <p className="text-xs text-muted-foreground">UN Sustainable Development Goals</p>
            </div>
          </div>
          <Leaf className="w-5 h-5 text-green-400" />
        </div>
        <div className="flex flex-wrap gap-1.5">
          {SDG_COLORS.map((color, i) => (
            <div
              key={i}
              className="w-6 h-6 rounded-md flex items-center justify-center text-[8px] font-bold text-white/90"
              style={{ backgroundColor: color }}
            >
              {i + 1}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}