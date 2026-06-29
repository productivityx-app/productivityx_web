import { create } from 'zustand';
import { PomodoroSession, PomodoroStats } from '../types';

interface PomodoroState {
  activeSession: PomodoroSession | null;
  sessions: PomodoroSession[];
  stats: PomodoroStats | null;
  isRunning: boolean;
  isPaused: boolean;
  timeRemaining: number;
  endTime: number | null;
  setActiveSession: (session: PomodoroSession | null) => void;
  startSession: (session: PomodoroSession) => void;
  endSession: () => void;
  interruptSession: () => void;
  setIsRunning: (running: boolean) => void;
  setPaused: (paused: boolean) => void;
  setTimeRemaining: (time: number) => void;
  setEndTime: (time: number | null) => void;
  tick: () => void;
  setStats: (stats: PomodoroStats) => void;
  setSessions: (sessions: PomodoroSession[]) => void;
}

const POMODORO_STORAGE_KEY = 'px-pomodoro-state';

function loadPersistedState(): Partial<PomodoroState> {
  try {
    const raw = localStorage.getItem(POMODORO_STORAGE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    const state: Partial<PomodoroState> = {};
    if (parsed.activeSession) state.activeSession = parsed.activeSession;
    if (typeof parsed.isRunning === 'boolean') state.isRunning = parsed.isRunning;
    if (typeof parsed.isPaused === 'boolean') state.isPaused = parsed.isPaused;
    if (typeof parsed.timeRemaining === 'number') state.timeRemaining = parsed.timeRemaining;
    if (typeof parsed.endTime === 'number') state.endTime = parsed.endTime;
    return state;
  } catch {
    return {};
  }
}

function persistState(state: Partial<PomodoroState>) {
  try {
    const data: Record<string, unknown> = {};
    if (state.activeSession) data.activeSession = state.activeSession;
    if (typeof state.isRunning === 'boolean') data.isRunning = state.isRunning;
    if (typeof state.isPaused === 'boolean') data.isPaused = state.isPaused;
    if (typeof state.timeRemaining === 'number') data.timeRemaining = state.timeRemaining;
    if (typeof state.endTime === 'number') data.endTime = state.endTime;
    localStorage.setItem(POMODORO_STORAGE_KEY, JSON.stringify(data));
  } catch {}
}

const persisted = loadPersistedState();

export const usePomodoroStore = create<PomodoroState>()((set) => ({
  activeSession: persisted.activeSession || null,
  sessions: [],
  stats: null,
  isRunning: persisted.isRunning || false,
  isPaused: persisted.isPaused || false,
  timeRemaining: persisted.timeRemaining || 0,
  endTime: persisted.endTime || null,
  setActiveSession: (activeSession) => set((s) => { persistState({ ...s, activeSession }); return { activeSession }; }),
  startSession: (session) => set((s) => {
    const next = { activeSession: session, isRunning: true, isPaused: false, timeRemaining: session.plannedDurationSeconds };
    persistState(next);
    return next;
  }),
  endSession: () => set(() => {
    const next = { activeSession: null, isRunning: false, isPaused: false, timeRemaining: 0, endTime: null };
    persistState(next);
    return next;
  }),
  interruptSession: () => set(() => {
    const next = { isRunning: false, isPaused: false, timeRemaining: 0, endTime: null };
    persistState(next);
    return next;
  }),
  setIsRunning: (isRunning) => set((s) => { persistState({ ...s, isRunning }); return { isRunning }; }),
  setPaused: (isPaused) => set((s) => { persistState({ ...s, isPaused }); return { isPaused }; }),
  setTimeRemaining: (timeRemaining) => set((s) => { persistState({ ...s, timeRemaining }); return { timeRemaining }; }),
  setEndTime: (endTime) => set((s) => { persistState({ ...s, endTime }); return { endTime }; }),
  tick: () => set((s) => ({ timeRemaining: Math.max(0, s.timeRemaining - 1) })),
  setStats: (stats) => set({ stats }),
  setSessions: (sessions) => set({ sessions }),
}));
