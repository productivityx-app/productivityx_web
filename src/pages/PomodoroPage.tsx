import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Play, Pause, Square, SkipForward, Maximize2, History, Timer, RotateCcw } from 'lucide-react';
import { toast } from 'sonner';
import { AnimatePresence, motion } from 'framer-motion';
import { pomodoroApi } from '../api/pomodoro';
import { tasksApi } from '../api/tasks';
import { usePomodoroStore } from '../stores/pomodoroStore';
import { usePomodoroTimer } from '../hooks/usePomodoroTimer';
import { useTranslation } from 'react-i18next';
import { useAuthStore } from '../stores/authStore';
import SessionSetup from '../components/pomodoro/SessionSetup';
import TimerRing from '../components/pomodoro/TimerRing';
import FocusMode from '../components/pomodoro/FocusMode';
import BreakScreen from '../components/pomodoro/BreakScreen';
import { playNotification } from '@/lib/playNotification';
import { SoundType } from '../components/pomodoro/SoundSelector';

const TYPE_COLORS: Record<string, string> = {
  FOCUS: '#EF4444',
  SHORT_BREAK: '#22C55E',
  LONG_BREAK: '#3B82F6',
};

const TYPE_LABEL_KEYS: Record<string, string> = {
  FOCUS: 'pomodoro.focus',
  SHORT_BREAK: 'pomodoro.shortBreak',
  LONG_BREAK: 'pomodoro.longBreak',
};

export default function PomodoroPage() {
  useEffect(() => { document.title = 'Pomodoro Timer — ProductivityX'; }, []);
  const { t } = useTranslation();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const { preferences } = useAuthStore();
  const { startSession, endSession } = usePomodoroStore();
  const { activeSession, isRunning, isPaused, timeRemaining, startTimer, pauseTimer, resumeTimer, stopTimer, loadActiveSession } = usePomodoroTimer();

  const [phase, setPhase] = useState<'idle' | 'focus' | 'fullscreen' | 'break'>('idle');
  const [currentType, setCurrentType] = useState<'FOCUS' | 'SHORT_BREAK' | 'LONG_BREAK'>('FOCUS');
  const [cyclesCompleted, setCyclesCompleted] = useState(0);
  const [autoStartNext, setAutoStartNext] = useState(preferences?.pomodoroAutoStartBreaks ?? false);
  const [intention, setIntention] = useState('');
  const [linkedTaskId, setLinkedTaskId] = useState('');

  const lastRunningRef = useRef(false);
  const completedTypeRef = useRef<'FOCUS' | 'SHORT_BREAK' | 'LONG_BREAK'>('FOCUS');

  const focusMins = preferences?.pomodoroFocusMinutes || 25;
  const shortBreakMins = preferences?.pomodoroShortBreakMinutes || 5;
  const longBreakMins = preferences?.pomodoroLongBreakMinutes || 15;
  const cyclesBeforeLongBreak = preferences?.pomodoroCyclesBeforeLongBreak || 4;

  const { data: tasksData } = useQuery({
    queryKey: ['tasks-for-pom'],
    queryFn: () => tasksApi.list({ size: 50, status: 'TODO' }),
    staleTime: 60000,
  });

  useEffect(() => { loadActiveSession(); }, []);

  const totalDuration = activeSession ? activeSession.plannedDurationSeconds : 0;
  const typeColor = TYPE_COLORS[currentType] || '#EF4444';

  const startMutation = useMutation({
    mutationFn: (opts: { type: 'FOCUS' | 'SHORT_BREAK' | 'LONG_BREAK'; taskId?: string }) =>
      pomodoroApi.start({ type: opts.type, taskId: opts.taskId }),
    onSuccess: (session) => {
      startSession(session);
      startTimer(session.plannedDurationSeconds);
      completedTypeRef.current = session.type as 'FOCUS' | 'SHORT_BREAK' | 'LONG_BREAK';
      setCurrentType(session.type as 'FOCUS' | 'SHORT_BREAK' | 'LONG_BREAK');
    },
    onError: () => toast.error(t('pomodoro.failedToStart')),
  });

  const handleStart = (opts: { type: 'focus' | 'shortBreak' | 'longBreak'; duration: number; taskId?: string; intention?: string; sound?: SoundType; volume?: number }) => {
    const apiType = opts.type === 'focus' ? 'FOCUS' : opts.type === 'shortBreak' ? 'SHORT_BREAK' : 'LONG_BREAK';
    setIntention(opts.intention || '');
    setLinkedTaskId(opts.taskId || '');
    setPhase('focus');
    setCurrentType(apiType);
    startMutation.mutate({ type: apiType, taskId: opts.taskId });
  };

  // Detect timer completion and handle transitions
  useEffect(() => {
    const wasRunning = lastRunningRef.current;
    lastRunningRef.current = isRunning;

    if (wasRunning && !isRunning && timeRemaining === 0 && phase !== 'idle') {
      if (preferences?.pomodoroSoundEnabled !== false) playNotification();
      const completedType = completedTypeRef.current;
      if (completedType === 'FOCUS') {
        const newCycles = cyclesCompleted + 1;
        setCyclesCompleted(newCycles);
        const isLong = newCycles % cyclesBeforeLongBreak === 0;
        const breakApiType = isLong ? 'LONG_BREAK' : 'SHORT_BREAK';
        const breakDuration = (isLong ? longBreakMins : shortBreakMins) * 60;

        pomodoroApi.start({ type: breakApiType })
          .then((session) => {
            startSession(session);
            startTimer(session.plannedDurationSeconds);
            completedTypeRef.current = breakApiType;
            setCurrentType(breakApiType);
            setPhase('break');
            qc.invalidateQueries({ queryKey: ['pom-stats'] });
          })
          .catch(() => { setPhase('idle'); });
      } else {
        setPhase('idle');
        setCurrentType('FOCUS');
        qc.invalidateQueries({ queryKey: ['pom-stats'] });
      }
    }
  }, [isRunning, timeRemaining]);

  const handlePauseResume = () => {
    if (isPaused) resumeTimer();
    else pauseTimer();
  };

  const handleSkip = () => {
    if (!activeSession) return;
    pomodoroApi.end(activeSession.id).then(() => {
      stopTimer();
      endSession();
      qc.invalidateQueries({ queryKey: ['pom-stats'] });
      toast.success(t('pomodoro.sessionEnded'));
    }).catch(() => {});
  };

  const handleStop = () => {
    if (!activeSession) return;
    pomodoroApi.interrupt(activeSession.id).then(() => {
      stopTimer();
      endSession();
      setPhase('idle');
      setCurrentType('FOCUS');
    }).catch(() => {});
  };

  const handleNextSession = () => {
    setPhase('idle');
    setCurrentType('FOCUS');
  };

  const handleExitFullscreen = () => {
    setPhase('focus');
  };

  return (
    <div className="min-h-full p-6">
      <AnimatePresence mode="wait">
        {phase === 'idle' && (
          <motion.div key="setup" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <div className="flex items-center justify-between mb-6">
              <h1 className="text-xl font-bold text-foreground">{t('pomodoro.title')}</h1>
              <button onClick={() => navigate('/pomodoro/history')} className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors">
                <History size={14} />{t('pomodoro.history')}
              </button>
            </div>

            {activeSession && timeRemaining > 0 && (
              <div className="mb-6 p-4 rounded-xl bg-primary/5 border border-primary/20 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <Timer size={18} className="text-primary" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-foreground">{t('pomodoro.sessionInProgress')}</p>
                    <p className="text-xs text-muted-foreground">
                      {Math.floor(timeRemaining / 60)}:{(timeRemaining % 60).toString().padStart(2, '0')} {t('pomodoro.remaining')}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => { setPhase('focus'); setCurrentType(activeSession.type as 'FOCUS' | 'SHORT_BREAK' | 'LONG_BREAK'); }}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 transition-all"
                >
                  <RotateCcw size={14} />
                  {t('pomodoro.resume')}
                </button>
              </div>
            )}

            <SessionSetup
              onStart={handleStart}
              tasks={tasksData?.content?.map((t: any) => ({ id: t.id, title: t.title }))}
            />
          </motion.div>
        )}

        {phase === 'focus' && (
          <motion.div key="focus" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex flex-col items-center justify-center py-8">
            <div className="flex items-center justify-between w-full max-w-xs mb-6">
              <span className="text-sm font-medium text-muted-foreground">{t(TYPE_LABEL_KEYS[currentType])}</span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setPhase('fullscreen')}
                  className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent transition-all"
                  title={t('pomodoro.exitFocus')}
                >
                  <Maximize2 size={14} />
                </button>
                <button onClick={() => navigate('/pomodoro/history')} className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent transition-all">
                  <History size={14} />
                </button>
              </div>
            </div>

            <TimerRing
              timeRemaining={timeRemaining}
              totalDuration={totalDuration}
              color={typeColor}
              label={t(TYPE_LABEL_KEYS[currentType])}
            />

            {intention && (
              <p className="text-sm text-muted-foreground/60 italic mt-4 max-w-xs text-center">"{intention}"</p>
            )}

            <div className="flex items-center gap-4 mt-8">
              <button
                onClick={handleStop}
                className="p-3 rounded-full text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-all"
              >
                <Square size={18} />
              </button>
              <button
                onClick={handlePauseResume}
                className="w-16 h-16 rounded-full bg-foreground text-background flex items-center justify-center hover:opacity-90 transition-all active:scale-95 shadow-lg"
              >
                {isPaused ? <Play size={24} fill="currentColor" /> : <Pause size={24} fill="currentColor" />}
              </button>
              <button
                onClick={handleSkip}
                className="p-3 rounded-full text-muted-foreground hover:text-foreground hover:bg-accent transition-all"
              >
                <SkipForward size={18} />
              </button>
            </div>
          </motion.div>
        )}

        {phase === 'fullscreen' && activeSession && (
          <FocusMode
            key="fullscreen"
            timeRemaining={timeRemaining}
            totalDuration={totalDuration}
            color={typeColor}
            label={t(TYPE_LABEL_KEYS[currentType])}
            taskName={activeSession.taskId ? tasksData?.content?.find((t: any) => t.id === activeSession.taskId)?.title : undefined}
            intention={intention}
            isRunning={isRunning}
            isPaused={isPaused}
            onPauseResume={handlePauseResume}
            onSkip={handleSkip}
            onStop={handleStop}
            onExit={handleExitFullscreen}
          />
        )}

        {phase === 'break' && (
          <motion.div key="break" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <BreakScreen
              timeRemaining={timeRemaining}
              totalDuration={totalDuration}
              isBreak={currentType === 'SHORT_BREAK' || currentType === 'LONG_BREAK'}
              onSkip={handleNextSession}
              onStartNext={handleNextSession}
              autoStart={autoStartNext}
              onAutoStartChange={setAutoStartNext}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
