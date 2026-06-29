import { useEffect, useCallback, useState } from 'react';
import { Play, Pause, SkipForward, Square, X } from 'lucide-react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import TimerRing from './TimerRing';
import SoundSelector, { SoundType } from './SoundSelector';

interface Props {
  timeRemaining: number;
  totalDuration: number;
  color: string;
  label: string;
  taskName?: string;
  intention?: string;
  isRunning: boolean;
  isPaused: boolean;
  onPauseResume: () => void;
  onSkip: () => void;
  onStop: () => void;
  onExit: () => void;
}

const QUOTES = [
  'The secret of getting ahead is getting started.',
  'Focus on being productive instead of busy.',
  'Quality is not an act, it is a habit.',
  'The way to get started is to quit talking and begin doing.',
  'Don\'t watch the clock; do what it does. Keep going.',
  'Success is the sum of small efforts repeated day in and day out.',
];

export default function FocusMode({
  timeRemaining, totalDuration, color, label, taskName, intention,
  isRunning, isPaused, onPauseResume, onSkip, onStop, onExit,
}: Props) {
  const { t } = useTranslation();
  const [quoteIndex, setQuoteIndex] = useState(0);
  const [sound, setSound] = useState<SoundType>('none');
  const [volume, setVolume] = useState(50);

  useEffect(() => {
    const interval = setInterval(() => {
      setQuoteIndex((prev) => (prev + 1) % QUOTES.length);
    }, 15000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onExit();
      if (e.key === ' ' || e.code === 'Space') { e.preventDefault(); onPauseResume(); }
      if (e.key === 's' || e.key === 'S') onSkip();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onPauseResume, onSkip, onExit]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex flex-col items-center justify-center"
      style={{
        background: `radial-gradient(ellipse at center, ${color}11 0%, ${color}08 40%, transparent 70%)`,
        backgroundColor: 'hsl(var(--background))',
      }}
    >
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            background: `linear-gradient(135deg, ${color} 0%, transparent 50%, ${color} 100%)`,
            backgroundSize: '200% 200%',
            animation: 'gradientShift 8s ease infinite',
          }}
        />
      </div>

      <button
        onClick={onExit}
        className="absolute top-6 right-6 px-3 py-1.5 rounded-lg text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-accent/50 transition-colors z-10"
      >
        <X size={14} className="inline mr-1" />
        {t('pomodoro.exitFocus')}
      </button>

      <div className="flex flex-col items-center gap-2 mb-8">
        {intention && (
          <p className="text-sm text-muted-foreground/60 italic max-w-md text-center">"{intention}"</p>
        )}
        {taskName && (
          <span className="px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-medium">{taskName}</span>
        )}
      </div>

      <TimerRing
        timeRemaining={timeRemaining}
        totalDuration={totalDuration}
        color={color}
        label={label}
        size="large"
        breathing
      />

      <div className="flex items-center gap-6 mt-10">
        <button
          onClick={onStop}
          className="p-3 rounded-full text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-all"
        >
          <Square size={18} />
        </button>
        <button
          onClick={onPauseResume}
          className="w-20 h-20 rounded-full bg-foreground text-background hover:bg-foreground/90 flex items-center justify-center transition-all shadow-xl hover:scale-105 active:scale-95"
          style={{ boxShadow: `0 0 40px ${color}44` }}
        >
          {isPaused ? <Play size={32} fill="currentColor" /> : <Pause size={32} fill="currentColor" />}
        </button>
        <button
          onClick={onSkip}
          className="p-3 rounded-full text-muted-foreground hover:text-foreground hover:bg-accent transition-all"
        >
          <SkipForward size={18} />
        </button>
      </div>

      <p className="text-xs text-muted-foreground/50 mt-3">
        {t('pomodoro.focusShortcuts')}
      </p>

      <motion.p
        key={quoteIndex}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-sm text-muted-foreground/50 italic mt-12 max-w-md text-center px-4"
      >
        "{QUOTES[quoteIndex]}"
      </motion.p>
    </motion.div>
  );
}
