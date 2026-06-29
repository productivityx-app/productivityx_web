import apiClient from './client';
import { PomodoroSession, PomodoroStats, PagedResponse } from '../types';

export const pomodoroApi = {
  start: (data: { type: string; taskId?: string }): Promise<PomodoroSession> =>
    apiClient.post('/pomodoro/sessions/start', data).then((r) => r.data.data || r.data),
  end: (id: string, data?: { actualDurationSeconds?: number }): Promise<PomodoroSession> =>
    apiClient.patch(`/pomodoro/sessions/${id}/end`, data || {}).then((r) => r.data.data || r.data),
  interrupt: (id: string, data?: { actualDurationSeconds?: number; interruptReason?: string }): Promise<PomodoroSession> =>
    apiClient.patch(`/pomodoro/sessions/${id}/interrupt`, data || {}).then((r) => r.data.data || r.data),
  getActive: (): Promise<PomodoroSession | null> =>
    apiClient.get('/pomodoro/sessions/active').then((r) => r.data.data || null).catch(() => null),
  get: (id: string): Promise<PomodoroSession> =>
    apiClient.get(`/pomodoro/sessions/${id}`).then((r) => r.data.data || r.data),
  list: (params?: { page?: number; size?: number; taskId?: string }): Promise<PagedResponse<PomodoroSession>> =>
    apiClient.get('/pomodoro/sessions', { params }).then((r) => r.data.data || r.data),
  getTodayStats: (): Promise<PomodoroStats> =>
    apiClient.get('/pomodoro/stats/today').then((r) => r.data.data || r.data),
};
