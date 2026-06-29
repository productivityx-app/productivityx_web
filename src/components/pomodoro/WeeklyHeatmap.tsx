import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { cn } from '@/lib/utils';

interface DayData {
  date: string;
  count: number;
}

interface Props {
  data: DayData[];
  weeks?: number;
}

export default function WeeklyHeatmap({ data, weeks = 13 }: Props) {
  const { t } = useTranslation();

  const cells = useMemo(() => {
    const today = new Date();
    const result: { date: string; count: number; day: number; week: number }[] = [];
    const map = new Map(data.map((d) => [d.date, d.count]));

    for (let i = weeks * 7 - 1; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      const key = d.toISOString().split('T')[0];
      result.push({
        date: key,
        count: map.get(key) || 0,
        day: d.getDay(),
        week: Math.floor(i / 7),
      });
    }
    return result;
  }, [data, weeks]);

  const maxCount = Math.max(...cells.map((c) => c.count), 1);

  const getIntensity = (count: number) => {
    if (count === 0) return 'bg-accent/30';
    const ratio = count / maxCount;
    if (ratio <= 0.25) return 'bg-primary/20';
    if (ratio <= 0.5) return 'bg-primary/40';
    if (ratio <= 0.75) return 'bg-primary/60';
    return 'bg-primary/80';
  };

  const weeksGrid: typeof cells[] = [];
  for (let w = 0; w < weeks; w++) {
    weeksGrid.push(cells.filter((c) => c.week === w));
  }

  const dayLabels = ['', t('common.mon'), '', t('common.wed'), '', t('common.fri'), ''];

  return (
    <div className="space-y-2">
      <h3 className="text-xs font-medium text-muted-foreground">{t('pomodoro.focusHeatmap')}</h3>
      <div className="flex gap-[3px]">
        <div className="flex flex-col gap-[3px] pt-1 pr-1">
          {dayLabels.map((label, i) => (
            <span key={i} className="text-[9px] text-muted-foreground h-[14px] leading-[14px] w-6 text-right">
              {label}
            </span>
          ))}
        </div>
        <div className="flex gap-[3px] overflow-x-auto pb-1">
          {weeksGrid.map((week, wi) => (
            <div key={wi} className="flex flex-col gap-[3px]">
              {week.map((cell) => (
                <motion.div
                  key={cell.date}
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: wi * 0.01 }}
                  className={cn('w-[14px] h-[14px] rounded-[3px] transition-colors', getIntensity(cell.count))}
                  title={`${cell.date}: ${cell.count} sessions`}
                />
              ))}
            </div>
          ))}
        </div>
      </div>
      <div className="flex items-center gap-1 text-[9px] text-muted-foreground justify-end">
        <span>{t('pomodoro.less')}</span>
        {[0, 0.25, 0.5, 0.75, 1].map((r) => (
          <div key={r} className={cn('w-3 h-3 rounded-[2px]', r === 0 ? 'bg-accent/30' : 'bg-primary/80')} style={{ opacity: r }} />
        ))}
        <span>{t('pomodoro.more')}</span>
      </div>
    </div>
  );
}
