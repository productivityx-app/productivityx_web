import { Clock, ListChecks, Target, Flame } from 'lucide-react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';

interface Stats {
  totalSessions: number;
  totalFocusMs: number;
  completionRate: number;
  currentStreak: number;
}

interface Props {
  stats: Stats;
}

function formatTime(ms: number) {
  const totalMin = Math.floor(ms / 60000);
  const h = Math.floor(totalMin / 60);
  const m = totalMin % 60;
  if (h > 0) return `${h}h ${m}m`;
  return `${m}m`;
}

export default function PomodoroStats({ stats }: Props) {
  const { t } = useTranslation();
  const cards = [
    { icon: ListChecks, label: t('pomodoro.totalSessions'), value: String(stats.totalSessions), color: '#EF4444' },
    { icon: Clock, label: t('pomodoro.focusTime'), value: formatTime(stats.totalFocusMs), color: '#F59E0B' },
    { icon: Target, label: t('pomodoro.completionRate'), value: `${Math.round(stats.completionRate)}%`, color: '#22C55E' },
    { icon: Flame, label: t('pomodoro.currentStreak'), value: `${stats.currentStreak}`, suffix: t('pomodoro.streakDays'), color: '#3B82F6' },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
      {cards.map((card, i) => (
        <motion.div
          key={card.label}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.08 }}
          className="relative p-4 rounded-xl border border-border/50 bg-card/50 backdrop-blur-sm overflow-hidden group hover:border-primary/20 transition-colors"
        >
          <div
            className="absolute inset-0 opacity-[0.03] group-hover:opacity-[0.06] transition-opacity"
            style={{ background: `radial-gradient(circle at top right, ${card.color}, transparent 70%)` }}
          />
          <div className="relative z-10 flex flex-col gap-1">
            <div className="flex items-center justify-between">
              <card.icon size={14} className="text-muted-foreground" />
              <span className="text-xs text-muted-foreground/60">{card.label}</span>
            </div>
            <div className="flex items-baseline gap-1">
              <span className="text-2xl font-bold text-foreground" style={{ color: card.color }}>{card.value}</span>
              {'suffix' in card && <span className="text-[10px] text-muted-foreground">{card.suffix}</span>}
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );
}
