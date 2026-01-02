
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, BookOpen, Play, X, ChevronRight, Zap, Timer, Check, Trash2, AlertCircle, BarChart2, Save, Sparkles, ChevronDown, Archive, Clock } from 'lucide-react';
import { Subject, SessionMode, IntervalConfig, IntervalPreset } from '../types';

interface DashboardProps {
  subjects: Subject[];
  intervalPresets: IntervalPreset[];
  onStartSession: (subjectId: string, topicId: string, mode: SessionMode, config?: IntervalConfig) => void;
  onAddSubject: (name: string, color: string) => void;
  onAddTopic: (subjectId: string, name: string) => void;
  onAddIntervalPreset: (preset: Omit<IntervalPreset, 'id'>) => void;
  onDeleteIntervalPreset: (id: string) => void;
  onViewDetails: (subjectId: string) => void;
  onArchiveSubject: (id: string) => void;
}

const Dashboard: React.FC<DashboardProps> = ({
  subjects, intervalPresets, onStartSession, onAddSubject, onAddTopic,
  onAddIntervalPreset, onDeleteIntervalPreset, onViewDetails, onArchiveSubject
}) => {
  const [isAddingSub, setIsAddingSub] = useState(false);
  const [newSubName, setNewSubName] = useState('');
  const [selectedColor, setSelectedColor] = useState('#818cf8');
  const [showStartPicker, setShowStartPicker] = useState(false);
  const [selectedSubForSession, setSelectedSubForSession] = useState<Subject | null>(null);
  const [sessionStep, setSessionStep] = useState<'subject' | 'mode' | 'intervals'>('subject');
  const [selectedTopicId, setSelectedTopicId] = useState<string | null>(null);

  const [intervalSettings, setIntervalSettings] = useState<IntervalConfig>({ studyMinutes: 25, breakMinutes: 5 });
  const [newPresetName, setNewPresetName] = useState('');
  const [isCreatingPreset, setIsCreatingPreset] = useState(false);
  const [presetToDelete, setPresetToDelete] = useState<IntervalPreset | null>(null);

  const [activeTopicInput, setActiveTopicInput] = useState<string | null>(null);
  const [newTopicName, setNewTopicName] = useState('');
  const [studyMenuExpandedId, setStudyMenuExpandedId] = useState<string | null>(null);

  const subjectColors = [
    '#818cf8', '#f87171', '#34d399', '#fbbf24', '#a78bfa',
    '#f472b6', '#22d3ee', '#fb923c', '#94a3b8', '#4ade80',
    '#60a5fa', '#facc15', '#c084fc', '#f43f5e', '#2dd4bf'
  ];

  const handleStartSession = (mode: SessionMode) => {
    if (selectedSubForSession && selectedTopicId) {
      onStartSession(selectedSubForSession.id, selectedTopicId, mode, mode === 'interval' ? intervalSettings : undefined);
      resetPicker();
    }
  };

  const handleSavePreset = () => {
    if (newPresetName) {
      onAddIntervalPreset({
        name: newPresetName,
        studyMinutes: intervalSettings.studyMinutes,
        breakMinutes: intervalSettings.breakMinutes
      });
      setNewPresetName('');
      setIsCreatingPreset(false);
    }
  };

  const handleAddTopicConfirm = (subjectId: string) => {
    if (newTopicName.trim()) {
      onAddTopic(subjectId, newTopicName.trim());
      setNewTopicName('');
      setActiveTopicInput(null);
    }
  };

  const resetPicker = () => {
    setShowStartPicker(false);
    setSelectedSubForSession(null);
    setSelectedTopicId(null);
    setSessionStep('subject');
    setIsCreatingPreset(false);
    setStudyMenuExpandedId(null);
  };

  return (
    <div className="max-w-6xl mx-auto px-4 md:px-6 py-8 md:py-14 space-y-10 md:space-y-14 mb-20 md:mb-0">

      {/* BRAND HEADER CON ESLOGAN EN ESPAÑOL */}
      <header className="flex flex-col items-center md:items-start space-y-3 mb-6">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 md:w-12 md:h-12 bg-indigo-600 rounded-2xl flex items-center justify-center shadow-xl shadow-indigo-100 ring-4 ring-white">
            <Clock className="w-6 h-6 md:w-7 md:h-7 text-white" />
          </div>
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-slate-800 tracking-tight leading-none">
              <span className="text-indigo-600">T</span>ime<span className="text-indigo-600">T</span>o<span className="text-indigo-600">S</span>tudy
            </h1>
            <p className="text-[9px] md:text-[10px] font-black text-slate-400 uppercase tracking-[0.4em] mt-1.5 ml-0.5">
              Controla tu tiempo, domina tu éxito
            </p>
          </div>
        </div>
      </header>

      <motion.button
        whileHover={{ scale: 1.01 }}
        whileTap={{ scale: 0.99 }}
        onClick={() => setShowStartPicker(true)}
        className="w-full relative group overflow-hidden p-12 md:p-20 rounded-[2.5rem] md:rounded-[3.5rem] bg-gradient-to-br from-indigo-600 via-indigo-500 to-indigo-700 text-white shadow-2xl shadow-indigo-200 flex items-center justify-center border-4 border-white/20"
      >
        <div className="relative z-10 text-center">
          <h2 className="text-5xl md:text-8xl font-black tracking-[0.15em] uppercase leading-none">Estudiar</h2>
        </div>
        <div className="absolute top-0 right-0 w-64 h-64 md:w-96 md:h-96 bg-white/10 rounded-full -mr-16 -mt-16 md:-mr-32 md:-mt-32 blur-3xl" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-indigo-400/20 rounded-full -ml-10 -mb-10 blur-2xl" />
      </motion.button>

      <section>
        <div className="flex items-center justify-between mb-6 md:mb-8 px-2">
          <div className="flex items-center gap-3">
            <BarChart2 className="text-slate-400" size={20} />
            <h3 className="text-xl md:text-2xl font-black text-slate-800 uppercase tracking-tight">Tus Asignaturas</h3>
          </div>
          <span className="text-xs font-black text-slate-300 uppercase tracking-widest">{subjects.length} Activas</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 md:gap-8">
          {subjects.map((subject) => (
            <motion.div
              key={subject.id}
              className="glass rounded-[2.5rem] p-6 md:p-8 border border-white/60 hover:shadow-2xl transition-all group relative overflow-hidden"
            >
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-white shadow-lg shrink-0" style={{ backgroundColor: subject.color }}>
                    <BookOpen size={24} />
                  </div>
                  <div>
                    <h4 className="font-black text-lg text-slate-700 truncate max-w-[140px] leading-tight">{subject.name}</h4>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{subject.topics.length} temas</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => onArchiveSubject(subject.id)}
                    className="p-3 bg-white/50 text-slate-400 rounded-2xl hover:bg-slate-200 hover:text-slate-600 transition-all shadow-sm"
                    title="Archivar"
                  >
                    <Archive size={20} />
                  </button>
                  <button
                    onClick={() => onViewDetails(subject.id)}
                    className="p-3 bg-white/50 text-indigo-500 rounded-2xl hover:bg-indigo-500 hover:text-white transition-all shadow-sm"
                  >
                    <BarChart2 size={20} />
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                {subject.topics.slice(0, 3).map(topic => (
                  <div key={topic.id} className="flex items-center justify-between p-3 bg-white/30 rounded-xl text-xs font-bold text-slate-500 border border-white/40">
                    <span className="truncate">{topic.name}</span>
                  </div>
                ))}
                {subject.topics.length > 3 && (
                  <p className="text-center text-[9px] font-black text-slate-300 uppercase tracking-widest pt-1">+{subject.topics.length - 3} temas más</p>
                )}

                {activeTopicInput === subject.id ? (
                  <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="flex items-center gap-2 mt-4 p-2 bg-white/80 rounded-2xl border border-indigo-100 shadow-sm">
                    <input autoFocus type="text" placeholder="Nuevo tema..." className="flex-1 bg-transparent px-3 py-2 text-sm outline-none font-bold text-slate-700" value={newTopicName} onChange={(e) => setNewTopicName(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleAddTopicConfirm(subject.id)} />
                    <button onClick={() => handleAddTopicConfirm(subject.id)} className="p-2 text-emerald-500"><Check size={20} /></button>
                    <button onClick={() => { setActiveTopicInput(null); setNewTopicName(''); }} className="p-2 text-slate-400"><X size={18} /></button>
                  </motion.div>
                ) : (
                  <button onClick={() => setActiveTopicInput(subject.id)} className="w-full p-3 border-2 border-dashed border-slate-200 rounded-2xl text-[10px] font-black text-slate-400 hover:border-indigo-200 hover:text-indigo-400 hover:bg-white/50 transition-all uppercase tracking-[0.2em] mt-4">
                    + Añadir Apartado
                  </button>
                )}
              </div>
            </motion.div>
          ))}

          <button
            onClick={() => setIsAddingSub(true)}
            className="group flex flex-col items-center justify-center p-10 border-4 border-dashed border-slate-200 rounded-[2.5rem] hover:border-indigo-300 hover:bg-indigo-50/30 transition-all gap-5"
          >
            <div className="w-16 h-16 rounded-[2rem] bg-slate-100 flex items-center justify-center text-slate-400 group-hover:bg-indigo-100 group-hover:text-indigo-500 transition-all group-hover:rotate-90">
              <Plus size={32} />
            </div>
            <span className="font-black text-slate-400 group-hover:text-indigo-500 uppercase tracking-[0.2em] text-xs">Nueva Asignatura</span>
          </button>
        </div>
      </section>

      <AnimatePresence>
        {showStartPicker && (
          <div className="fixed inset-0 z-[100] flex items-end md:items-center justify-center p-0 md:p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={resetPicker} className="absolute inset-0 bg-slate-900/60 backdrop-blur-md" />
            <motion.div
              initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="relative w-full max-w-2xl glass rounded-t-[3rem] md:rounded-[3rem] p-8 md:p-12 shadow-2xl border-t md:border border-white/40 overflow-hidden max-h-[90vh] overflow-y-auto custom-scrollbar"
            >
              {sessionStep === 'subject' && (
                <div className="space-y-8">
                  <header className="flex items-center justify-between">
                    <div>
                      <h2 className="text-3xl md:text-4xl font-black text-slate-800 uppercase tracking-tight">Elige Enfoque</h2>
                      <p className="text-slate-500 font-bold uppercase tracking-widest text-[10px] mt-1">¿Qué vamos a estudiar hoy?</p>
                    </div>
                    <button onClick={resetPicker} className="p-3 bg-slate-100 text-slate-400 rounded-full hover:bg-rose-50 hover:text-rose-500 transition-all">
                      <X size={24} />
                    </button>
                  </header>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {subjects.map(s => {
                      const isExpanded = studyMenuExpandedId === s.id;
                      return (
                        <div key={s.id} className="flex flex-col gap-2">
                          <motion.button
                            layout
                            onClick={() => setStudyMenuExpandedId(isExpanded ? null : s.id)}
                            className={`w-full p-6 rounded-[2rem] transition-all flex items-center justify-between text-white relative overflow-hidden shadow-xl ${isExpanded ? 'ring-4 ring-offset-4 ring-white/50' : 'hover:scale-[1.02]'
                              }`}
                            style={{
                              backgroundColor: s.color,
                              boxShadow: `0 15px 30px -10px ${s.color}88`
                            }}
                          >
                            <div className="relative z-10 flex items-center gap-4">
                              <div className="w-12 h-12 bg-white/20 backdrop-blur-md rounded-xl flex items-center justify-center">
                                <BookOpen size={24} />
                              </div>
                              <span className="font-black text-xl uppercase tracking-tight">{s.name}</span>
                            </div>
                            <div className="relative z-10">
                              {isExpanded ? <ChevronDown size={24} /> : <ChevronRight size={24} />}
                            </div>
                            <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-full -mr-8 -mt-8 blur-2xl" />
                          </motion.button>

                          <AnimatePresence>
                            {isExpanded && (
                              <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                exit={{ opacity: 0, height: 0 }}
                                className="overflow-hidden space-y-2 mt-1 px-2"
                              >
                                <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest px-2 mb-2">Selecciona un apartado:</p>
                                {s.topics.map(t => (
                                  <button
                                    key={t.id}
                                    onClick={() => { setSelectedSubForSession(s); setSelectedTopicId(t.id); setSessionStep('mode'); }}
                                    className="w-full flex items-center justify-between p-4 bg-white/60 hover:bg-white rounded-2xl border border-white/60 transition-all group"
                                  >
                                    <span className="font-bold text-slate-600 text-sm group-hover:text-indigo-600">{t.name}</span>
                                    <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-500 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all">
                                      <Play size={14} fill="currentColor" />
                                    </div>
                                  </button>
                                ))}
                                {s.topics.length === 0 && (
                                  <div className="p-4 text-center text-[10px] font-bold text-slate-400 italic">No hay apartados. Añade uno desde el dashboard.</div>
                                )}
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {sessionStep === 'mode' && (
                <div className="space-y-8">
                  <header className="text-center">
                    <button onClick={() => setSessionStep('subject')} className="text-[10px] font-black text-indigo-500 uppercase tracking-[0.2em] mb-4">← Cambiar Asignatura</button>
                    <div
                      className="w-20 h-20 mx-auto mb-6 rounded-3xl flex items-center justify-center text-white shadow-2xl rotate-3"
                      style={{ backgroundColor: selectedSubForSession?.color }}
                    >
                      <Sparkles size={40} fill="white" />
                    </div>
                    <h2 className="text-3xl font-black text-slate-800 uppercase tracking-tight">Elige tu Ritmo</h2>
                    <p className="text-slate-500 font-bold uppercase tracking-widest text-[10px] mt-1">{selectedSubForSession?.name} • {subjects.find(s => s.id === selectedSubForSession?.id)?.topics.find(t => t.id === selectedTopicId)?.name}</p>
                  </header>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <button
                      onClick={() => handleStartSession('free')}
                      className="group p-8 bg-slate-50 hover:bg-white rounded-[2.5rem] border-2 border-transparent hover:border-indigo-400 transition-all flex flex-col items-center gap-4 text-center shadow-sm"
                    >
                      <div className="w-16 h-16 bg-indigo-50 text-indigo-500 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
                        <Zap size={32} />
                      </div>
                      <div>
                        <p className="font-black text-lg text-slate-700 uppercase tracking-tight">Estudio Libre</p>
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">Sin límites, tú mandas.</p>
                      </div>
                    </button>

                    <button
                      onClick={() => setSessionStep('intervals')}
                      className="group p-8 bg-slate-50 hover:bg-white rounded-[2.5rem] border-2 border-transparent hover:border-amber-400 transition-all flex flex-col items-center gap-4 text-center shadow-sm"
                    >
                      <div className="w-16 h-16 bg-amber-50 text-amber-500 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
                        <Timer size={32} />
                      </div>
                      <div>
                        <p className="font-black text-lg text-slate-700 uppercase tracking-tight">Intervalos</p>
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">Técnica Pomodoro.</p>
                      </div>
                    </button>
                  </div>
                </div>
              )}

              {sessionStep === 'intervals' && (
                <div className="space-y-6">
                  <header className="flex justify-between items-center">
                    <div>
                      <button onClick={() => setSessionStep('mode')} className="text-[10px] font-black text-indigo-500 uppercase tracking-[0.2em] mb-2">← Volver al modo</button>
                      <h2 className="text-3xl font-black text-slate-800 uppercase tracking-tight">Configuración</h2>
                    </div>
                    {!isCreatingPreset && (
                      <button onClick={() => setIsCreatingPreset(true)} className="flex items-center gap-2 px-4 py-2 bg-indigo-50 text-indigo-600 rounded-xl text-xs font-black uppercase tracking-widest"><Plus size={16} /> Crear</button>
                    )}
                  </header>

                  <AnimatePresence mode="wait">
                    {isCreatingPreset ? (
                      <motion.div key="creator" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6 p-8 glass rounded-[2.5rem] border border-indigo-100/30">
                        <div className="space-y-6">
                          <input autoFocus placeholder="Nombre de la rutina..." className="w-full bg-white px-6 py-4 rounded-2xl text-sm border-2 border-transparent focus:border-indigo-300 outline-none font-bold text-slate-700 shadow-sm" value={newPresetName} onChange={e => setNewPresetName(e.target.value)} />
                          <div className="grid grid-cols-1 gap-8">
                            <div className="space-y-3">
                              <div className="flex justify-between text-[10px] font-black"><span className="text-slate-400 uppercase tracking-[0.2em]">Enfoque</span><span className="text-indigo-600">{intervalSettings.studyMinutes} MIN</span></div>
                              <input type="range" min="5" max="90" step="5" value={intervalSettings.studyMinutes} onChange={e => setIntervalSettings({ ...intervalSettings, studyMinutes: parseInt(e.target.value) })} className="w-full h-2 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-indigo-500" />
                            </div>
                            <div className="space-y-3">
                              <div className="flex justify-between text-[10px] font-black"><span className="text-slate-400 uppercase tracking-[0.2em]">Descanso</span><span className="text-amber-600">{intervalSettings.breakMinutes} MIN</span></div>
                              <input type="range" min="1" max="30" step="1" value={intervalSettings.breakMinutes} onChange={e => setIntervalSettings({ ...intervalSettings, breakMinutes: parseInt(e.target.value) })} className="w-full h-2 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-amber-500" />
                            </div>
                          </div>
                        </div>
                        <div className="flex gap-4">
                          <button onClick={() => setIsCreatingPreset(false)} className="flex-1 py-4 text-slate-400 font-black text-[10px] uppercase tracking-widest">Atrás</button>
                          <button onClick={handleSavePreset} disabled={!newPresetName} className="flex-1 py-4 bg-indigo-600 text-white rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] shadow-xl disabled:opacity-30">Guardar Routine</button>
                        </div>
                      </motion.div>
                    ) : (
                      <motion.div key="list" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
                        <div className="grid grid-cols-1 gap-3 max-h-[35vh] overflow-y-auto pr-2 custom-scrollbar">
                          {intervalPresets.map(preset => (
                            <div key={preset.id} className="relative group">
                              <button
                                onClick={() => setIntervalSettings({ studyMinutes: preset.studyMinutes, breakMinutes: preset.breakMinutes })}
                                className={`w-full flex items-center justify-between p-6 rounded-[2rem] border-2 transition-all ${intervalSettings.studyMinutes === preset.studyMinutes && intervalSettings.breakMinutes === preset.breakMinutes
                                    ? 'bg-indigo-600 text-white border-indigo-600 shadow-xl'
                                    : 'bg-white text-slate-600 border-white hover:border-indigo-100 shadow-sm'
                                  }`}
                              >
                                <div className="text-left">
                                  <p className="font-black uppercase tracking-tight text-sm">{preset.name}</p>
                                  <p className={`text-[10px] font-bold ${intervalSettings.studyMinutes === preset.studyMinutes ? 'text-indigo-200' : 'text-slate-400'}`}>
                                    {preset.studyMinutes}m Estudio / {preset.breakMinutes}m Pausa
                                  </p>
                                </div>
                                <div className="flex items-center gap-3">
                                  {intervalSettings.studyMinutes === preset.studyMinutes && intervalSettings.breakMinutes === preset.breakMinutes && <Check size={20} className="text-white" strokeWidth={3} />}
                                  <button onClick={(e) => { e.stopPropagation(); setPresetToDelete(preset); }} className="p-2 opacity-40 hover:opacity-100 transition-opacity"><Trash2 size={16} /></button>
                                </div>
                              </button>
                            </div>
                          ))}
                        </div>
                        <button
                          onClick={() => handleStartSession('interval')}
                          className="w-full mt-4 py-6 bg-indigo-600 text-white rounded-[2rem] font-black uppercase tracking-[0.3em] shadow-2xl flex items-center justify-center gap-4 hover:bg-indigo-700 active:scale-[0.98] transition-all"
                        >
                          <Play size={24} fill="white" /> Comenzar Sesión
                        </button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              )}
            </motion.div>
          </div>
        )}

        {presetToDelete && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} onClick={() => setPresetToDelete(null)} className="absolute inset-0 bg-slate-900/70 backdrop-blur-md" />
            <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} className="relative glass w-full max-w-xs p-10 rounded-[3rem] text-center border border-white/40 shadow-2xl">
              <div className="w-16 h-16 bg-rose-50 text-rose-500 rounded-2xl flex items-center justify-center mx-auto mb-6"><AlertCircle size={32} /></div>
              <h3 className="text-xl font-black text-slate-800 uppercase tracking-tight mb-2">¿Eliminar?</h3>
              <p className="text-slate-500 text-xs font-bold leading-relaxed mb-8">Esta rutina se borrará de forma permanente.</p>
              <div className="flex gap-3">
                <button onClick={() => setPresetToDelete(null)} className="flex-1 py-4 text-slate-400 font-black text-[10px] uppercase tracking-widest">No</button>
                <button
                  onClick={() => { onDeleteIntervalPreset(presetToDelete.id); setPresetToDelete(null); }}
                  className="flex-1 py-4 bg-rose-500 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-lg"
                >Sí, borrar</button>
              </div>
            </motion.div>
          </div>
        )}

        {isAddingSub && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} onClick={() => setIsAddingSub(false)} className="absolute inset-0 bg-slate-900/60 backdrop-blur-md" />
            <motion.div initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} className="relative glass w-full max-w-sm p-10 rounded-[3rem] shadow-2xl border border-white/40 overflow-hidden">
              <h2 className="text-2xl font-black text-slate-800 uppercase tracking-tight mb-8">Nueva Materia</h2>
              <div className="space-y-8">
                <div className="space-y-2">
                  <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest px-1">Nombre</p>
                  <input
                    autoFocus placeholder="Matemáticas, Historia..." className="w-full px-6 py-4 bg-white/50 rounded-2xl outline-none border-2 border-transparent focus:border-indigo-300 transition-all font-bold text-slate-700 shadow-inner"
                    value={newSubName} onChange={e => setNewSubName(e.target.value)}
                  />
                </div>
                <div className="space-y-3">
                  <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest px-1">Color Temático</p>
                  <div className="grid grid-cols-5 gap-3">
                    {subjectColors.map(color => (
                      <button
                        key={color} onClick={() => setSelectedColor(color)}
                        className={`aspect-square rounded-xl flex items-center justify-center transition-all ${selectedColor === color ? 'scale-110 ring-4 ring-white shadow-xl' : 'opacity-60 hover:opacity-100 hover:scale-105'}`}
                        style={{ backgroundColor: color }}
                      >
                        {selectedColor === color && <Check className="text-white w-5 h-5" strokeWidth={4} />}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
              <div className="flex gap-4 mt-12">
                <button onClick={() => setIsAddingSub(false)} className="flex-1 py-4 text-slate-500 font-black text-[10px] uppercase tracking-widest">Cerrar</button>
                <button
                  onClick={() => { onAddSubject(newSubName, selectedColor); setIsAddingSub(false); setNewSubName(''); }}
                  disabled={!newSubName} className="flex-1 py-4 bg-indigo-600 text-white font-black text-[10px] uppercase tracking-[0.2em] rounded-2xl shadow-xl disabled:opacity-30"
                >Confirmar</button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Dashboard;
