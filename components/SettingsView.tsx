
import React, { useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Session, Subject } from '../types';
import { BarChart3, TrendingUp, BookOpen, X, Maximize2 } from 'lucide-react';

interface StatsViewProps {
  sessions: Session[];
  subjects: Subject[];
}

const StatsView: React.FC<StatsViewProps> = ({ sessions, subjects }) => {
  const [zoomedGraph, setZoomedGraph] = useState<'total' | 'subject' | null>(null);

  const getWeekNumber = (d: Date) => {
    const date = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
    const dayNum = date.getUTCDay() || 7;
    date.setUTCDate(date.getUTCDate() + 4 - dayNum);
    const yearStart = new Date(Date.UTC(date.getUTCFullYear(), 0, 1));
    return Math.ceil((((date.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
  };

  const months = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];

  const statsData = useMemo(() => {
    // Agrupar por mes y semana
    const totalByWeek: Record<string, number> = {};
    const subjectByWeek: Record<string, Record<string, number>> = {};
    
    sessions.forEach(s => {
      const date = new Date(s.date);
      const week = getWeekNumber(date);
      const month = date.getMonth();
      const key = `${month}-${week}`;

      totalByWeek[key] = (totalByWeek[key] || 0) + s.duration;
      
      if (!subjectByWeek[s.subjectId]) subjectByWeek[s.subjectId] = {};
      subjectByWeek[s.subjectId][key] = (subjectByWeek[s.subjectId][key] || 0) + s.duration;
    });

    return { totalByWeek, subjectByWeek };
  }, [sessions]);

  const DotPlot = ({ data, color, isLarge = false }: { data: Record<string, number>, color: string, isLarge?: boolean }) => {
    const maxVal = Math.max(...Object.values(data), 3600); // Mínimo 1h para escala

    return (
      <div className="w-full h-full flex flex-col pt-4">
        <div className="flex-1 relative border-l border-b border-slate-200/50">
          {/* Ejes y cuadrícula */}
          <div className="absolute left-0 bottom-0 w-full h-full pointer-events-none opacity-20">
             {[0, 0.25, 0.5, 0.75, 1].map(v => (
               <div key={v} className="absolute w-full border-t border-slate-300" style={{ bottom: `${v * 100}%` }} />
             ))}
          </div>

          {/* Puntos */}
          <div className="absolute inset-0 flex items-end">
            {months.map((m, mIdx) => (
              <div key={m} className="flex-1 h-full flex items-end relative border-r border-slate-100/30">
                {/* Visualizar puntos por cada mes (aproximadamente 4 semanas por mes para visualización) */}
                {[1, 2, 3, 4, 5].map(wOffset => {
                   // Este es un hack visual para posicionar los puntos secuencialmente
                   // En una app real usaríamos la semana real del año
                   const mockWeek = mIdx * 4 + wOffset;
                   const keys = Object.keys(data).filter(k => k.startsWith(`${mIdx}-`));
                   const value = keys.length > 0 ? (data[keys[0]] || 0) : 0; // Simplificado para demo
                   if (value === 0) return null;

                   const intensity = Math.min((value / maxVal) * 100, 100);
                   const yPos = (value / maxVal) * 85;

                   return (
                     <motion.div 
                        key={mockWeek}
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className="absolute w-2 h-2 rounded-full cursor-help group"
                        style={{ 
                          left: `${(wOffset/5) * 100}%`, 
                          bottom: `${yPos}%`,
                          backgroundColor: color,
                          boxShadow: `0 0 10px ${color}44`,
                          width: isLarge ? '12px' : '8px',
                          height: isLarge ? '12px' : '8px'
                        }}
                     >
                       <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block z-50">
                          <div className="bg-slate-800 text-white text-[10px] px-2 py-1 rounded whitespace-nowrap shadow-xl">
                            {Math.round(value/60)} min
                          </div>
                       </div>
                     </motion.div>
                   );
                })}
              </div>
            ))}
          </div>
        </div>
        {/* Etiquetas X */}
        <div className="flex justify-between mt-2 px-1">
          {months.map(m => (
            <span key={m} className="text-[8px] md:text-[10px] font-black text-slate-400 uppercase tracking-tighter">{m}</span>
          ))}
        </div>
      </div>
    );
  };

  const SubjectDotPlot = ({ isLarge = false }: { isLarge?: boolean }) => {
    const maxVal = useMemo(() => {
      let max = 3600;
      Object.values(statsData.subjectByWeek).forEach(weeks => {
        Object.values(weeks).forEach(v => { if (v > max) max = v; });
      });
      return max;
    }, [statsData]);

    return (
      <div className="w-full h-full flex flex-col pt-4">
        <div className="flex-1 relative border-l border-b border-slate-200/50">
          <div className="absolute inset-0 flex items-end">
            {months.map((m, mIdx) => (
              <div key={m} className="flex-1 h-full flex items-end relative border-r border-slate-100/30">
                {subjects.map((sub, sIdx) => {
                  const subData = statsData.subjectByWeek[sub.id] || {};
                  const keys = Object.keys(subData).filter(k => k.startsWith(`${mIdx}-`));
                  const value = keys.length > 0 ? subData[keys[0]] : 0;
                  if (!value) return null;

                  const yPos = (value / maxVal) * 85;
                  return (
                    <motion.div 
                      key={sub.id}
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="absolute rounded-full"
                      style={{ 
                        left: `${(sIdx / subjects.length) * 100}%`,
                        bottom: `${yPos}%`,
                        backgroundColor: sub.color,
                        width: isLarge ? '10px' : '6px',
                        height: isLarge ? '10px' : '6px',
                        zIndex: sIdx
                      }}
                    />
                  );
                })}
              </div>
            ))}
          </div>
        </div>
        <div className="flex justify-between mt-2 px-1">
          {months.map(m => (
            <span key={m} className="text-[8px] md:text-[10px] font-black text-slate-400 uppercase tracking-tighter">{m}</span>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="max-w-6xl mx-auto px-4 md:px-6 py-6 md:py-10 space-y-8 mb-20 md:mb-0">
      <header>
        <h1 className="text-3xl font-black text-slate-800 uppercase tracking-tight">Estadísticas</h1>
        <p className="text-slate-500 font-bold uppercase tracking-widest text-[10px] mt-1 italic">Analítica de rendimiento temporal</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-10">
        {/* GRÁFICA TOTAL */}
        <motion.div 
          onClick={() => setZoomedGraph('total')}
          className="glass rounded-[2.5rem] p-8 border border-white/60 shadow-xl hover:shadow-2xl transition-all cursor-pointer group relative overflow-hidden h-[400px] flex flex-col"
        >
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-indigo-500 rounded-xl flex items-center justify-center text-white shadow-lg">
                <TrendingUp size={20} />
              </div>
              <h3 className="font-black text-slate-700 uppercase tracking-tight">Estudio Total</h3>
            </div>
            <Maximize2 size={18} className="text-slate-300 group-hover:text-indigo-400 transition-colors" />
          </div>
          <div className="flex-1">
            <DotPlot data={statsData.totalByWeek} color="#6366f1" />
          </div>
          <p className="text-[9px] font-black text-slate-300 uppercase tracking-[0.2em] mt-4">Puntos por semana / Minutos vs Mes</p>
        </motion.div>

        {/* GRÁFICA POR ASIGNATURA */}
        <motion.div 
          onClick={() => setZoomedGraph('subject')}
          className="glass rounded-[2.5rem] p-8 border border-white/60 shadow-xl hover:shadow-2xl transition-all cursor-pointer group relative overflow-hidden h-[400px] flex flex-col"
        >
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-emerald-500 rounded-xl flex items-center justify-center text-white shadow-lg">
                <BookOpen size={20} />
              </div>
              <h3 className="font-black text-slate-700 uppercase tracking-tight">Por Asignatura</h3>
            </div>
            <Maximize2 size={18} className="text-slate-300 group-hover:text-emerald-400 transition-colors" />
          </div>
          <div className="flex-1">
            <SubjectDotPlot />
          </div>
          <div className="flex flex-wrap gap-2 mt-4">
            {subjects.slice(0, 4).map(s => (
              <div key={s.id} className="flex items-center gap-1">
                <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: s.color }} />
                <span className="text-[8px] font-bold text-slate-400 uppercase">{s.name}</span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* MODAL ZOOM */}
      <AnimatePresence>
        {zoomedGraph && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 md:p-10">
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setZoomedGraph(null)}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-xl"
            />
            <motion.div 
              layoutId={zoomedGraph}
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="relative w-full max-w-5xl aspect-video glass rounded-[3rem] p-8 md:p-12 shadow-2xl border border-white/40 flex flex-col"
            >
              <button 
                onClick={() => setZoomedGraph(null)}
                className="absolute top-6 right-6 p-3 bg-white/50 rounded-full text-slate-400 hover:text-rose-500 transition-all shadow-sm"
              >
                <X size={24} />
              </button>
              
              <div className="flex items-center gap-4 mb-10">
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-white shadow-xl ${zoomedGraph === 'total' ? 'bg-indigo-500' : 'bg-emerald-500'}`}>
                  {zoomedGraph === 'total' ? <TrendingUp size={32} /> : <BookOpen size={32} />}
                </div>
                <div>
                  <h2 className="text-3xl font-black text-slate-800 uppercase tracking-tight">
                    {zoomedGraph === 'total' ? 'Análisis Temporal Total' : 'Distribución por Materia'}
                  </h2>
                  <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">Visualización de puntos de concentración</p>
                </div>
              </div>

              <div className="flex-1 min-h-0 bg-white/30 rounded-[2rem] p-8 border border-white/40">
                {zoomedGraph === 'total' ? (
                  <DotPlot data={statsData.totalByWeek} color="#6366f1" isLarge />
                ) : (
                  <SubjectDotPlot isLarge />
                )}
              </div>

              <div className="mt-8 flex justify-between items-center">
                 <div className="flex gap-6">
                    <div className="flex flex-col">
                      <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest">Sesiones</span>
                      <span className="text-xl font-bold text-slate-700">{sessions.length}</span>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest">Total</span>
                      <span className="text-xl font-bold text-slate-700">{Math.round(sessions.reduce((acc, s) => acc + s.duration, 0) / 3600)}h</span>
                    </div>
                 </div>
                 {zoomedGraph === 'subject' && (
                    <div className="flex gap-4">
                       {subjects.map(s => (
                         <div key={s.id} className="flex items-center gap-2 px-3 py-1.5 bg-white/50 rounded-lg border border-white/50 shadow-sm">
                           <div className="w-2 h-2 rounded-full" style={{ backgroundColor: s.color }} />
                           <span className="text-[10px] font-black text-slate-600 uppercase">{s.name}</span>
                         </div>
                       ))}
                    </div>
                 )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default StatsView;
