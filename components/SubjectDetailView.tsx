
import React, { useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ChevronLeft, 
  Clock, 
  BookOpen, 
  Calendar, 
  TrendingUp, 
  LayoutList, 
  X,
  ChevronRight,
  Printer,
  Loader2
} from 'lucide-react';
import { Subject, Session } from '../types';

interface SubjectDetailProps {
  subject: Subject;
  sessions: Session[];
  onBack: () => void;
}

const SubjectDetailView: React.FC<SubjectDetailProps> = ({ subject, sessions, onBack }) => {
  const [navDate, setNavDate] = useState(new Date());
  const [filterWeek, setFilterWeek] = useState<string | null>(null);
  const [filterTopicId, setFilterTopicId] = useState<string | null>(null);
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);

  const formatTime = (s: number) => {
    const h = Math.floor(s / 3600);
    const m = Math.floor((s % 3600) / 60);
    return h > 0 ? `${h}h ${m}m` : `${m}m`;
  };

  const getWeekKey = (date: Date) => {
    const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
    const dayNum = d.getUTCDay() || 7;
    d.setUTCDate(d.getUTCDate() + 4 - dayNum);
    const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
    const weekNo = Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
    return `Semana ${weekNo} (${d.getUTCFullYear()})`;
  };

  const getMonthKey = (date: Date) => {
    return new Intl.DateTimeFormat('es-ES', { month: 'long', year: 'numeric' }).format(date);
  };

  const currentMonthKey = getMonthKey(navDate);

  const weeksInMonth = useMemo(() => {
    const weeks: string[] = [];
    const firstDay = new Date(navDate.getFullYear(), navDate.getMonth(), 1);
    const lastDay = new Date(navDate.getFullYear(), navDate.getMonth() + 1, 0);
    let current = new Date(firstDay);
    const day = current.getDay();
    const diff = current.getDate() - day + (day === 0 ? -6 : 1);
    current.setDate(diff);
    while (current <= lastDay) {
      weeks.push(getWeekKey(current));
      current.setDate(current.getDate() + 7);
    }
    return weeks;
  }, [navDate]);

  const filteredSessions = useMemo(() => {
    return sessions.filter(s => {
      const d = new Date(s.date);
      const matchesMonth = getMonthKey(d) === currentMonthKey;
      const matchesWeek = !filterWeek || getWeekKey(d) === filterWeek;
      const matchesTopic = !filterTopicId || s.topicId === filterTopicId;
      return matchesMonth && matchesWeek && matchesTopic;
    });
  }, [sessions, currentMonthKey, filterWeek, filterTopicId]);

  const viewStats = useMemo(() => {
    const weekMap: Record<string, number> = {};
    const topicMap: Record<string, number> = {};
    sessions.forEach(s => {
      const d = new Date(s.date);
      const mKey = getMonthKey(d);
      const wKey = getWeekKey(d);
      if (mKey === currentMonthKey) {
        if (!filterTopicId || s.topicId === filterTopicId) {
          weekMap[wKey] = (weekMap[wKey] || 0) + s.duration;
        }
        const matchesWeek = !filterWeek || wKey === filterWeek;
        if (matchesWeek) {
          topicMap[s.topicId] = (topicMap[s.topicId] || 0) + s.duration;
        }
      }
    });
    const totalTime = filteredSessions.reduce((acc: number, s: Session) => acc + (s.duration || 0), 0);
    return { weekMap, topicMap, totalTime };
  }, [sessions, filteredSessions, currentMonthKey, filterWeek, filterTopicId]);

  const maxWeekTime = Math.max(...(Object.values(viewStats.weekMap) as number[]), 1);
  const maxTopicTime = Math.max(...(Object.values(viewStats.topicMap) as number[]), 1);

  const handlePrint = () => {
    setIsGeneratingPDF(true);
    setTimeout(() => {
      window.print();
      setIsGeneratingPDF(false);
    }, 1500);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 md:px-6 py-6 md:py-10 space-y-8 pb-40">
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
                <h3 className="text-2xl font-black text-slate-800 uppercase tracking-tight">Preparando Reporte</h3>
                <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px] mt-2">Compilando diario de estudio...</p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Encabezado exclusivo para PDF */}
      <div className="hidden print:flex items-center justify-between border-b-2 border-slate-800 pb-6 mb-8">
        <div>
          <h1 className="text-3xl font-black uppercase tracking-tighter">Reporte de Asignatura: {subject.name}</h1>
          <p className="text-sm font-bold text-slate-500 uppercase tracking-widest">{currentMonthKey} {filterWeek ? `• ${filterWeek}` : ''}</p>
        </div>
        <div className="text-right">
          <p className="text-[10px] font-black uppercase text-slate-400">TimeToStudy • Detalle</p>
          <p className="text-xs font-bold text-slate-600">Generado el {new Date().toLocaleDateString()}</p>
        </div>
      </div>

      <header className="flex items-center justify-between print:hidden">
        <div className="flex items-center gap-4">
          <button onClick={onBack} className="p-3 bg-white/50 rounded-2xl text-slate-400 hover:text-indigo-600 transition-all shadow-sm">
            <ChevronLeft size={24} />
          </button>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <div className="w-4 h-4 rounded-full" style={{ backgroundColor: subject.color }} />
              <h1 className="text-2xl font-black text-slate-800 uppercase tracking-tight">{subject.name}</h1>
            </div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">
              {filterWeek ? filterWeek : currentMonthKey}
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          {(filterWeek || filterTopicId) && (
            <button 
              onClick={() => { setFilterWeek(null); setFilterTopicId(null); }}
              className="flex items-center gap-1 px-3 py-2 bg-rose-50 text-rose-500 rounded-xl text-[10px] font-black uppercase tracking-tight hover:bg-rose-100 transition-colors shadow-sm"
            >
              <X size={14} /> Limpiar Filtros
            </button>
          )}
          <button 
            onClick={handlePrint}
            className="p-3 bg-white/60 text-slate-600 rounded-xl border border-white shadow-sm hover:text-indigo-600 transition-all"
            title="Exportar Reporte PDF"
          >
            <Printer size={20} />
          </button>
        </div>
      </header>

      {/* ESTADÍSTICAS FILTRADAS */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <motion.div layout className="glass p-6 rounded-3xl border border-white/60 flex flex-col items-center text-center print:border-slate-200 print:bg-white print:shadow-none">
          <Clock className="text-indigo-500 mb-3" size={24} />
          <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-1">Tiempo Estudiado</p>
          <p className="text-3xl font-black text-slate-700">{formatTime(viewStats.totalTime)}</p>
        </motion.div>
        <motion.div layout className="glass p-6 rounded-3xl border border-white/60 flex flex-col items-center text-center print:border-slate-200 print:bg-white print:shadow-none">
          <TrendingUp className="text-emerald-500 mb-3" size={24} />
          <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-1">Sesiones</p>
          <p className="text-3xl font-black text-slate-700">{filteredSessions.length}</p>
        </motion.div>
      </div>

      {/* NAVEGADOR DE MESES Y SEMANAS */}
      <section className="space-y-4">
        <div className="flex items-center justify-between px-1 print:hidden">
          <div className="flex items-center gap-2">
            <Calendar size={18} className="text-slate-400" />
            <h2 className="text-sm font-black text-slate-700 uppercase tracking-widest">Distribución Temporal</h2>
          </div>
        </div>
        
        <div className="glass p-6 rounded-[2.5rem] border border-white/60 space-y-6 print:border-slate-200 print:bg-white print:shadow-none">
          <div className="flex items-center justify-between bg-white/40 p-2 rounded-2xl border border-white/60 print:border-slate-100">
            <button onClick={() => setNavDate(new Date(navDate.getFullYear(), navDate.getMonth() - 1, 1))} className="p-2 hover:bg-white rounded-xl text-slate-400 print:hidden">
              <ChevronLeft size={20} />
            </button>
            <div className="text-center">
              <span className="text-sm font-black text-slate-700 uppercase tracking-tight">{currentMonthKey}</span>
            </div>
            <button onClick={() => setNavDate(new Date(navDate.getFullYear(), navDate.getMonth() + 1, 1))} className="p-2 hover:bg-white rounded-xl text-slate-400 print:hidden">
              <ChevronRight size={20} />
            </button>
          </div>

          <div className="flex flex-col gap-3">
            {weeksInMonth.map((week) => {
              const time = viewStats.weekMap[week] || 0;
              const isSelected = filterWeek === week;
              return (
                <button 
                  key={week} 
                  onClick={() => setFilterWeek(isSelected ? null : week)}
                  className={`group w-full flex items-center gap-4 text-left p-3 rounded-2xl transition-all print:bg-transparent print:border-none ${isSelected ? 'bg-indigo-600 text-white shadow-lg print:text-indigo-600' : 'hover:bg-white/40'}`}
                >
                  <span className={`w-28 text-[10px] font-black uppercase ${isSelected ? 'text-white print:text-indigo-600' : 'text-slate-400'}`}>{week}</span>
                  <div className={`flex-1 h-2 rounded-full overflow-hidden ${isSelected ? 'bg-white/20 print:bg-slate-100' : 'bg-slate-100'}`}>
                    <motion.div initial={{ width: 0 }} animate={{ width: `${(time / maxWeekTime) * 100}%` }} className={`h-full ${isSelected ? 'bg-white print:bg-indigo-600' : 'bg-indigo-400'}`} />
                  </div>
                  <span className={`w-20 text-right text-xs font-black ${isSelected ? 'text-white print:text-indigo-600' : 'text-slate-600'}`}>{formatTime(time)}</span>
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* TIEMPO POR APARTADO */}
      <section className="space-y-4 print:page-break">
        <div className="flex items-center justify-between px-1">
          <div className="flex items-center gap-2">
            <BookOpen size={18} className="text-slate-400" />
            <h2 className="text-sm font-black text-slate-700 uppercase tracking-widest">Tiempo por Apartado</h2>
          </div>
        </div>
        <div className="glass p-8 rounded-[2.5rem] border border-white/60 space-y-6 print:border-slate-200 print:bg-white print:shadow-none">
          {subject.topics.length > 0 ? subject.topics.map(topic => {
            const time = viewStats.topicMap[topic.id] || 0;
            const percentage = (time / maxTopicTime) * 100;
            const isSelected = filterTopicId === topic.id;
            return (
              <button 
                key={topic.id} 
                onClick={() => setFilterTopicId(isSelected ? null : topic.id)}
                className={`w-full text-left space-y-2 group transition-all rounded-2xl p-2 print:border-none ${isSelected ? 'bg-indigo-50/50 ring-1 ring-indigo-100 print:bg-slate-50' : 'hover:bg-white/20'}`}
              >
                <div className="flex justify-between items-end">
                  <span className={`text-sm font-black uppercase tracking-tight ${isSelected ? 'text-indigo-600' : 'text-slate-600'}`}>{topic.name}</span>
                  <span className={`text-[10px] font-black ${isSelected ? 'text-indigo-600' : 'text-slate-400'}`}>{formatTime(time)}</span>
                </div>
                <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                  <motion.div initial={{ width: 0 }} animate={{ width: `${percentage}%` }} className={`h-full ${isSelected ? 'bg-indigo-600' : 'bg-indigo-400'}`} />
                </div>
              </button>
            );
          }) : (
            <p className="text-[10px] font-bold text-slate-300 uppercase tracking-widest text-center py-4">Sin apartados registrados</p>
          )}
        </div>
      </section>

      {/* DIARIO DE SESIONES */}
      <section className="space-y-6 print:page-break">
        <div className="flex items-center gap-2 px-1">
          <LayoutList size={18} className="text-slate-400" />
          <h2 className="text-sm font-black text-slate-700 uppercase tracking-widest">Diario de Sesiones</h2>
        </div>
        
        <div className="space-y-4">
          <AnimatePresence mode="popLayout">
            {filteredSessions.length > 0 ? (
              filteredSessions.slice().reverse().map(session => (
                <motion.div 
                  key={session.id} 
                  layout
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="glass p-5 rounded-3xl border border-white/60 flex flex-col gap-4 bg-white/20 print:bg-white print:border-slate-200 print:shadow-none"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-white/60 rounded-xl flex flex-col items-center justify-center border border-white shadow-sm print:bg-slate-50 print:border-slate-200">
                        <span className="text-[7px] font-black text-slate-400 uppercase leading-none mb-0.5">Día</span>
                        <span className="text-sm font-black text-slate-700 leading-none">{new Date(session.date).getDate()}</span>
                      </div>
                      <div>
                        <p className="text-[10px] font-black text-indigo-500 uppercase tracking-widest mb-0.5">
                          {subject.topics.find(t => t.id === session.topicId)?.name || 'General'}
                        </p>
                        <p className="text-[8px] font-bold text-slate-300 uppercase tracking-tighter">{getMonthKey(new Date(session.date))}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-black text-slate-700">{formatTime(session.duration)}</p>
                      <p className="text-[9px] font-black text-slate-300 uppercase tracking-tighter">Sesión</p>
                    </div>
                  </div>
                  {session.notes && (
                    <div className="px-4 py-3 bg-white/40 rounded-2xl border border-white/40 print:bg-slate-50 print:border-slate-100">
                      <p className="text-xs text-slate-500 italic leading-relaxed">"{session.notes}"</p>
                    </div>
                  )}
                </motion.div>
              ))
            ) : (
              <div className="p-12 glass rounded-3xl border-2 border-dashed border-slate-200 text-center text-slate-400 text-[10px] font-black uppercase tracking-[0.2em]">
                No hay sesiones registradas en este periodo.
              </div>
            )}
          </AnimatePresence>
        </div>
      </section>
    </div>
  );
};

export default SubjectDetailView;
