
import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Printer, Calendar, LayoutDashboard, Archive, Settings, HelpCircle, X } from 'lucide-react';

interface GuidedTourProps {
  tourName: string;
  onDismiss: () => void;
}

const tourSteps: Record<string, { title: string; description: string; icon: React.ReactNode }> = {
  'dashboard': {
    title: "Tu Centro de Control",
    description: "Usa el gran botón de arriba para empezar una sesión. ¡Crea tus primeras asignaturas abajo para organizarte!",
    icon: <LayoutDashboard className="text-indigo-500" />
  },
  'subject-detail': {
    title: "Análisis y Reportes",
    description: "Aquí puedes ver cuánto estudias por tema. ¡Truco! Usa el icono de la impresora para generar un PDF de tus progresos.",
    icon: <Printer className="text-emerald-500" />
  },
  'history': {
    title: "Filtros de Calendario",
    description: "Pulsa sobre una semana en el resumen para filtrar todas las sesiones de ese periodo. El historial es totalmente navegable.",
    icon: <Calendar className="text-amber-500" />
  },
  'archived': {
    title: "Tu Baúl Personal",
    description: "Cuando termines un curso o asignatura, archívalo aquí para mantener tu pantalla principal limpia y enfocada.",
    icon: <Archive className="text-slate-500" />
  },
  'settings': {
    title: "Personalización",
    description: "Configura tu perfil para que la app se adapte a tu nivel educativo. ¿Tienes ideas? ¡Usa la sección de sugerencias!",
    icon: <Settings className="text-rose-500" />
  }
};

const GuidedTour: React.FC<GuidedTourProps> = ({ tourName, onDismiss }) => {
  const step = tourSteps[tourName];
  if (!step) return null;

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.9, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.9, y: 20 }}
      className="fixed bottom-24 right-4 md:bottom-8 md:right-8 z-[200] w-[calc(100%-2rem)] md:w-80 glass rounded-[2.5rem] p-6 border-2 border-white shadow-2xl overflow-hidden"
    >
      <div className="absolute top-0 right-0 p-2">
        <button onClick={onDismiss} className="p-2 text-slate-300 hover:text-slate-500 transition-colors">
          <X size={16} />
        </button>
      </div>
      
      <div className="flex items-start gap-4">
        <div className="w-12 h-12 bg-white/60 rounded-2xl flex items-center justify-center shrink-0 shadow-sm">
          {step.icon}
        </div>
        <div className="flex-1 space-y-2">
          <h4 className="text-sm font-black text-slate-800 uppercase tracking-tight">{step.title}</h4>
          <p className="text-xs text-slate-500 font-medium leading-relaxed">
            {step.description}
          </p>
          <button 
            onClick={onDismiss}
            className="mt-2 text-[10px] font-black text-indigo-600 uppercase tracking-widest hover:underline"
          >
            Entendido
          </button>
        </div>
      </div>

      <div className="absolute -bottom-4 -left-4 w-16 h-16 bg-indigo-500/10 rounded-full blur-2xl" />
    </motion.div>
  );
};

export default GuidedTour;
