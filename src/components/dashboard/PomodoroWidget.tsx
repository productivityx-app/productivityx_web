import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Timer, Play, Pause } from 'lucide-react';
import { motion } from 'framer-motion';
import { usePomodoroStore } from '@/stores/pomodoroStore';

function formatTime(seconds: number) {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
}

interface Props {
  totalFocusMinutesToday: number;
  completedSessionsToday: number;
}

export default function PomodoroWidget({ totalFocusMinutesToday, completedSessionsToday }: Props) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { activeSession, isRunning, isPaused, timeRemaining } = usePomodoroStore();

  const hasSession = !!activeSession;
  const progress = activeSession && activeSession.plannedDurationSeconds > 0
    ? 1 - timeRemaining / activeSession.plannedDurationSeconds
    : 0;

  const radius = 36;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference * (1 - Math.min(progress, 1));

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.45, ease: 'easeOut' }}
      whileHover={{ y: -1 }}
      onClick={() => navigate('/pomodoro')}
      className="bg-card border border-border rounded-xl p-4 cursor-pointer group relative overflow-hidden"
    >
      <div className="flex items-center gap-3 mb-3">
        <div className="w-8 h-8 rounded-lg bg-amber-500/15 flex items-center justify-center">
          <Timer size={16} className="text-amber-500" />
        </div>
        <span className="text-xs font-semibold text-foreground uppercase tracking-wider">
          {t('pomodoro.title')}
        </span>
      </div>

      <div className="flex items-center gap-4">
        <div className="relative flex-shrink-0">
          <svg width="84" height="84" viewBox="0 0 84 84">
            <circle cx="42" cy="42" r={radius} fill="none" stroke="hsl(var(--muted))" strokeWidth="6" />
            <motion.circle
              cx="42" cy="42" r={radius} fill="none"
              stroke="hsl(var(--primary))" strokeWidth="6" strokeLinecap="round"
              strokeDasharray={circumference}
              initial={false}
              animate={{ strokeDashoffset: offset }}
              transition={{ duration: 0.5, ease: 'easeOut' }}
              transform="rotate(-90 42 42)"
            />
            <circle cx="42" cy="42" r={radius - 2} fill="none" stroke="hsl(var(--primary))" strokeWidth="2" opacity={0.1} />
          </svg>
          {hasSession ? (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center">
                <p className="text-lg font-bold text-foreground tabular-nums leading-none">{formatTime(timeRemaining)}</p>
                <p className="text-[9px] text-muted-foreground mt-0.5">{activeSession.type === 'FOCUS' ? t('pomodoro.focus') : activeSession.type === 'SHORT_BREAK' ? t('pomodoro.shortBreak') : t('pomodoro.longBreak')}</p>
              </div>
            </div>
          ) : (
            <div className="absolute inset-0 flex items-center justify-center">
              <Timer size={24} className="text-muted-foreground/40" />
            </div>
          )}
        </div>

        <div className="flex-1 min-w-0">
          <p className="text-xl font-bold text-foreground tabular-nums">{totalFocusMinutesToday} <span className="text-xs font-normal text-muted-foreground">{t('pomodoro.minutes')}</span></p>
          <p className="text-xs text-muted-foreground mt-0.5">
            {t('dashboard.sessionsCompleted', { count: completedSessionsToday })}
          </p>
          <div className="mt-2 flex items-center gap-1.5">
            <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-primary rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${Math.min((completedSessionsToday / 4) * 100, 100)}%` }}
                transition={{ duration: 0.8, ease: 'easeOut' }}
              />
            </div>
            <span className="text-[10px] text-muted-foreground tabular-nums">{completedSessionsToday}/4</span>
          </div>
        </div>

        {hasSession && (
          <div className="flex-shrink-0" onClick={(e) => e.stopPropagation()}>
            {isRunning && !isPaused ? (
              <Pause size={18} className="text-muted-foreground hover:text-foreground transition-colors" />
            ) : (
              <Play size={18} className="text-primary hover:text-primary/80 transition-colors" />
            )}
          </div>
        )}
      </div>
    </motion.div>
  );
}
