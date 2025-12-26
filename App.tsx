
import React, { useState, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import {
  LayoutDashboard,
  Calendar,
  Clock,
  Settings2,
  Archive,
  Maximize,
  Minimize,
  Loader2
} from 'lucide-react';
import { AppState, AppView, Subject, Session, TimerStyle, Topic, SessionMode, IntervalConfig, IntervalPreset, UserProfile } from './types';
import Dashboard from './components/Dashboard';
import FocusMode from './components/FocusMode';
import HistoryView from './components/HistoryView';
import SessionSummary from './components/SessionSummary';
import SubjectDetailView from './components/SubjectDetailView';
import ArchivedSubjectsView from './components/ArchivedSubjectsView';
import SettingsView from './components/SettingsView';
import OnboardingOverlay from './components/OnboardingOverlay';
import GuidedTour from './components/GuidedTour';
import Auth from './components/Auth';
import { supabase } from './lib/supabase';

const App: React.FC = () => {
  const [session, setSession] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
  const [state, setState] = useState<AppState>({
    view: 'dashboard',
    subjects: [],
    sessions: [],
    timerStyle: 'circular',
    intervalConfig: { studyMinutes: 25, breakMinutes: 5 },
    intervalPresets: [
      { id: 'p1', name: 'Pomodoro', studyMinutes: 25, breakMinutes: 5 },
      { id: 'p2', name: 'Estudio Intenso', studyMinutes: 50, breakMinutes: 10 }
    ],
    userProfile: {
      name: '',
      age: '',
      educationLevel: 'Otros'
    },
    tourState: {}
  });

  const [isFullScreen, setIsFullScreen] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [activeTour, setActiveTour] = useState<string | null>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session) {
        fetchInitialData(session.user.id);
      } else {
        setLoading(false);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session) {
        fetchInitialData(session.user.id);
      } else {
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchInitialData = async (userId: string) => {
    setLoading(true);
    try {
      // 1. Fetch Profile
      const { data: profileData } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (profileData) {
        setState(prev => ({
          ...prev,
          userProfile: {
            name: profileData.full_name,
            age: profileData.age,
            educationLevel: profileData.education_level,
            email: session?.user?.email
          }
        }));
      } else {
        // No profile? Show onboarding
        setShowOnboarding(true);
      }

      // 2. Fetch Settings
      const { data: settingsData } = await supabase
        .from('user_settings')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (settingsData) {
        setState(prev => ({
          ...prev,
          timerStyle: settingsData.timer_style as TimerStyle,
          intervalConfig: settingsData.interval_config as IntervalConfig,
          intervalPresets: settingsData.interval_presets as IntervalPreset[],
          tourState: settingsData.tour_state as Record<string, boolean> || {}
        }));
      }

      // 3. Fetch Subjects & Topics
      const { data: subjectsData } = await supabase
        .from('subjects')
        .select('*, topics(*)')
        .eq('user_id', userId);

      if (subjectsData) {
        setState(prev => ({ ...prev, subjects: subjectsData }));
      }

      // 4. Fetch Sessions
      const { data: sessionsData } = await supabase
        .from('sessions')
        .select('*')
        .eq('user_id', userId);

      if (sessionsData) {
        setState(prev => ({
          ...prev,
          sessions: sessionsData.map((s: any) => ({
            id: s.id,
            subjectId: s.subject_id,
            topicId: s.topic_id,
            date: s.date,
            duration: s.duration,
            pauseDuration: s.pause_duration,
            notes: s.notes,
            mode: s.mode
          }))
        }));
      }

    } catch (err) {
      console.error('Error fetching data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const handleFullScreenChange = () => {
      setIsFullScreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFullScreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullScreenChange);
  }, []);

  useEffect(() => {
    if (!session || showOnboarding) return;

    const tourKey = `tour_${state.view}`;
    const alreadySeen = state.tourState[tourKey];

    // Only show tour if not already seen and onboarding is not active
    if (!alreadySeen && !showOnboarding) {
      const timer = setTimeout(() => {
        setActiveTour(state.view);
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [state.view, showOnboarding, session, state.tourState]);

  const handleFinishOnboarding = () => {
    setShowOnboarding(false);
    if (session) fetchInitialData(session.user.id);
  };

  const handleFinishTour = async (tourName: string) => {
    const tourKey = `tour_${tourName}`;
    const newTourState = { ...state.tourState, [tourKey]: true };
    setState(prev => ({ ...prev, tourState: newTourState }));
    setActiveTour(null);
    await supabase.from('user_settings').update({ tour_state: newTourState }).eq('user_id', session.user.id);
  };

  const toggleFullScreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(err => {
        console.error(`Error al intentar activar pantalla completa: ${err.message}`);
      });
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      }
    }
  };

  const navigateTo = (view: AppView, subjectId?: string) => {
    setState(prev => ({ ...prev, view, activeSubjectId: subjectId || prev.activeSubjectId }));
  };

  const toggleArchiveSubject = async (id: string) => {
    const subject = state.subjects.find(s => s.id === id);
    if (!subject) return;

    const newArchived = !subject.archived;
    setState(prev => ({
      ...prev,
      subjects: prev.subjects.map(s => s.id === id ? { ...s, archived: newArchived } : s)
    }));

    await supabase.from('subjects').update({ archived: newArchived }).eq('id', id);
  };

  const deleteSubject = async (id: string) => {
    setState(prev => ({
      ...prev,
      subjects: prev.subjects.filter(s => s.id !== id),
      sessions: prev.sessions.filter(s => s.subjectId !== id)
    }));

    await supabase.from('subjects').delete().eq('id', id);
  };

  const startSession = (subjectId: string, topicId: string, mode: SessionMode, config?: IntervalConfig) => {
    setState(prev => ({
      ...prev,
      view: 'focus',
      activeSubjectId: subjectId,
      activeTopicId: topicId,
      intervalConfig: config || prev.intervalConfig,
      lastSession: { mode, subjectId, topicId }
    }));
  };

  const handleAutoSave = async (sessionData: Session) => {
    const payload = {
      user_id: session.user.id,
      subject_id: sessionData.subjectId,
      topic_id: sessionData.topicId,
      date: sessionData.date,
      duration: sessionData.duration,
      pause_duration: sessionData.pauseDuration,
      notes: sessionData.notes,
      mode: sessionData.mode
    };

    if (currentSessionId) {
      await supabase.from('sessions').update(payload).eq('id', currentSessionId);
    } else {
      const { data } = await supabase.from('sessions').insert(payload).select().single();
      if (data) setCurrentSessionId(data.id);
    }
  };

  const addIntervalPreset = async (preset: Omit<IntervalPreset, 'id'>) => {
    const newPreset = { ...preset, id: Date.now().toString() };
    const newPresets = [...state.intervalPresets, newPreset];

    setState(prev => ({ ...prev, intervalPresets: newPresets }));

    await supabase.from('user_settings').update({ interval_presets: newPresets }).eq('user_id', session.user.id);
  };

  const deleteIntervalPreset = async (id: string) => {
    const newPresets = state.intervalPresets.filter(p => p.id !== id);
    setState(prev => ({ ...prev, intervalPresets: newPresets }));
    await supabase.from('user_settings').update({ interval_presets: newPresets }).eq('user_id', session.user.id);
  };

  const endSession = (sessionData: Partial<Session>) => {
    setState(prev => ({
      ...prev,
      view: 'summary',
      lastSession: { ...prev.lastSession, ...sessionData }
    }));
  };

  const finalizeSession = async (finalData: Session) => {
    setState(prev => ({
      ...prev,
      view: 'dashboard',
      sessions: [...prev.sessions.filter(s => s.id !== currentSessionId), finalData],
      lastSession: undefined
    }));

    const payload = {
      user_id: session.user.id,
      subject_id: finalData.subjectId,
      topic_id: finalData.topicId,
      date: finalData.date,
      duration: finalData.duration,
      pause_duration: finalData.pauseDuration,
      notes: finalData.notes,
      mode: finalData.mode
    };

    if (currentSessionId) {
      await supabase.from('sessions').update(payload).eq('id', currentSessionId);
    } else {
      await supabase.from('sessions').insert(payload);
    }

    setCurrentSessionId(null);
    fetchInitialData(session.user.id); // Refresh data
  };

  const addSubject = async (name: string, color: string) => {
    const { data, error } = await supabase.from('subjects').insert({
      user_id: session.user.id,
      name,
      color,
      archived: false
    }).select().single();

    if (data) {
      const newSub: Subject = { ...data, topics: [] };
      setState(prev => ({ ...prev, subjects: [...prev.subjects, newSub] }));
    }
  };

  const addTopic = async (subjectId: string, topicName: string) => {
    const { data, error } = await supabase.from('topics').insert({
      subject_id: subjectId,
      name: topicName,
      completed: false
    }).select().single();

    if (data) {
      setState(prev => ({
        ...prev,
        subjects: prev.subjects.map(s => s.id === subjectId ? {
          ...s,
          topics: [...s.topics, data]
        } : s)
      }));
    }
  };

  const updateUserProfile = (profile: UserProfile) => {
    setState(prev => ({ ...prev, userProfile: profile }));
  };

  const renderView = () => {
    switch (state.view) {
      case 'dashboard':
        return (
          <Dashboard
            subjects={state.subjects.filter(s => !s.archived)}
            intervalPresets={state.intervalPresets}
            onStartSession={startSession}
            onAddSubject={addSubject}
            onAddTopic={addTopic}
            onAddIntervalPreset={addIntervalPreset}
            onDeleteIntervalPreset={deleteIntervalPreset}
            onViewDetails={(id) => navigateTo('subject-detail', id)}
            onArchiveSubject={toggleArchiveSubject}
          />
        );
      case 'subject-detail':
        const detailSub = state.subjects.find(s => s.id === state.activeSubjectId);
        return (
          <SubjectDetailView
            subject={detailSub!}
            sessions={state.sessions.filter(s => s.subjectId === state.activeSubjectId)}
            onBack={() => navigateTo('dashboard')}
          />
        );
      case 'archived':
        return (
          <ArchivedSubjectsView
            subjects={state.subjects.filter(s => s.archived)}
            onRestore={toggleArchiveSubject}
            onDelete={deleteSubject}
            onBack={() => navigateTo('dashboard')}
          />
        );
      case 'focus':
        const activeSub = state.subjects.find(s => s.id === state.activeSubjectId);
        const activeTop = activeSub?.topics.find(t => t.id === state.activeTopicId);
        return (
          <FocusMode
            subject={activeSub!}
            topic={activeTop!}
            mode={state.lastSession?.mode as SessionMode || 'free'}
            intervalConfig={state.intervalConfig}
            onEnd={endSession}
            initialStyle={state.timerStyle}
            onStyleChange={async (s) => {
              setState(prev => ({ ...prev, timerStyle: s }));
              await supabase.from('user_settings').update({ timer_style: s }).eq('user_id', session.user.id);
            }}
            onCancel={() => navigateTo('dashboard')}
            onAutoSave={handleAutoSave}
          />
        );
      case 'summary':
        const summarySub = state.subjects.find(s => s.id === state.lastSession?.subjectId);
        const summaryTop = summarySub?.topics.find(t => t.id === state.lastSession?.topicId);
        return (
          <SessionSummary
            session={state.lastSession!}
            subject={summarySub!}
            topic={summaryTop!}
            onFinalize={finalizeSession}
            onResume={() => navigateTo('focus')}
          />
        );
      case 'history':
        return <HistoryView sessions={state.sessions} subjects={state.subjects} />;
      case 'settings':
        return (
          <SettingsView
            profile={state.userProfile || { name: '', age: '', educationLevel: 'Otros' }}
            onUpdate={updateUserProfile}
            onIntervalPresetsUpdate={async (p: IntervalPreset[]) => {
              setState(prev => ({ ...prev, intervalPresets: p }));
              await supabase.from('user_settings').update({ interval_presets: p }).eq('user_id', session.user.id);
            }}
          />
        );
      default:
        return null;
    }
  };

  if (loading) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-10 h-10 text-indigo-500 animate-spin" />
          <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">Cargando tu progreso...</p>
        </div>
      </div>
    );
  }

  if (!session) {
    return <Auth onSuccess={() => { }} />;
  }

  return (
    <div className="relative h-screen w-full flex flex-col md:flex-row overflow-hidden bg-slate-50/50">
      <AnimatePresence>
        {showOnboarding && <OnboardingOverlay onComplete={handleFinishOnboarding} />}
      </AnimatePresence>

      <AnimatePresence>
        {activeTour && <GuidedTour tourName={activeTour} onDismiss={() => handleFinishTour(activeTour)} />}
      </AnimatePresence>

      <nav className="z-50 w-full md:w-20 glass md:h-screen flex md:flex-col items-center justify-around md:justify-center gap-4 md:gap-6 py-3 md:py-4 border-b md:border-b-0 md:border-r border-white/40 shrink-0">
        <div className="hidden md:flex mb-auto">
          <div className="w-10 h-10 bg-indigo-500 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-200">
            <Clock className="w-6 h-6 text-white" />
          </div>
        </div>
        <NavButton active={state.view === 'dashboard' || state.view === 'subject-detail'} onClick={() => navigateTo('dashboard')} icon={<LayoutDashboard />} label="Estudio" />
        <NavButton active={state.view === 'history'} onClick={() => navigateTo('history')} icon={<Calendar />} label="Historial" />
        <NavButton active={state.view === 'archived'} onClick={() => navigateTo('archived')} icon={<Archive />} label="Archivados" />

        <NavButton active={false} onClick={toggleFullScreen} icon={isFullScreen ? <Minimize /> : <Maximize />} label={isFullScreen ? "Salir de pantalla completa" : "Pantalla completa"} />

        <div className="md:flex mt-auto">
          <NavButton active={state.view === 'settings'} onClick={() => navigateTo('settings')} icon={<Settings2 />} label="Ajustes" />
        </div>
      </nav>

      <main className="flex-1 overflow-hidden relative min-h-0">
        <AnimatePresence mode="wait">
          <motion.div
            key={state.view}
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -10 }}
            transition={{ duration: 0.2 }}
            className="h-full w-full overflow-y-auto overflow-x-hidden scroll-smooth"
          >
            {renderView()}
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  );
};

const NavButton: React.FC<{ active: boolean; onClick: () => void; icon: any; label: string }> = ({ active, onClick, icon, label }) => (
  <button
    onClick={onClick}
    className={`p-3 rounded-xl transition-all ${active ? 'bg-white shadow-sm text-indigo-600' : 'text-slate-400 hover:text-slate-600'}`}
    title={label}
  >
    {React.cloneElement(icon, { size: 24 })}
  </button>
);

export default App;

