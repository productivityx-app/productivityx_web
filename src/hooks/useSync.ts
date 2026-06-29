import { useEffect, useRef, useCallback } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useAuthStore } from '../stores/authStore';
import { useUIStore } from '../stores/uiStore';
import { syncApi } from '../api/sync';

const SYNC_INTERVAL = 30000;

export function useSync() {
  const qc = useQueryClient();
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const isOnline = useUIStore((s) => s.isOnline);
  const lastSyncRef = useRef<string>(localStorage.getItem('px-last-synced') || new Date().toISOString());
  const intervalRef = useRef<ReturnType<typeof setInterval> | undefined>(undefined);

  const doSync = useCallback(async () => {
    if (!isAuthenticated || !isOnline) return;
    try {
      let hasMore = true;
      let cursor: string | undefined;
      let lastSyncedAt = lastSyncRef.current;
      while (hasMore) {
        const res = await syncApi.delta(lastSyncRef.current, cursor);
        lastSyncedAt = res.syncedAt;

        if (res.notes) {
          for (const note of res.notes) {
            if (note.deleted) {
              qc.removeQueries({ queryKey: ['note', note.id] });
            } else {
              qc.setQueryData(['note', note.id], note);
            }
          }
          if (res.notes.length > 0) qc.invalidateQueries({ queryKey: ['notes'] });
        }

        if (res.tasks) {
          for (const task of res.tasks) {
            if (task.deleted) {
              qc.removeQueries({ queryKey: ['task', task.id] });
            } else {
              qc.setQueryData(['task', task.id], task);
            }
          }
          if (res.tasks.length > 0) qc.invalidateQueries({ queryKey: ['tasks'] });
        }

        if (res.events) {
          for (const event of res.events) {
            if (event.deleted) {
              qc.removeQueries({ queryKey: ['event', event.id] });
            } else {
              qc.setQueryData(['event', event.id], event);
            }
          }
          if (res.events.length > 0) qc.invalidateQueries({ queryKey: ['events'] });
        }

        if (res.pomodoroSessions && res.pomodoroSessions.length > 0) {
          qc.invalidateQueries({ queryKey: ['pom-stats'] });
          qc.invalidateQueries({ queryKey: ['pom-sessions'] });
          qc.invalidateQueries({ queryKey: ['pom-stats-today'] });
        }

        hasMore = res.hasMore || false;
        cursor = res.nextCursor || undefined;
      }
      lastSyncRef.current = lastSyncedAt;
      localStorage.setItem('px-last-synced', lastSyncedAt);
    } catch {
      // silent retry on next interval
    }
  }, [isAuthenticated, isOnline, qc]);

  useEffect(() => {
    if (!isAuthenticated) return;
    intervalRef.current = setInterval(doSync, SYNC_INTERVAL);
    return () => clearInterval(intervalRef.current);
  }, [isAuthenticated, doSync]);

  useEffect(() => {
    const handleVisibility = () => {
      if (document.visibilityState === 'visible') doSync();
    };
    const handleFocus = () => doSync();
    document.addEventListener('visibilitychange', handleVisibility);
    window.addEventListener('focus', handleFocus);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibility);
      window.removeEventListener('focus', handleFocus);
    };
  }, [doSync]);

  return { doSync };
}
