import React from 'react';
import { Target } from 'lucide-react';

interface ProgressBarProps {
  currentDay: number;
  totalDays: number;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({ currentDay, totalDays }) => {
  const percent = Math.min(100, Math.round((currentDay / totalDays) * 100));

  return (
    <div className="w-full">
      <div className="flex justify-between items-end mb-3">
        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-emerald-100 rounded-lg">
            <Target className="w-5 h-5 text-emerald-600" />
          </div>
          <div>
            <span className="block text-sm font-bold text-zinc-800">Seu Progresso Global</span>
            <span className="block text-xs text-zinc-500">Rumo à aprovação</span>
          </div>
        </div>
        <div className="text-right">
          <span className="block text-2xl font-black text-emerald-500">{percent}%</span>
          <span className="text-xs font-medium text-zinc-400 uppercase tracking-widest">{currentDay} de {totalDays} dias</span>
        </div>
      </div>

      <div className="relative w-full bg-zinc-100 rounded-full h-3 overflow-hidden shadow-inner">
        <div
          className="absolute top-0 left-0 h-full bg-gradient-to-r from-emerald-400 to-emerald-600 rounded-full transition-all duration-700 ease-out"
          style={{ width: `${percent}%` }}
        >
          <div className="absolute inset-0 bg-white/20 w-full animate-[shimmer_2s_infinite] -translate-x-[100%] shadow-[0_0_10px_rgba(255,255,255,0.2)]"></div>
        </div>
      </div>
    </div>
  );
};

export default ProgressBar;
