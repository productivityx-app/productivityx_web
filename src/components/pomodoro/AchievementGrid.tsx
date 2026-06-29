import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { cn } from '@/lib/utils';
import { Trophy, Target, Zap, Clock, Flame, Star } from 'lucide-react';

export interface Achievement {
  id: string;
  key: string;
  icon: string;
  unlocked: boolean;
  progress?: number;
  maxProgress?: number;
}

interface Props {
  achievements: Achievement[];
}

const ICON_MAP: Record<string, React.ElementType> = {
  trophy: Trophy, target: Target, zap: Zap, clock: Clock, flame: Flame, star: Star,
};

export default function AchievementGrid({ achievements }: Props) {
  const { t } = useTranslation();

  return (
    <div className="space-y-3">
      <h3 className="text-xs font-medium text-muted-foreground">{t('pomodoro.achievements')}</h3>
      <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
        {achievements.map((ach, i) => {
          const Icon = ICON_MAP[ach.icon] || Star;
          return (
            <motion.div
              key={ach.id}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.04 }}
              className={cn(
                'relative flex flex-col items-center gap-1 p-3 rounded-xl border transition-all',
                ach.unlocked
                  ? 'border-primary/30 bg-primary/5'
                  : 'border-border/50 bg-card/30 opacity-50',
              )}
            >
              <div className={cn('p-1.5 rounded-full', ach.unlocked ? 'bg-primary/10 text-primary' : 'bg-accent/30 text-muted-foreground')}>
                <Icon size={16} />
              </div>
              <span className="text-[9px] text-center leading-tight text-muted-foreground">
                {t(ach.key)}
              </span>
              {ach.maxProgress && ach.maxProgress > 0 && (
                <div className="w-full h-1 rounded-full bg-accent/50 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-primary/60 transition-all"
                    style={{ width: `${((ach.progress || 0) / ach.maxProgress) * 100}%` }}
                  />
                </div>
              )}
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
