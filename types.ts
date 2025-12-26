
export type TimerStyle =
  | 'minimalist'
  | 'circular'
  | 'flip'
  | 'vertical'
  | 'orbital'
  | 'typographic';

export type SessionMode = 'free' | 'interval';

export interface Topic {
  id: string;
  name: string;
  completed: boolean;
}

export interface Subject {
  id: string;
  name: string;
  color: string;
  topics: Topic[];
  archived?: boolean;
}

export interface IntervalPreset {
  id: string;
  name: string;
  studyMinutes: number;
  breakMinutes: number;
}

export interface Session {
  id: string;
  subjectId: string;
  topicId: string;
  date: string;
  duration: number; // en segundos
  pauseDuration: number; // en segundos
  notes: string;
  mode: SessionMode;
}

export interface UserProfile {
  name: string;
  email?: string;
  password?: string;
  age: string;
  educationLevel: string;
  activationExpiry?: string;
}

export type AppView = 'dashboard' | 'focus' | 'history' | 'summary' | 'subject-detail' | 'archived' | 'settings';

export interface IntervalConfig {
  studyMinutes: number;
  breakMinutes: number;
}

export interface AppState {
  view: AppView;
  subjects: Subject[];
  sessions: Session[];
  activeSubjectId?: string;
  activeTopicId?: string;
  lastSession?: Partial<Session>;
  timerStyle: TimerStyle;
  intervalConfig: IntervalConfig;
  intervalPresets: IntervalPreset[];
  userProfile?: UserProfile;
  tourState: Record<string, boolean>;
}
