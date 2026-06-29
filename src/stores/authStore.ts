import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { UserResponse } from '../types';

function toUser(r: UserResponse) {
  return {
    id: r.id, email: r.email, username: r.username, phone: r.phone,
    emailVerified: r.emailVerified, gender: r.gender, birthDate: r.birthDate,
    lastLoginAt: r.lastLoginAt, createdAt: r.createdAt,
  };
}

function toProfile(r: UserResponse) {
  return {
    id: `${r.id}-profile`, userId: r.id, firstName: r.firstName, lastName: r.lastName,
    fullName: `${r.firstName} ${r.lastName}`, avatarUrl: r.avatarUrl, bio: r.bio,
    timezone: r.timezone, language: r.language, theme: r.theme, createdAt: r.createdAt, updatedAt: r.updatedAt,
  };
}

function toPreferences(r: UserResponse) {
  return {
    id: `${r.id}-prefs`, userId: r.id,
    pomodoroFocusMinutes: r.pomodoroFocusMinutes, pomodoroShortBreakMinutes: r.pomodoroShortBreakMinutes,
    pomodoroLongBreakMinutes: r.pomodoroLongBreakMinutes, pomodoroCyclesBeforeLongBreak: r.pomodoroCyclesBeforeLongBreak,
    pomodoroAutoStartBreaks: r.pomodoroAutoStartBreaks, pomodoroAutoStartFocus: r.pomodoroAutoStartFocus,
    pomodoroSoundEnabled: r.pomodoroSoundEnabled, notifyTaskReminders: r.notifyTaskReminders,
    notifyEventReminders: r.notifyEventReminders, notifyPomodoroEnd: r.notifyPomodoroEnd,
    notifyDailySummary: r.notifyDailySummary, defaultTaskView: r.defaultTaskView, defaultTaskSort: r.defaultTaskSort,
    showCompletedTasks: r.showCompletedTasks, defaultCalendarView: r.defaultCalendarView, weekStartsOn: r.weekStartsOn,
    aiContextEnabled: r.aiContextEnabled, aiModel: r.aiModel, compactMode: r.compactMode, updatedAt: r.updatedAt,
  };
}

interface AuthState {
  user: ReturnType<typeof toUser> | null;
  profile: ReturnType<typeof toProfile> | null;
  preferences: ReturnType<typeof toPreferences> | null;
  accessToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (payload: { accessToken: string; user: UserResponse }) => void;
  logout: () => void;
  setLoading: (loading: boolean) => void;
  setAccessToken: (token: string) => void;
  updateUser: (user: ReturnType<typeof toUser>) => void;
  updateProfile: (profile: ReturnType<typeof toProfile>) => void;
  updatePreferences: (preferences: ReturnType<typeof toPreferences>) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null, profile: null, preferences: null,
      accessToken: null, isAuthenticated: false, isLoading: true,
      login: ({ accessToken, user }) => set({
        accessToken, isAuthenticated: true,
        user: toUser(user),
        profile: toProfile(user),
        preferences: toPreferences(user),
      }),
      logout: () => set({ user: null, profile: null, preferences: null, accessToken: null, isAuthenticated: false }),
      setLoading: (isLoading) => set({ isLoading }),
      setAccessToken: (accessToken) => set({ accessToken }),
      updateUser: (user) => set({ user }),
      updateProfile: (profile) => set({ profile }),
      updatePreferences: (preferences) => set({ preferences }),
    }),
    { name: 'px-auth', partialize: (state) => ({ accessToken: state.accessToken }) }
  )
);
