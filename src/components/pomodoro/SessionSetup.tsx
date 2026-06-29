import { useState } from 'react';
import { Play, Sparkles, Timer } from 'lucide-react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { cn } from '@/lib/utils';
import SoundSelector, { SoundType } from './SoundSelector';

interface Props {
  onStart: (opts: { type: 'focus' | 'shortBreak' | 'longBreak'; duration: number; taskId?: string; intention?: string; sound: SoundType; volume: number }) => void;
  tasks?: { id: string; title: string }[];
  quote?: string;
}

const PRESETS = [
  { type: 'focus' as const, labelKey: 'pomodoro.focus', duration: 25 * 60, color: '#EF4444' },
  { type: 'shortBreak' as const, labelKey: 'pomodoro.shortBreak', duration: 5 * 60, color: '#22C55E' },
  { type: 'longBreak' as const, labelKey: 'pomodoro.longBreak', duration: 15 * 60, color: '#3B82F6' },
];

export default function SessionSetup({ onStart, tasks, quote }: Props) {
  const { t } = useTranslation();
  const [activePreset, setActivePreset] = useState(0);
  const [customMin, setCustomMin] = useState('');
  const [taskId, setTaskId] = useState('');
  const [intention, setIntention] = useState('');
  const [sound, setSound] = useState<SoundType>('none');
  const [volume, setVolume] = useState(50);

  const preset = PRESETS[activePreset];
  const duration = customMin ? Number(customMin) * 60 : preset.duration;

  const handleStart = () => {
    onStart({ type: preset.type, duration, taskId: taskId || undefined, intention: intention || undefined, sound, volume });
  };

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-lg mx-auto space-y-8 py-4">
      <div className="text-center space-y-2">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 text-primary text-xs font-medium">
          <Sparkles size={12} /> {t('pomodoro.setupTitle')}
        </div>
        <h1 className="text-3xl font-bold text-foreground">{t('pomodoro.whatFocus')}</h1>
        {quote && <p className="text-sm text-muted-foreground/60 italic">"{quote}"</p>}
      </div>

      <div className="flex gap-2">
        {PRESETS.map((p, i) => (
          <button
            key={p.type}
            onClick={() => { setActivePreset(i); setCustomMin(''); }}
            className={cn(
              'flex-1 flex flex-col items-center gap-1 px-3 py-3 rounded-xl border transition-all',
              i === activePreset ? 'border-primary/30 bg-primary/5' : 'border-border hover:border-primary/20 hover:bg-accent/50',
            )}
          >
            <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ backgroundColor: p.color + '22' }}>
              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: p.color }} />
            </div>
            <span className="text-xs font-semibold text-foreground">{t(p.labelKey)}</span>
            <span className="text-[10px] text-muted-foreground">{p.duration / 60} min</span>
          </button>
        ))}
      </div>

      <div className="space-y-2">
        <label className="text-xs font-medium text-muted-foreground flex items-center gap-1">
          <Timer size={12} /> {t('pomodoro.customDuration')}
        </label>
        <input
          type="number"
          min={1}
          max={120}
          placeholder={t('pomodoro.customDurationPlaceholder')}
          value={customMin}
          onChange={(e) => setCustomMin(e.target.value)}
          className="w-full px-3 py-2 rounded-lg bg-accent/50 border border-border text-sm text-foreground placeholder:text-muted-foreground/40 focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all"
        />
        {customMin && (
          <p className="text-[10px] text-muted-foreground">{t('pomodoro.totalTime', { minutes: customMin })}</p>
        )}
      </div>

      {tasks && tasks.length > 0 && (
        <div className="space-y-2">
          <label className="text-xs font-medium text-muted-foreground">{t('pomodoro.linkTask')}</label>
          <select
            value={taskId}
            onChange={(e) => setTaskId(e.target.value)}
            className="w-full px-3 py-2 rounded-lg bg-accent/50 border border-border text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all"
          >
            <option value="">{t('pomodoro.noTask')}</option>
            {tasks.map((task) => (
              <option key={task.id} value={task.id}>{task.title}</option>
            ))}
          </select>
        </div>
      )}

      <div className="space-y-2">
        <label className="text-xs font-medium text-muted-foreground">{t('pomodoro.intention')}</label>
        <input
          type="text"
          placeholder={t('pomodoro.intentionPlaceholder')}
          value={intention}
          onChange={(e) => setIntention(e.target.value)}
          className="w-full px-3 py-2 rounded-lg bg-accent/50 border border-border text-sm text-foreground placeholder:text-muted-foreground/40 focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all"
        />
      </div>

      <SoundSelector selected={sound} onSelect={setSound} volume={volume} onVolumeChange={setVolume} />

      <button
        onClick={handleStart}
        className="w-full flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-foreground text-background font-semibold hover:opacity-90 transition-all active:scale-[0.98] shadow-xl"
      >
        <Play size={16} fill="currentColor" />
        {t('pomodoro.startSession')}
      </button>
    </motion.div>
  );
}
