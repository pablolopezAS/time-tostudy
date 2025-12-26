
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Subject } from '../types';
import { Archive, RotateCcw, Trash2, ChevronLeft, AlertCircle, BookOpen } from 'lucide-react';

interface ArchivedSubjectsViewProps {
  subjects: Subject[];
  onRestore: (id: string) => void;
  onDelete: (id: string) => void;
  onBack: () => void;
}

const ArchivedSubjectsView: React.FC<ArchivedSubjectsViewProps> = ({ subjects, onRestore, onDelete, onBack }) => {
  const [subjectToDelete, setSubjectToDelete] = useState<Subject | null>(null);

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 sm:py-10 space-y-10 pb-40">
      <header className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button onClick={onBack} className="p-3 bg-white/50 rounded-2xl text-slate-400 hover:text-indigo-600 transition-all shadow-sm">
            <ChevronLeft size={24} />
          </button>
          <div>
            <h1 className="text-3xl font-black text-slate-800 tracking-tight uppercase">Clases Archivadas</h1>
            <p className="text-slate-500 font-medium italic text-sm">Gestiona tus asignaturas inactivas.</p>
          </div>
        </div>
        <div className="bg-indigo-50 text-indigo-600 px-4 py-2 rounded-2xl font-black text-xs uppercase tracking-widest">
          {subjects.length} Archivadas
        </div>
      </header>

      {subjects.length === 0 ? (
        <div className="p-20 glass rounded-[3rem] border-2 border-dashed border-slate-200 text-center">
          <Archive size={48} className="mx-auto text-slate-200 mb-6" />
          <h3 className="text-xl font-black text-slate-400 uppercase tracking-tight">Baúl Vacío</h3>
          <p className="text-slate-400 text-sm mt-2 italic">No tienes ninguna asignatura archivada.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {subjects.map((subject) => (
            <motion.div
              layout
              key={subject.id}
              className="glass rounded-[2.5rem] p-8 border border-white/60 relative overflow-hidden group"
            >
              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-white opacity-40 shadow-sm" style={{ backgroundColor: subject.color }}>
                  <BookOpen size={24} />
                </div>
                <h4 className="font-black text-lg text-slate-500 truncate leading-tight">{subject.name}</h4>
              </div>

              <div className="flex gap-3">
                <button 
                  onClick={() => onRestore(subject.id)}
                  className="flex-1 py-4 bg-white/60 hover:bg-white text-emerald-500 rounded-2xl font-black text-[10px] uppercase tracking-widest border border-white/60 shadow-sm transition-all flex items-center justify-center gap-2"
                >
                  <RotateCcw size={14} /> Restaurar
                </button>
                <button 
                  onClick={() => setSubjectToDelete(subject)}
                  className="py-4 px-6 bg-white/60 hover:bg-rose-50 text-rose-400 hover:text-rose-500 rounded-2xl font-black text-[10px] uppercase tracking-widest border border-white/60 shadow-sm transition-all"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* MODAL ELIMINAR PERMANENTE */}
      <AnimatePresence>
        {subjectToDelete && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setSubjectToDelete(null)} className="absolute inset-0 bg-slate-900/70 backdrop-blur-md" />
            <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} exit={{ scale: 0.9 }} className="relative glass w-full max-w-sm p-10 rounded-[3rem] text-center border border-white/40 shadow-2xl">
              <div className="w-16 h-16 bg-rose-50 text-rose-500 rounded-2xl flex items-center justify-center mx-auto mb-6"><AlertCircle size={32} /></div>
              <h3 className="text-xl font-black text-slate-800 uppercase tracking-tight mb-2">¿Eliminar Definitivamente?</h3>
              <p className="text-slate-500 text-xs font-bold leading-relaxed mb-4">
                Estás a punto de borrar <span className="text-slate-800">"{subjectToDelete.name}"</span> y todo su historial de sesiones.
              </p>
              <p className="text-rose-500 text-[10px] font-black uppercase tracking-widest mb-8">Esta acción no se puede deshacer.</p>
              <div className="flex gap-3">
                <button onClick={() => setSubjectToDelete(null)} className="flex-1 py-4 text-slate-400 font-black text-[10px] uppercase tracking-widest">Cancelar</button>
                <button 
                  onClick={() => { onDelete(subjectToDelete.id); setSubjectToDelete(null); }}
                  className="flex-[2] py-4 bg-rose-500 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-lg"
                >Sí, borrar todo</button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ArchivedSubjectsView;
