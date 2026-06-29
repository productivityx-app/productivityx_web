import { useState, useEffect } from 'react';
import { Coffee, SkipForward, Check } from 'lucide-react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import TimerRing from './TimerRing';

interface Props {
  timeRemaining: number;
  totalDuration: number;
  isBreak: boolean;
  onSkip: () => void;
  onStartNext: () => void;
  autoStart: boolean;
  onAutoStartChange: (v: boolean) => void;
}

const SUGGESTIONS = [
  'Stretch your arms and shoulders.',
  'Look away from the screen for 20 seconds.',
  'Take 5 deep breaths.',
  'Stand up and walk around.',
  'Drink a glass of water.',
  'Roll your shoulders back.',
];

export default function BreakScreen({
  timeRemaining, totalDuration, isBreak,
  onSkip, onStartNext, autoStart, onAutoStartChange,
}: Props) {
  const { t } = useTranslation();
  const [suggestionIndex, setSuggestionIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setSuggestionIndex((prev) => (prev + 1) % SUGGESTIONS.length);
    }, 6000);
    return () => clearInterval(interval);
  }, []);

  const label = isBreak ? t('pomodoro.breakTime') : t('pomodoro.pauseTime');
  const color = isBreak ? '#22C55E' : '#3B82F6';

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="flex flex-col items-center justify-center py-12 space-y-8"
    >
      <motion.div
        animate={{ rotate: [0, -10, 10, -10, 0] }}
        transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
      >
        <Coffee size={48} className="text-muted-foreground/40" />
      </motion.div>

      <h2 className="text-2xl font-bold text-foreground">{t('pomodoro.breakTitle')}</h2>
      <p className="text-sm text-muted-foreground/60 max-w-xs text-center">{t('pomodoro.breakDescription')}</p>

      <TimerRing
        timeRemaining={timeRemaining}
        totalDuration={totalDuration}
        color={color}
        label={label}
      />

      <motion.p
        key={suggestionIndex}
        initial={{ opacity: 0, y: 5 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-sm text-muted-foreground italic"
      >
        💡 {SUGGESTIONS[suggestionIndex]}
      </motion.p>

      <div className="flex items-center gap-4">
        <button
          onClick={onSkip}
          className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm text-muted-foreground hover:text-foreground hover:bg-accent transition-all"
        >
          <SkipForward size={14} />
          {t('pomodoro.skipBreak')}
        </button>
        <label className="flex items-center gap-2 text-xs text-muted-foreground cursor-pointer">
          <input
            type="checkbox"
            checked={autoStart}
            onChange={(e) => onAutoStartChange(e.target.checked)}
            className="rounded border-border"
          />
          {t('pomodoro.autoStartNext')}
        </label>
      </div>

      {timeRemaining <= 0 && (
        <motion.button
          initial={{ scale: 0.9 }}
          animate={{ scale: 1 }}
          onClick={onStartNext}
          className="flex items-center gap-2 px-6 py-3 rounded-xl bg-foreground text-background font-semibold hover:opacity-90 transition-all active:scale-95 shadow-xl"
        >
          <Check size={16} />
          {t('pomodoro.nextSession')}
        </motion.button>
      )}
    </motion.div>
  );
}
