
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { CheckCircle2, Clock, PauseCircle, StickyNote, RotateCcw, Save, Edit3 } from 'lucide-react';
import { Session, Subject, Topic } from '../types';

interface SummaryProps {
  session: Partial<Session>;
  subject: Subject;
  topic: Topic;
  onFinalize: (session: Session) => void;
  onResume: () => void;
}

const SessionSummary: React.FC<SummaryProps> = ({ session, subject, topic, onFinalize, onResume }) => {
  const [finalNotes, setFinalNotes] = useState(session.notes || '');
  
  // Estados para edición de tiempo
  const [studyMin, setStudyMin] = useState(Math.floor((session.duration || 0) / 60));
  const [studySec, setStudySec] = useState((session.duration || 0) % 60);
  const [pauseMin, setPauseMin] = useState(Math.floor((session.pauseDuration || 0) / 60));
  const [pauseSec, setPauseSec] = useState((session.pauseDuration || 0) % 60);

  const handleFinish = () => {
    onFinalize({
      ...session,
      id: Date.now().toString(),
      date: new Date().toISOString(),
      duration: studyMin * 60 + studySec,
      pauseDuration: pauseMin * 60 + pauseSec,
      notes: finalNotes
    } as Session);
  };

  const TimeInput = ({ label, min, sec, setMin, setSec, icon: Icon, colorClass }: any) => (
    <div className="glass p-6 rounded-3xl border border-white/60 flex flex-col items-center">
      <div className={`flex items-center gap-2 ${colorClass} mb-3`}>
        <Icon size={16}/>
        <span className="text-[10px] font-black uppercase tracking-widest">{label}</span>
      </div>
      <div className="flex items-center gap-2">
        <div className="flex flex-col items-center">
          <input 
            type="number" 
            value={min} 
            onChange={e => setMin(Math.max(0, parseInt(e.target.value) || 0))}
            className="w-16 bg-white/50 text-center text-2xl font-bold rounded-xl py-1 outline-none focus:ring-2 focus:ring-indigo-300 transition-all"
          />
          <span className="text-[8px] font-black text-slate-400 mt-1 uppercase tracking-widest">MIN</span>
        </div>
        <span className="text-xl font-bold text-slate-400">:</span>
        <div className="flex flex-col items-center">
          <input 
            type="number" 
            max="59"
            value={sec} 
            onChange={e => setSec(Math.min(59, Math.max(0, parseInt(e.target.value) || 0)))}
            className="w-16 bg-white/50 text-center text-2xl font-bold rounded-xl py-1 outline-none focus:ring-2 focus:ring-indigo-300 transition-all"
          />
          <span className="text-[8px] font-black text-slate-400 mt-1 uppercase tracking-widest">SEG</span>
        </div>
      </div>
    </div>
  );

  return (
    <div className="max-w-3xl mx-auto px-6 py-12 flex flex-col min-h-full">
      <header className="text-center mb-10">
        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="inline-flex w-16 h-16 bg-emerald-100 text-emerald-600 rounded-2xl items-center justify-center mb-4">
          <CheckCircle2 size={32} />
        </motion.div>
        <h1 className="text-3xl font-bold text-slate-800">¡Sesión de {subject.name} completada!</h1>
        <p className="text-slate-500 font-medium mt-1">Revisa tus estadísticas, edita el tiempo si es necesario y añade notas finales.</p>
      </header>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
        <TimeInput 
          label="Tiempo Estudio" 
          min={studyMin} sec={studySec} 
          setMin={setStudyMin} setSec={setStudySec} 
          icon={Clock} colorClass="text-indigo-500" 
        />
        <TimeInput 
          label="Tiempo Pausa" 
          min={pauseMin} sec={pauseSec} 
          setMin={setPauseMin} setSec={setPauseSec} 
          icon={PauseCircle} colorClass="text-rose-400" 
        />
      </div>

      <div className="flex-1 space-y-4 mb-10">
        <div className="flex items-center gap-2 px-2">
          <StickyNote size={16} className="text-slate-400"/>
          <h3 className="text-xs font-black uppercase tracking-widest text-slate-400">Notas de la sesión</h3>
        </div>
        <textarea 
          value={finalNotes}
          onChange={e => setFinalNotes(e.target.value)}
          placeholder="¿Qué has aprendido hoy? ¿Qué te ha costado más?..."
          className="w-full h-48 p-6 glass rounded-[2rem] border border-white/60 outline-none resize-none font-medium text-slate-600 shadow-inner focus:bg-white transition-all"
        />
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <button 
          onClick={onResume}
          className="flex-1 py-4 px-6 glass rounded-2xl font-bold text-slate-600 flex items-center justify-center gap-2 hover:bg-white/80 transition-all"
        >
          <RotateCcw size={18} />
          ¿Fue un error? Reanudar
        </button>
        <button 
          onClick={handleFinish}
          className="flex-[2] py-4 px-6 bg-indigo-500 text-white rounded-2xl font-bold flex items-center justify-center gap-2 shadow-xl shadow-indigo-100 hover:bg-indigo-600 transition-all"
        >
          <Save size={18} />
          Guardar y Finalizar
        </button>
      </div>
    </div>
  );
};

export default SessionSummary;
