
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
  Loader2,
  Edit2,
  Check,
  Filter
} from 'lucide-react';
import { Subject, Session, Topic } from '../types';
import PieChart from './PieChart';
import LineChart from './LineChart';
import { supabase } from '../lib/supabase';

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
  const [selectedTopicsForPie, setSelectedTopicsForPie] = useState<string[]>([]);
  const [isEditingSubject, setIsEditingSubject] = useState(false);
  const [editedSubjectName, setEditedSubjectName] = useState(subject.name);
  const [editingTopicId, setEditingTopicId] = useState<string | null>(null);
  const [editedTopicName, setEditedTopicName] = useState('');

  const handleUpdateSubjectName = async () => {
    if (!editedSubjectName.trim()) return;
    await supabase.from('subjects').update({ name: editedSubjectName }).eq('id', subject.id);
    subject.name = editedSubjectName; // Optimistic update
    setIsEditingSubject(false);
  };

  const handleUpdateTopicName = async (topicId: string) => {
    if (!editedTopicName.trim()) return;
    await supabase.from('topics').update({ name: editedTopicName }).eq('id', topicId);
    const topic = subject.topics.find(t => t.id === topicId);
    if (topic) topic.name = editedTopicName; // Optimistic
    setEditingTopicId(null);
  };

  const startEditingTopic = (t: Topic) => {
    setEditingTopicId(t.id);
    setEditedTopicName(t.name);
  };

  const formatTime = (s: number) => {
    const h = Math.floor(s / 3600);
    const m = Math.floor((s % 3600) / 60);
    return h > 0 ? `${h}h ${m}m` : `${m}m`;
  };

  const getWeekKey = (date: Date) => {
    // Get Monday of the week
    const d = new Date(date);
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1);
    const monday = new Date(d.setDate(diff));

    // Get Sunday of the week
    const sunday = new Date(monday);
    sunday.setDate(monday.getDate() + 6);

    // Format as "3 enero - 10 enero"
    const startDay = monday.getDate();
    const endDay = sunday.getDate();
    const startMonth = new Intl.DateTimeFormat('es-ES', { month: 'long' }).format(monday);
    const endMonth = new Intl.DateTimeFormat('es-ES', { month: 'long' }).format(sunday);

    if (startMonth === endMonth) {
      return `${startDay} - ${endDay} ${startMonth}`;
    } else {
      return `${startDay} ${startMonth} - ${endDay} ${endMonth}`;
    }
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

  // Pie chart data for selected topics
  const pieChartData = useMemo(() => {
    if (selectedTopicsForPie.length === 0) return [];

    return selectedTopicsForPie.map((topicId, index) => {
      const topic = subject.topics.find(t => t.id === topicId);
      const time = viewStats.topicMap[topicId] || 0;

      // Generate distinct color variants based on subject color
      // Simplified approach: adjust lightness/hue
      return {
        label: topic?.name || 'Unknown',
        value: time / 3600, // Convert to hours
        color: index % 2 === 0 ? subject.color : `${subject.color}aa` // Fallback or use a better palette generator if possible
      };
    });
  }, [selectedTopicsForPie, viewStats.topicMap, subject]);

  // Helper to generate distinct colors for chart
  const getTopicColor = (index: number, baseColor: string) => {
    const variants = [
      baseColor,
      '#94a3b8',
      '#475569',
      '#cbd5e1'
    ];
    // Since we can't easily manipulate hex without a library, we'll try to use opacity or just alternate
    // A better way is to use a predefined palette or just rely on the base list from Dashboard if available
    // For now, let's use a simple opacity trick via CSS hex alpha if supported, or just use the base color
    // The user specifically asked for DIFFERENT colors. 
    // Let's use a simple distinct palette relative to the index
    const palette = ['#818cf8', '#f87171', '#34d399', '#fbbf24', '#a78bfa', '#f472b6', '#22d3ee', '#fb923c'];
    return palette[index % palette.length];
  };

  // Monthly trend data (hours per day)
  const monthlyTrendData = useMemo(() => {
    const daysInMonth = new Date(navDate.getFullYear(), navDate.getMonth() + 1, 0).getDate();
    const dailyData: { label: string; value: number }[] = [];

    for (let day = 1; day <= daysInMonth; day++) {
      const dateStr = new Date(navDate.getFullYear(), navDate.getMonth(), day).toISOString().split('T')[0];
      const daySessions = sessions.filter(s => s.date.split('T')[0] === dateStr);
      const totalSeconds = daySessions.reduce((sum, s) => sum + s.duration, 0);
      dailyData.push({
        label: day.toString(),
        value: totalSeconds / 3600 // Convert to hours
      });
    }

    return dailyData;
  }, [sessions, navDate]);

  // Update pieChartData color logic to use getTopicColor
  const pieChartDataFinal = useMemo(() => {
    return pieChartData.map((d, i) => ({
      ...d,
      color: getTopicColor(i, subject.color)
    }));
  }, [pieChartData, subject.color]);

  const maxWeekTime = Math.max(...(Object.values(viewStats.weekMap) as number[]), 1);
  const maxTopicTime = Math.max(...(Object.values(viewStats.topicMap) as number[]), 1);

  const handlePrint = () => {
    setIsGeneratingPDF(true);
    setTimeout(() => {
      window.print();
      setIsGeneratingPDF(false);
    }, 1500);
  };

  const toggleTopicForPie = (topicId: string) => {
    setSelectedTopicsForPie(prev =>
      prev.includes(topicId)
        ? prev.filter(id => id !== topicId)
        : [...prev, topicId]
    );
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
              {isEditingSubject ? (
                <div className="flex items-center gap-2">
                  <input
                    autoFocus
                    value={editedSubjectName}
                    onChange={(e) => setEditedSubjectName(e.target.value)}
                    className="text-2xl font-black text-slate-800 uppercase tracking-tight bg-white/50 border-b-2 border-indigo-500 outline-none w-full"
                    onKeyDown={(e) => e.key === 'Enter' && handleUpdateSubjectName()}
                  />
                  <button onClick={handleUpdateSubjectName} className="p-1 bg-emerald-100 text-emerald-600 rounded-lg"><Check size={20} /></button>
                </div>
              ) : (
                <div className="flex items-center gap-2 group">
                  <h1 className="text-2xl font-black text-slate-800 uppercase tracking-tight">{subject.name}</h1>
                  <button onClick={() => setIsEditingSubject(true)} className="opacity-0 group-hover:opacity-100 text-slate-400 hover:text-indigo-500 transition-all"><Edit2 size={16} /></button>
                </div>
              )}
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

      {/* ANALÍTICA POR APARTADO (PIE CHART) */}
      <section className="space-y-4 print:page-break">
        <div className="flex items-center justify-between px-1">
          <div className="flex items-center gap-2">
            <TrendingUp size={18} className="text-indigo-400" />
            <h2 className="text-sm font-black text-slate-700 uppercase tracking-widest">Análisis de Apartados</h2>
          </div>
          {selectedTopicsForPie.length > 0 && (
            <button
              onClick={() => setSelectedTopicsForPie([])}
              className="text-[10px] font-black text-rose-500 uppercase tracking-tight hover:underline"
            >
              Borrar selección
            </button>
          )}
        </div>
        <div className="glass p-8 rounded-[2.5rem] border border-white/60 flex flex-col lg:flex-row gap-8 items-center justify-center print:border-slate-200 print:bg-white print:shadow-none">
          <div className="w-full lg:w-1/2 space-y-4">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Selecciona apartados para comparar:</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-[200px] overflow-y-auto pr-2 custom-scrollbar">
              {subject.topics.map((topic, index) => (
                <div key={topic.id} className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      if (filterTopicId === topic.id) setFilterTopicId(null);
                      else setFilterTopicId(topic.id);
                    }}
                    className={`p-2 rounded-xl transition-all ${filterTopicId === topic.id ? 'bg-indigo-600 text-white' : 'bg-white/40 text-slate-400 hover:text-indigo-500'}`}
                    title="Filtrar vista por este apartado"
                  >
                    <Filter size={14} />
                  </button>
                  <label
                    className={`flex-1 flex items-center justify-between gap-3 p-3 rounded-2xl border cursor-pointer transition-all ${selectedTopicsForPie.includes(topic.id)
                      ? 'bg-indigo-50 border-indigo-200'
                      : 'bg-white/40 border-transparent hover:border-slate-200'
                      }`}
                  >
                    <div className="flex items-center gap-3 overflow-hidden">
                      <input
                        type="checkbox"
                        checked={selectedTopicsForPie.includes(topic.id)}
                        onChange={() => toggleTopicForPie(topic.id)}
                        className="w-4 h-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 shrink-0"
                      />
                      {editingTopicId === topic.id ? (
                        <div className="flex items-center gap-1 min-w-0" onClick={e => e.preventDefault()}>
                          <input
                            value={editedTopicName}
                            onChange={e => setEditedTopicName(e.target.value)}
                            className="w-full text-xs font-bold bg-white border-b border-indigo-500 outline-none"
                            onKeyDown={e => e.key === 'Enter' && handleUpdateTopicName(topic.id)}
                            onClick={e => e.stopPropagation()}
                          />
                          <button onClick={(e) => { e.stopPropagation(); handleUpdateTopicName(topic.id); }} className="text-emerald-500"><Check size={14} /></button>
                        </div>
                      ) : (
                        <span className={`text-xs font-bold truncate ${selectedTopicsForPie.includes(topic.id) ? 'text-indigo-700' : 'text-slate-600'}`}>
                          {topic.name}
                        </span>
                      )}
                    </div>
                  </label>
                  {!editingTopicId && (
                    <button onClick={() => startEditingTopic(topic)} className="p-2 text-slate-300 hover:text-indigo-500 transition-colors">
                      <Edit2 size={12} />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="w-full lg:w-1/2 flex flex-col items-center justify-center pt-4 lg:pt-0">
            {pieChartDataFinal.length > 0 ? (
              <>
                <PieChart data={pieChartDataFinal} size={220} />
                <div className="mt-6 text-center">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Tiempo Total Seleccionado</p>
                  <p className="text-2xl font-black text-slate-700">
                    {formatTime(pieChartDataFinal.reduce((sum, item) => sum + (item.value * 3600), 0))}
                  </p>
                </div>
              </>
            ) : (
              <div className="h-[220px] flex flex-col items-center justify-center text-center space-y-3">
                <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center text-slate-300 border-2 border-dashed border-slate-200">
                  <TrendingUp size={24} />
                </div>
                <p className="text-[10px] font-bold text-slate-300 uppercase tracking-[0.2em]">Selecciona temas para visualizar</p>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* TENDENCIA MENSUAL (LINE CHART) */}
      <section className="space-y-4 print:page-break">
        <div className="flex items-center justify-between px-1">
          <div className="flex items-center gap-2">
            <TrendingUp size={18} className="text-emerald-400" />
            <h2 className="text-sm font-black text-slate-700 uppercase tracking-widest">Tendencia de Horas en {currentMonthKey}</h2>
          </div>
        </div>
        <div className="glass p-8 rounded-[2.5rem] border border-white/60 print:border-slate-200 print:bg-white print:shadow-none overflow-x-auto">
          <div className="min-w-[600px] py-4">
            <LineChart
              data={monthlyTrendData}
              color={subject.color}
              height={250}
              width={800}
            />
          </div>
          <div className="mt-4 flex justify-center gap-8 px-4 text-center">
            <div>
              <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Máximo Diario</p>
              <p className="text-sm font-black text-slate-700">{Math.max(...monthlyTrendData.map(d => d.value)).toFixed(1)}h</p>
            </div>
            <div>
              <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Media Diaria</p>
              <p className="text-sm font-black text-slate-700">{(monthlyTrendData.reduce((s, d) => s + d.value, 0) / (monthlyTrendData.filter(d => d.value > 0).length || 1)).toFixed(1)}h</p>
            </div>
          </div>
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
