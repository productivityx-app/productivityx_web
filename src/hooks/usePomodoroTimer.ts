import { useEffect, useRef, useCallback } from 'react';
import { usePomodoroStore } from '../stores/pomodoroStore';
import { pomodoroApi } from '../api/pomodoro';
import { toast } from 'sonner';
import { useQueryClient } from '@tanstack/react-query';

export function usePomodoroTimer() {
  const { activeSession, isRunning, isPaused, timeRemaining, endTime, startSession, endSession, setIsRunning, setPaused, setTimeRemaining, setEndTime, interruptSession } = usePomodoroStore();
  const workerRef = useRef<Worker | null>(null);
  const endTimeRef = useRef<number>(endTime || 0);
  const qc = useQueryClient();

  useEffect(() => {
    if (endTime) endTimeRef.current = endTime;
  }, [endTime]);

  const cleanupWorker = useCallback(() => {
    if (workerRef.current) {
      workerRef.current.terminate();
      workerRef.current = null;
    }
  }, []);

  const completeSession = useCallback(() => {
    cleanupWorker();
    setIsRunning(false);
    setPaused(false);
    setEndTime(null);
    toast.success('Session complete!');
    if (activeSession) {
      pomodoroApi.end(activeSession.id).then(() => {
        endSession();
        qc.invalidateQueries({ queryKey: ['pom-stats'] });
      }).catch(() => {});
    }
  }, [activeSession, cleanupWorker, endSession, qc, setIsRunning, setPaused, setEndTime]);

  const handleWorkerMessage = useCallback((e: MessageEvent<{ remaining: number; done: boolean }>) => {
    const { remaining, done } = e.data;
    setTimeRemaining(remaining);
    if (done) completeSession();
  }, [completeSession, setTimeRemaining]);

  useEffect(() => {
    if (isRunning && !isPaused && activeSession) {
      cleanupWorker();
      try {
        const worker = new Worker(new URL('./timer.worker.ts', import.meta.url), { type: 'module' });
        worker.onmessage = handleWorkerMessage;
        worker.postMessage({ type: 'START', endTime: endTimeRef.current });
        workerRef.current = worker;
      } catch {
        const interval = setInterval(() => {
          const remaining = Math.max(0, Math.round((endTimeRef.current - Date.now()) / 1000));
          setTimeRemaining(remaining);
          if (remaining === 0) {
            clearInterval(interval);
            completeSession();
          }
        }, 200);
        return () => clearInterval(interval);
      }
    }
    return () => cleanupWorker();
  }, [isRunning, isPaused, activeSession?.id]);

  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (isRunning && activeSession) {
        e.preventDefault();
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [isRunning, activeSession]);

  const startTimer = useCallback((durationSeconds: number) => {
    endTimeRef.current = Date.now() + durationSeconds * 1000;
    setEndTime(endTimeRef.current);
    setIsRunning(true);
    setPaused(false);
  }, [setIsRunning, setPaused, setEndTime]);

  const pauseTimer = useCallback(() => {
    cleanupWorker();
    setEndTime(null);
    setPaused(true);
    setIsRunning(false);
  }, [cleanupWorker, setPaused, setIsRunning, setEndTime]);

  const resumeTimer = useCallback(() => {
    endTimeRef.current = Date.now() + timeRemaining * 1000;
    setEndTime(endTimeRef.current);
    setPaused(false);
    setIsRunning(true);
  }, [timeRemaining, setPaused, setIsRunning, setEndTime]);

  const stopTimer = useCallback(() => {
    cleanupWorker();
    setEndTime(null);
    endSession();
  }, [cleanupWorker, endSession, setEndTime]);

  const loadActiveSession = useCallback(async () => {
    try {
      const session = await pomodoroApi.getActive();
      if (session) {
        const elapsed = Math.floor((Date.now() - new Date(session.startedAt).getTime()) / 1000);
        const remaining = Math.max(0, session.plannedDurationSeconds - elapsed);
        startSession(session);
        setTimeRemaining(remaining);
        if (remaining > 0) {
          endTimeRef.current = Date.now() + remaining * 1000;
          setEndTime(endTimeRef.current);
          setIsRunning(true);
        }
      }
    } catch {
    }
  }, [startSession, setTimeRemaining, setIsRunning, setEndTime]);

  return {
    activeSession, isRunning, isPaused, timeRemaining,
    startTimer, pauseTimer, resumeTimer, stopTimer, loadActiveSession,
  };
}
