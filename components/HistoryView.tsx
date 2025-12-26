
import React, { useState, useMemo } from 'react';
import { Session, Subject } from '../types';
import { 
  ChevronLeft, 
  ChevronRight, 
  ChevronDown, 
  Calendar as CalendarIcon, 
  BookOpen, 
  BarChart3, 
  LayoutList, 
  Clock, 
  Printer, 
  Loader2,
  X,
  CheckCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface HistoryProps {
  sessions: Session[];
  subjects: Subject[];
}

interface WeekData {
  key: string;
  start: Date;
  end: Date;
  total: number;
  subjects: Record<string, number>;
  sessionCount: number;
  sessions: Session[];
}

const HistoryView: React.FC<HistoryProps> = ({ sessions, subjects }) => {
  const todayStr = new Date().toISOString().split('T')[0];
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<string | null>(todayStr);
  const [selectedWeekKey, setSelectedWeekKey] = useState<string | null>(null);
  const [expandedWeek, setExpandedWeek] = useState<string | null>(null);
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);

  const formatTime = (s: number) => {
    if (s <= 0) return '0m';
    const h = Math.floor(s / 3600);
    const m = Math.floor((s % 3600) / 60);
    return h > 0 ? `${h}h ${m}m` : `${m}m`;
  };

  const getSubject = (id: string) => subjects.find(s => s.id === id);

  const changeMonth = (offset: number) => {
    const newDate = new Date(currentDate.getFullYear(), currentDate.getMonth() + offset, 1);
    setCurrentDate(newDate);
    setSelectedDate(null);
    setSelectedWeekKey(null);
    setExpandedWeek(null);
  };

  const monthName = new Intl.DateTimeFormat('es-ES', { month: 'long' }).format(currentDate);
  const year = currentDate.getFullYear();

  const calendarDays = useMemo(() => {
    const start = new Date(year, currentDate.getMonth(), 1);
    const end = new Date(year, currentDate.getMonth() + 1, 0);
    const days = [];
    let firstDay = start.getDay();
    const offset = firstDay === 0 ? 6 : firstDay - 1;
    for (let i = 0; i < offset; i++) days.push(null);
    for (let i = 1; i <= end.getDate(); i++) {
      days.push(new Date(year, currentDate.getMonth(), i).toISOString().split('T')[0]);
    }
    return days;
  }, [currentDate, year]);

  const sessionsByDate = useMemo(() => {
    const map: Record<string, { total: number; items: Session[] }> = {};
    sessions.forEach(s => {
      const d = s.date.split('T')[0];
      if (!map[d]) map[d] = { total: 0, items: [] };
      map[d].total += s.duration;
      map[d].items.push(s);
    });
    return map;
  }, [sessions]);

  const weeksData = useMemo<WeekData[]>(() => {
    const startOfMonth = new Date(year, currentDate.getMonth(), 1);
    const endOfMonth = new Date(year, currentDate.getMonth() + 1, 0);
    const firstMonday = new Date(startOfMonth);
    const day = firstMonday.getDay();
    const diff = firstMonday.getDate() - day + (day === 0 ? -6 : 1);
    firstMonday.setDate(diff);

    const weeks: WeekData[] = [];
    let currentWeekStart = new Date(firstMonday);

    while (currentWeekStart <= endOfMonth) {
      const weekEnd = new Date(currentWeekStart);
      weekEnd.setDate(currentWeekStart.getDate() + 6);
      const weekKey = `${currentWeekStart.toISOString().split('T')[0]}_${weekEnd.toISOString().split('T')[0]}`;
      const weekSessions = sessions.filter(s => {
        const d = new Date(s.date);
        return d >= currentWeekStart && d <= new Date(weekEnd.getTime() + 86399999);
      });
      const subjectsTime: Record<string, number> = {};
      weekSessions.forEach(s => {
        subjectsTime[s.subjectId] = (subjectsTime[s.subjectId] || 0) + s.duration;
      });
      weeks.push({
        key: weekKey,
        start: new Date(currentWeekStart),
        end: new Date(weekEnd),
        total: weekSessions.reduce((acc, s) => acc + s.duration, 0),
        subjects: subjectsTime,
        sessionCount: weekSessions.length,
        sessions: weekSessions
      });
      currentWeekStart.setDate(currentWeekStart.getDate() + 7);
    }
    return weeks;
  }, [currentDate, sessions, year]);

  // Manejo de la lógica de visualización del detalle
  const activeWeek = weeksData.find(w => w.key === selectedWeekKey);
  const displaySessions = activeWeek 
    ? activeWeek.sessions 
    : (selectedDate ? sessionsByDate[selectedDate]?.items || [] : []);
  
  const displayTitle = activeWeek
    ? `Semana ${activeWeek.start.toLocaleDateString()} - ${activeWeek.end.toLocaleDateString()}`
    : (selectedDate ? new Date(selectedDate).toLocaleDateString('es-ES', { day: 'numeric', month: 'long' }) : "Selecciona una fecha");

  const totalMonthlyTime = useMemo<number>(() => {
    return weeksData.reduce((acc: number, w: WeekData): number => {
      return acc + (w.total || 0);
    }, 0);
  }, [weeksData]);

  const averageWeeklyTime = useMemo<number>(() => {
    const activeWeeks = weeksData.filter(w => (w.total || 0) > 0).length;
    const weeksCount = activeWeeks || 1;
    return totalMonthlyTime / weeksCount;
  }, [weeksData, totalMonthlyTime]);

  const handlePrint = () => {
    setIsGeneratingPDF(true);
    setTimeout(() => {
      window.print();
      setIsGeneratingPDF(false);
    }, 1500);
  };

  const handleWeekClick = (weekKey: string) => {
    if (selectedWeekKey === weekKey) {
      setSelectedWeekKey(null);
    } else {
      setSelectedWeekKey(weekKey);
      setSelectedDate(null); // Desactivar fecha individual si se selecciona semana
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 sm:py-10 space-y-10 pb-40">
      {/* OVERLAY DE CARGA PARA PDF */}
      <AnimatePresence>
        {isGeneratingPDF && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[300] flex items-center justify-center bg-white/60 backdrop-blur-2xl print:hidden"
          >
            <div className="text-center space-y-6">
              <motion.div 
                animate={{ rotate: 360 }}
                transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                className="inline-block"
              >
                <Loader2 size={48} className="text-indigo-600" />
              </motion.div>
              <div>
                <h3 className="text-2xl font-black text-slate-800 uppercase tracking-tight">Generando Reporte</h3>
                <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px] mt-2">Preparando analítica del mes...</p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="hidden print:flex items-center justify-between border-b-2 border-slate-800 pb-6 mb-8">
        <div>
          <h1 className="text-3xl font-black uppercase tracking-tighter">Reporte Mensual de Estudio</h1>
          <p className="text-sm font-bold text-slate-500 uppercase tracking-widest">{monthName} {year}</p>
        </div>
        <div className="text-right">
          <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest">TimeToStudy • Analítica</p>
          <p className="text-xs font-bold text-slate-600">Generado el {new Date().toLocaleDateString()}</p>
        </div>
      </div>

      {/* HEADER CON NAVEGACIÓN */}
      <header className="flex flex-col sm:flex-row items-center justify-between gap-6 print:hidden">
        <div>
          <h1 className="text-3xl font-black text-slate-800 tracking-tight uppercase">Historial</h1>
          <p className="text-slate-500 font-medium italic text-sm">Calendario y análisis de rendimiento.</p>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-4 bg-white/40 p-2 rounded-2xl border border-white/60 shadow-sm">
            <button onClick={() => changeMonth(-1)} className="p-2 hover:bg-white rounded-xl transition-all text-slate-400 hover:text-indigo-600">
              <ChevronLeft size={24} />
            </button>
            <div className="text-center min-w-[140px]">
              <h2 className="text-lg font-black text-slate-700 capitalize leading-none">{monthName}</h2>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">{year}</p>
            </div>
            <button onClick={() => changeMonth(1)} className="p-2 hover:bg-white rounded-xl transition-all text-slate-400 hover:text-indigo-600">
              <ChevronRight size={24} />
            </button>
          </div>
          <button 
            onClick={handlePrint}
            className="p-4 bg-white/60 text-slate-600 rounded-2xl border border-white shadow-sm hover:text-indigo-600 hover:bg-white transition-all"
            title="Exportar Reporte PDF"
          >
            <Printer size={24} />
          </button>
        </div>
      </header>

      {/* CALENDARIO */}
      <div className="glass rounded-[2.5rem] p-5 sm:p-8 border border-white/60 shadow-xl bg-white/40 print:shadow-none print:border-slate-200">
        <div className="grid grid-cols-7 gap-2 sm:gap-3 mb-6 text-center text-[10px] font-black text-slate-300 uppercase tracking-widest">
          {['L', 'M', 'X', 'J', 'V', 'S', 'D'].map(d => <div key={d}>{d}</div>)}
        </div>
        <div className="grid grid-cols-7 gap-1.5 sm:gap-3">
          {calendarDays.map((date, i) => {
            if (!date) return <div key={`empty-${i}`} className="aspect-square sm:aspect-[4/5]" />;
            const dayNum = new Date(date).getDate();
            const hasData = sessionsByDate[date];
            const isSelected = selectedDate === date;
            const isToday = new Date().toISOString().split('T')[0] === date;

            return (
              <button
                key={date}
                onClick={() => { setSelectedDate(date); setSelectedWeekKey(null); }}
                className={`relative aspect-square sm:aspect-[4/5] rounded-xl sm:rounded-2xl border transition-all flex flex-col p-2 sm:p-3 print:bg-white print:border-slate-100 ${
                  isSelected ? 'bg-indigo-500 text-white border-indigo-500 shadow-lg print:border-indigo-500' :
                  isToday ? 'bg-white border-indigo-300 text-slate-600 shadow-sm' :
                  'bg-white/20 border-transparent hover:bg-white hover:border-indigo-100 text-slate-600'
                }`}
              >
                <span className={`text-[10px] sm:text-xs font-bold ${isSelected ? 'text-white' : isToday ? 'text-indigo-500' : 'text-slate-400'}`}>{dayNum}</span>
                {hasData && (
                  <div className="mt-auto flex gap-0.5 justify-center sm:justify-start overflow-hidden">
                    <div className={`h-1 w-1 sm:w-full sm:h-1 rounded-full ${isSelected ? 'bg-white/60' : 'bg-indigo-400'}`} />
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* RESUMEN SEMANAL */}
      <section className="space-y-4 print:page-break">
        <div className="flex items-center justify-between px-1">
          <div className="flex items-center gap-2">
            <BarChart3 size={18} className="text-slate-400" />
            <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest">Resumen Semanal</h3>
          </div>
          {selectedWeekKey && (
            <button 
              onClick={() => setSelectedWeekKey(null)}
              className="text-[10px] font-black text-indigo-500 uppercase tracking-widest flex items-center gap-1 hover:text-indigo-600"
            >
              <X size={12}/> Limpiar filtro semanal
            </button>
          )}
        </div>
        <div className="grid grid-cols-1 gap-3 print:grid-cols-1">
          {weeksData.map((week) => {
            const isExpanded = expandedWeek === week.key;
            const isSelected = selectedWeekKey === week.key;
            const hasData = week.total > 0;
            return (
              <div 
                key={week.key} 
                className={`glass rounded-3xl border overflow-hidden transition-all print:border-slate-200 print:bg-white ${
                  isSelected ? 'border-indigo-500 ring-2 ring-indigo-500/20' : 'border-white/60'
                } ${isExpanded ? 'bg-white/60 shadow-lg' : 'bg-white/20 opacity-80'}`}
              >
                <div className="flex items-center">
                  <button 
                    disabled={!hasData && !isExpanded}
                    onClick={() => handleWeekClick(week.key)}
                    className={`flex-1 flex items-center justify-between p-5 text-left print:cursor-default ${isSelected ? 'bg-indigo-50/50' : ''}`}
                  >
                    <div className="flex items-center gap-4">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold print:bg-slate-100 print:text-slate-600 ${isSelected ? 'bg-indigo-600 text-white' : isExpanded ? 'bg-indigo-500 text-white' : 'bg-white text-slate-400 shadow-sm'}`}>
                        {isSelected ? <CheckCircle size={18} /> : <span className="text-xs">{getWeekNumber(week.start)}</span>}
                      </div>
                      <div>
                        <p className={`text-xs font-bold ${isSelected ? 'text-indigo-700' : 'text-slate-700'}`}>
                          {week.start.toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })} - {week.end.toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })}
                        </p>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{week.sessionCount} sesiones</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className={`font-black ${isSelected ? 'text-indigo-700' : 'text-indigo-600'}`}>{formatTime(week.total)}</span>
                    </div>
                  </button>
                  <button 
                    onClick={() => setExpandedWeek(isExpanded ? null : week.key)}
                    className="p-5 text-slate-300 hover:text-indigo-500 transition-colors border-l border-indigo-50/30 print:hidden"
                  >
                    <ChevronDown size={18} className={`transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                  </button>
                </div>
                
                <AnimatePresence>
                  {isExpanded && (
                    <motion.div 
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="px-5 pb-6 pt-2 space-y-4 border-t border-indigo-50/50 print:block print:border-slate-100"
                    >
                      {Object.entries(week.subjects).length > 0 ? Object.entries(week.subjects).map(([subId, anyDuration]) => {
                        const duration = anyDuration as number;
                        const sub = getSubject(subId);
                        const pct = (duration / (week.total || 1)) * 100;
                        return (
                          <div key={subId} className="space-y-1.5">
                            <div className="flex justify-between text-[10px] font-bold uppercase tracking-tight">
                              <span className="text-slate-500">{sub?.name}</span>
                              <span className="text-indigo-500">{formatTime(duration)}</span>
                            </div>
                            <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                              <div className="h-full rounded-full" style={{ width: `${pct}%`, backgroundColor: sub?.color }} />
                            </div>
                          </div>
                        );
                      }) : (
                        <p className="text-[10px] font-bold text-slate-300 uppercase tracking-widest text-center py-4">Sin actividad en esta semana</p>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>
      </section>

      {/* DETALLE DE SESIONES */}
      <AnimatePresence mode="wait">
        <motion.section 
          key={selectedDate || selectedWeekKey || 'none'}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          className="space-y-4 print:page-break"
        >
          <div className="flex items-center justify-between px-1">
            <div className="flex items-center gap-2">
              <LayoutList size={18} className="text-slate-400" />
              <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest">
                Detalle del {displayTitle}
              </h3>
            </div>
          </div>

          {displaySessions.length === 0 ? (
            <div className="p-10 glass rounded-3xl border-2 border-dashed border-slate-200 text-center text-slate-400 italic text-sm">
              No hay sesiones registradas.
            </div>
          ) : (
            <div className="space-y-3">
              {displaySessions.map(session => {
                const sub = getSubject(session.subjectId);
                const sessionDate = new Date(session.date);
                return (
                  <div key={session.id} className="glass p-5 rounded-3xl border border-white/60 flex flex-col gap-3 bg-white/20 print:bg-white print:border-slate-200">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white shrink-0 shadow-sm" style={{ backgroundColor: sub?.color }}>
                          <BookOpen size={18} />
                        </div>
                        <div>
                          <p className="font-bold text-slate-700 text-sm">{sub?.name}</p>
                          <div className="flex items-center gap-2">
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                              {sub?.topics.find(t => t.id === session.topicId)?.name || 'Estudio'}
                            </p>
                            {selectedWeekKey && (
                              <span className="text-[10px] font-bold text-indigo-400 bg-indigo-50 px-1.5 rounded uppercase">
                                Día {sessionDate.getDate()}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-black text-slate-700">{formatTime(session.duration)}</p>
                        <p className="text-[9px] font-black text-slate-300 uppercase tracking-tighter">Duración</p>
                      </div>
                    </div>
                    {session.notes && (
                      <div className="mt-1 px-4 py-3 bg-white/40 rounded-2xl border border-white/40 print:bg-slate-50 print:border-slate-100">
                        <p className="text-xs text-slate-500 italic leading-relaxed">
                          "{session.notes}"
                        </p>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </motion.section>
      </AnimatePresence>

      {/* FOOTER TOTALES */}
      <footer className="pt-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
         <div className="glass p-6 rounded-3xl border border-white/60 text-center print:border-slate-200">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Total de {monthName}</p>
            <p className="text-2xl font-black text-indigo-600">
               {formatTime(totalMonthlyTime)}
            </p>
         </div>
         <div className="glass p-6 rounded-3xl border border-white/60 text-center print:border-slate-200">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Media Semanal</p>
            <p className="text-2xl font-black text-slate-700">
               {formatTime(averageWeeklyTime)}
            </p>
         </div>
      </footer>
    </div>
  );
};

function getWeekNumber(d: Date) {
  const date = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
  const dayNum = date.getUTCDay() || 7;
  date.setUTCDate(date.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(date.getUTCFullYear(), 0, 1));
  return Math.ceil((((date.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
}

export default HistoryView;
