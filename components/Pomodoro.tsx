import React, { useState, useEffect } from 'react';
import { Play, Pause, RotateCcw, Coffee, Zap as Focus } from 'lucide-react';
import { motion } from 'framer-motion';
import { TourTip } from './TourTip';

interface PomodoroProps {
  showTour?: boolean;
}

export const Pomodoro: React.FC<PomodoroProps> = ({ showTour = false }) => {
  const [timeLeft, setTimeLeft] = useState(25 * 60);
  const [isActive, setIsActive] = useState(false);
  const [mode, setMode] = useState<'focus' | 'break'>('focus');

  useEffect(() => {
    let interval: any = null;
    if (isActive && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      // Switch mode automatically
      if (mode === 'focus') {
        setMode('break');
        setTimeLeft(5 * 60);
      } else {
        setMode('focus');
        setTimeLeft(25 * 60);
      }
      setIsActive(false);
    }
    return () => clearInterval(interval);
  }, [isActive, timeLeft, mode]);

  const toggleTimer = () => setIsActive(!isActive);

  const resetTimer = () => {
    setIsActive(false);
    setTimeLeft(mode === 'focus' ? 25 * 60 : 5 * 60);
  };

  const switchMode = (newMode: 'focus' | 'break') => {
    setMode(newMode);
    setIsActive(false);
    setTimeLeft(newMode === 'focus' ? 25 * 60 : 5 * 60);
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const progress = mode === 'focus'
    ? ((25 * 60 - timeLeft) / (25 * 60)) * 100
    : ((5 * 60 - timeLeft) / (5 * 60)) * 100;

  return (
    <>
      {showTour && (
        <TourTip
          title="Método Pomodoro"
          text="Use o timer para focar nos estudos (geralmente 25min) alternando com pausas curtas (5min)."
        />
      )}
      <div className="bg-white rounded-3xl shadow-sm border border-zinc-100 p-8 flex flex-col items-center">
      <div className="flex gap-4 mb-8 bg-zinc-100 p-1.5 rounded-xl">
        <button
          onClick={() => switchMode('focus')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg font-bold text-sm transition-all ${mode === 'focus' ? 'bg-white text-zinc-900 shadow-sm' : 'text-zinc-500'}`}
        >
          <Focus className="w-4 h-4" /> Focus
        </button>
        <button
          onClick={() => switchMode('break')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg font-bold text-sm transition-all ${mode === 'break' ? 'bg-white text-zinc-900 shadow-sm' : 'text-zinc-500'}`}
        >
          <Coffee className="w-4 h-4" /> Break
        </button>
      </div>

      <div className="relative w-48 h-48 mb-8 flex flex-col items-center justify-center">
        <svg className="absolute inset-0 w-full h-full transform -rotate-90">
          <circle cx="96" cy="96" r="88" className="stroke-zinc-100" strokeWidth="8" fill="none" />
          <motion.circle
            cx="96" cy="96" r="88"
            className={mode === 'focus' ? 'stroke-emerald-500' : 'stroke-blue-500'}
            strokeWidth="8" fill="none"
            strokeLinecap="round"
            strokeDasharray="552"
            animate={{ strokeDashoffset: 552 - (552 * progress) / 100 }}
            transition={{ duration: 0.5 }}
          />
        </svg>
        <div className="relative z-10 text-5xl font-black text-zinc-800 tracking-tighter">
          {formatTime(timeLeft)}
        </div>
      </div>

      <div className="flex gap-4">
        <button
          onClick={toggleTimer}
          className={`w-14 h-14 rounded-full flex items-center justify-center text-white shadow-lg transition-transform hover:scale-105 active:scale-95 ${mode === 'focus' ? 'bg-zinc-900' : 'bg-blue-600'}`}
        >
          {isActive ? <Pause className="w-6 h-6 fill-current" /> : <Play className="w-6 h-6 fill-current ml-1" />}
        </button>
        <button
          onClick={resetTimer}
          className="w-14 h-14 rounded-full bg-zinc-100 text-zinc-600 flex items-center justify-center hover:bg-zinc-200 transition-colors"
        >
          <RotateCcw className="w-6 h-6" />
        </button>
      </div>
    </div>
    </>
  );
};
