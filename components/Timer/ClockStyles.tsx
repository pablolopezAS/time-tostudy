
import React, { useMemo } from 'react';
import { motion } from 'framer-motion';

interface ClockProps {
  seconds: number;
  isPaused: boolean;
}

const formatTime = (total: number) => {
  const m = Math.floor(total / 60);
  const s = total % 60;
  return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
};

export const MinimalistClock: React.FC<ClockProps> = ({ seconds }) => (
  <div className="text-[20vw] md:text-[120px] font-thin tracking-tighter text-slate-800/80 font-mono tabular-nums leading-none">
    {formatTime(seconds)}
  </div>
);

export const CircularClock: React.FC<ClockProps> = ({ seconds }) => {
  const progress = (seconds % 3600) / 3600;
  return (
    <div className="relative w-48 h-48 md:w-64 md:h-64 flex items-center justify-center shrink-0">
      <svg className="w-full h-full transform -rotate-90">
        <circle cx="50%" cy="50%" r="45%" className="stroke-white/30 fill-none" strokeWidth="8" />
        <motion.circle 
          cx="50%" cy="50%" r="45%" className="stroke-indigo-400 fill-none" strokeWidth="8"
          strokeDasharray="283%" strokeDashoffset={283 * (1 - progress) + "%"} strokeLinecap="round"
        />
      </svg>
      <div className="absolute text-3xl md:text-4xl font-light tabular-nums">{formatTime(seconds)}</div>
    </div>
  );
};

export const FlipClock: React.FC<ClockProps> = ({ seconds }) => {
  const m = Math.floor(seconds / 60).toString().padStart(2, '0');
  const s = (seconds % 60).toString().padStart(2, '0');
  return (
    <div className="flex gap-2 md:gap-4 scale-75 md:scale-100">
      {[m, s].map((part, i) => (
        <div key={i} className="flex gap-1">
          {part.split('').map((char, j) => (
            <motion.div 
              key={j} animate={{ rotateX: [0, 90, 0] }} transition={{ duration: 0.5 }}
              className="w-12 h-20 md:w-16 md:h-24 bg-white/40 glass border border-white/60 rounded-xl flex items-center justify-center text-4xl md:text-5xl font-bold text-indigo-800"
            >
              {char}
            </motion.div>
          ))}
        </div>
      ))}
    </div>
  );
};

export const VerticalClock: React.FC<ClockProps> = ({ seconds }) => (
  <div className="w-64 md:w-80 h-24 md:h-32 glass rounded-full p-2 flex flex-row relative shrink-0 overflow-hidden">
    <motion.div 
      initial={{ width: 0 }}
      animate={{ width: `${(seconds % 60) * 1.66}%` }} 
      className="h-full bg-indigo-300 rounded-full" 
    />
    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-3xl md:text-4xl font-black text-slate-800/80 whitespace-nowrap tabular-nums tracking-tighter">
      {formatTime(seconds)}
    </div>
  </div>
);

export const OrbitalClock: React.FC<ClockProps> = ({ seconds }) => {
  const rotation = (seconds % 60) * 6;
  return (
    <div className="w-56 h-56 md:w-72 md:h-72 border-2 border-dashed border-white/50 rounded-full flex items-center justify-center relative shrink-0">
      <motion.div style={{ rotate: rotation }} className="absolute w-full h-full top-0 left-0">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-4 h-4 bg-indigo-400 rounded-full shadow-lg" />
      </motion.div>
      <div className="text-4xl md:text-5xl font-light tabular-nums">{formatTime(seconds)}</div>
    </div>
  );
};

export const TypographicClock: React.FC<ClockProps> = ({ seconds }) => {
  const words = useMemo(() => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    let res = "";
    if (m > 0) res += `${m} minutos `;
    if (s > 0) res += `${s} segundos `;
    return res || "Recién empezado";
  }, [seconds]);
  
  return (
    <div className="max-w-xs md:max-w-md text-center text-xl md:text-3xl font-light leading-relaxed italic text-indigo-700 px-4">
      Llevas <span className="font-bold underline decoration-indigo-200">{words}</span> en total concentración.
    </div>
  );
};
