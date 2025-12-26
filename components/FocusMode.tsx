
import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Pause, Square, StickyNote, Settings, X, ChevronLeft, ChevronRight, Coffee } from 'lucide-react';
import { Subject, Topic, Session, TimerStyle, SessionMode, IntervalConfig } from '../types';
import {
  MinimalistClock, CircularClock,
  FlipClock, VerticalClock, OrbitalClock, TypographicClock
} from './Timer/ClockStyles';

interface FocusModeProps {
  subject: Subject;
  topic: Topic;
  mode: SessionMode;
  intervalConfig: IntervalConfig;
  onEnd: (session: Partial<Session>) => void;
  onCancel: () => void;
  initialStyle: TimerStyle;
  onStyleChange: (s: TimerStyle) => void;
  onAutoSave?: (session: Session) => void;
}

const STYLES: TimerStyle[] = ['minimalist', 'circular', 'flip', 'vertical', 'orbital', 'typographic'];

const FocusMode: React.FC<FocusModeProps> = ({
  subject, topic, mode, intervalConfig, onEnd, onCancel, initialStyle, onStyleChange, onAutoSave
}) => {
  const [seconds, setSeconds] = useState(0);
  const [pauseSeconds, setPauseSeconds] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [currentStyle, setCurrentStyle] = useState<TimerStyle>(initialStyle);
  const [notes, setNotes] = useState('');

  const [phase, setPhase] = useState<'study' | 'break'>(mode === 'interval' ? 'study' : 'study');
  const [phaseTimeLeft, setPhaseTimeLeft] = useState(intervalConfig.studyMinutes * 60);

  const [showPauseModal, setShowPauseModal] = useState(false);
  const [isBreakActive, setIsBreakActive] = useState(false);

  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const lastTickRef = useRef<number>(Date.now());

  const secondsRef = useRef(0);
  const pauseSecondsRef = useRef(0);
  const notesRef = useRef('');

  useEffect(() => {
    secondsRef.current = seconds;
  }, [seconds]);

  useEffect(() => {
    pauseSecondsRef.current = pauseSeconds;
  }, [pauseSeconds]);

  useEffect(() => {
    notesRef.current = notes;
  }, [notes]);

  useEffect(() => {
    const handleUnload = () => {
      if (onAutoSave) {
        const finalSession: Session = {
          id: Date.now().toString(),
          subjectId: subject.id,
          topicId: topic.id,
          date: new Date().toISOString(),
          duration: secondsRef.current,
          pauseDuration: pauseSecondsRef.current,
          notes: notesRef.current + " (Auto-guardado al cerrar)",
          mode: mode
        };
        onAutoSave(finalSession);
      }
    };

    window.addEventListener('beforeunload', handleUnload);
    return () => window.removeEventListener('beforeunload', handleUnload);
  }, [onAutoSave, subject.id, topic.id, mode]);

  useEffect(() => {
    const heartbeat = setInterval(() => {
      if (!isPaused && !showPauseModal && secondsRef.current > 0) {
        if (onAutoSave) {
          const sessionUpdate: Session = {
            id: Date.now().toString(),
            subjectId: subject.id,
            topicId: topic.id,
            date: new Date().toISOString(),
            duration: secondsRef.current,
            pauseDuration: pauseSecondsRef.current,
            notes: notesRef.current + " (Auto-guardado periódico)",
            mode: mode
          };
          onAutoSave(sessionUpdate);
        }
      }
    }, 30000);

    const updateTimer = () => {
      const now = Date.now();
      const delta = Math.floor((now - lastTickRef.current) / 1000);

      if (delta >= 1) {
        lastTickRef.current = now;

        if (!isPaused && !showPauseModal) {
          if (mode === 'free') {
            setSeconds(s => s + delta);
          } else {
            setSeconds(s => s + delta);
            setPhaseTimeLeft(t => {
              const newTime = t - delta;
              if (newTime <= 0) {
                // If the drift was large, we might skip a break, but for now just toggle
                const nextPhase = phase === 'study' ? 'break' : 'study';
                setPhase(nextPhase);
                return (nextPhase === 'study' ? intervalConfig.studyMinutes : intervalConfig.breakMinutes) * 60;
              }
              return newTime;
            });
          }
        } else if (isBreakActive || (isPaused && mode === 'free' && !showPauseModal)) {
          setPauseSeconds(p => p + delta);
        }
      }
    };

    lastTickRef.current = Date.now();
    timerRef.current = setInterval(updateTimer, 1000);

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        // Force update when coming back from background
        updateTimer();
      } else {
        // Update accurately just before going to background
        updateTimer();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      clearInterval(heartbeat);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [isPaused, mode, phase, intervalConfig, showPauseModal, isBreakActive, onAutoSave, subject.id, topic.id]);

  const handlePauseClick = () => {
    if (mode === 'free' && !isPaused) {
      setShowPauseModal(true);
    } else {
      setIsPaused(!isPaused);
      setIsBreakActive(false);
    }
  };

  const handleStop = () => {
    onEnd({ subjectId: subject.id, topicId: topic.id, duration: seconds, pauseDuration: pauseSeconds, notes, mode });
  };

  const nextStyle = () => {
    const idx = STYLES.indexOf(currentStyle);
    const next = STYLES[(idx + 1) % STYLES.length];
    setCurrentStyle(next);
    onStyleChange(next);
  };

  const prevStyle = () => {
    const idx = STYLES.indexOf(currentStyle);
    const prev = STYLES[idx === 0 ? STYLES.length - 1 : idx - 1];
    setCurrentStyle(prev);
    onStyleChange(prev);
  };

  const renderClock = () => {
    const displaySeconds = mode === 'interval' ? phaseTimeLeft : seconds;
    const props = { seconds: displaySeconds, isPaused };
    switch (currentStyle) {
      case 'minimalist': return <MinimalistClock {...props} />;
      case 'circular': return <CircularClock {...props} />;
      case 'flip': return <FlipClock {...props} />;
      case 'vertical': return <VerticalClock {...props} />;
      case 'orbital': return <OrbitalClock {...props} />;
      case 'typographic': return <TypographicClock {...props} />;
      default: return null;
    }
  };

  return (
    <div className={`h-full flex flex-col transition-colors duration-700 ${mode === 'interval' && phase === 'break' ? 'bg-amber-50/50' : 'bg-white/30'} backdrop-blur-md overflow-hidden`}>
      <header className="h-14 md:h-16 flex items-center justify-between px-4 md:px-8 border-b border-white/40 shrink-0">
        <button onClick={onCancel} className="p-2 hover:bg-white/50 rounded-full text-slate-400 hover:text-rose-500 transition-colors"><X size={20} /></button>
        <div className="flex flex-col items-center">
          <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full animate-pulse ${mode === 'interval' && phase === 'break' ? 'bg-amber-500' : 'bg-emerald-500'}`} />
            <h2 className="text-[10px] md:text-sm font-bold uppercase tracking-widest text-slate-500 whitespace-nowrap">
              {mode === 'interval' ? (phase === 'study' ? 'Enfoque' : 'Descanso') : 'Estudio Libre'}
            </h2>
          </div>
          <p className="text-[8px] font-black uppercase text-slate-300 md:hidden">{subject.name}</p>
        </div>
        <button onClick={nextStyle} className="p-2 text-slate-400"><Settings size={20} /></button>
      </header>

      <div className="flex-1 flex flex-col md:flex-row overflow-y-auto md:overflow-hidden">
        <div className="w-full md:flex-1 flex flex-col items-center justify-center relative p-6 md:p-12 border-b md:border-b-0 md:border-r border-white/20 min-h-[400px] md:min-h-0 shrink-0">
          {/* Botón Izquierda - Ahora visible en móvil */}
          <div className="absolute left-2 md:left-8 top-1/2 -translate-y-1/2 z-10">
            <button
              onClick={prevStyle}
              className="p-3 md:p-4 bg-white/40 hover:bg-white/80 rounded-full text-slate-400 hover:text-indigo-600 transition-all shadow-sm border border-white/60"
            >
              <ChevronLeft size={24} className="md:w-10 md:h-10" />
            </button>
          </div>

          <motion.div key={currentStyle} initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="w-full flex justify-center scale-90 md:scale-100 px-12 md:px-0">
            {renderClock()}
          </motion.div>

          {/* Botón Derecha - Ahora visible en móvil */}
          <div className="absolute right-2 md:right-8 top-1/2 -translate-y-1/2 z-10">
            <button
              onClick={nextStyle}
              className="p-3 md:p-4 bg-white/40 hover:bg-white/80 rounded-full text-slate-400 hover:text-indigo-600 transition-all shadow-sm border border-white/60"
            >
              <ChevronRight size={24} className="md:w-10 md:h-10" />
            </button>
          </div>

          {mode === 'interval' && (
            <div className="mt-8 px-4 py-1.5 bg-white/60 rounded-full border border-white font-bold text-[9px] md:text-xs uppercase tracking-widest text-slate-400">
              {phase === 'study' ? 'Fase de estudio' : 'Toca descansar'}
            </div>
          )}
        </div>

        <aside className="w-full md:w-[320px] lg:w-[400px] bg-white/20 px-4 pt-4 pb-24 md:p-8 flex flex-col gap-4 md:gap-8 md:overflow-y-auto custom-scrollbar">
          <section className="space-y-3">
            <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-400 px-1">Control</h3>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={handlePauseClick}
                className={`py-4 md:py-6 rounded-2xl md:rounded-3xl flex flex-col items-center justify-center gap-1 transition-all ${isPaused || isBreakActive ? 'bg-amber-500 text-white shadow-lg' : 'bg-white shadow-sm text-indigo-600'}`}
              >
                {isPaused || isBreakActive ? <Play fill="currentColor" size={20} /> : <Pause fill="currentColor" size={20} />}
                <span className="text-[9px] font-bold uppercase">{isPaused || isBreakActive ? 'Seguir' : 'Pausar'}</span>
              </button>
              <button
                onClick={handleStop}
                className="py-4 md:py-6 rounded-2xl md:rounded-3xl bg-rose-50 text-rose-500 flex flex-col items-center justify-center gap-1 hover:bg-rose-100 transition-all shadow-sm"
              >
                <Square fill="currentColor" size={20} />
                <span className="text-[9px] font-bold uppercase">Terminar</span>
              </button>
            </div>
          </section>

          <section className="flex-1 flex flex-col min-h-[250px] md:min-h-[150px] space-y-3">
            <div className="flex items-center justify-between px-1">
              <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-400">Notas de sesión</h3>
              <StickyNote size={12} className="text-slate-300" />
            </div>
            <textarea
              value={notes} onChange={e => setNotes(e.target.value)}
              placeholder="Anota tus avances..."
              className="flex-1 w-full p-4 md:p-6 bg-white/40 rounded-2xl md:rounded-[2rem] border border-white/60 outline-none resize-none text-xs md:text-sm font-medium text-slate-600 focus:bg-white transition-all shadow-inner min-h-[150px]"
            />
          </section>

          <footer className="p-4 glass rounded-xl md:rounded-2xl border border-white/60 shrink-0">
            <div className="flex justify-between items-center text-[9px] font-black uppercase tracking-widest text-slate-400">
              <span>Pausas totales</span>
              <span className="text-slate-600 font-mono">{Math.floor(pauseSeconds / 60)}m {pauseSeconds % 60}s</span>
            </div>
          </footer>
        </aside>
      </div>

      <AnimatePresence>
        {showPauseModal && (
          <div className="fixed inset-0 z-[200] flex items-end md:items-center justify-center p-0 md:p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-slate-900/40 backdrop-blur-md" />
            <motion.div
              initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }}
              className="relative w-full max-w-sm glass rounded-t-[2rem] md:rounded-[2.5rem] p-8 md:p-10 shadow-2xl text-center border-t md:border border-white/40"
            >
              <div className="w-12 h-12 md:w-16 md:h-16 bg-amber-100 text-amber-600 rounded-2xl flex items-center justify-center mx-auto mb-6"><Coffee size={24} /></div>
              <h3 className="text-xl md:text-2xl font-bold mb-2">¿Descansamos?</h3>
              <p className="text-slate-500 text-sm mb-8">¿Quieres cronometrar tu descanso de forma activa?</p>
              <div className="grid grid-cols-1 gap-3">
                <button
                  onClick={() => { setIsBreakActive(true); setIsPaused(true); setShowPauseModal(false); }}
                  className="py-4 bg-amber-500 text-white rounded-xl md:rounded-2xl font-bold shadow-lg text-sm"
                >Sí, cronometrar</button>
                <button
                  onClick={() => { setIsPaused(true); setShowPauseModal(false); }}
                  className="py-4 bg-white/60 text-slate-600 rounded-xl md:rounded-2xl font-bold border border-white text-sm"
                >Solo pausar</button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default FocusMode;
