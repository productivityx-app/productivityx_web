import { useTranslation } from 'react-i18next';
import { cn } from '@/lib/utils';

export default function PriorityBadge({ priority }: { priority: string }) {
  const { t } = useTranslation();
  const config = {
    LOW: { label: t('priorities.low'), className: 'bg-secondary text-secondary-foreground' },
    MEDIUM: { label: t('priorities.medium'), className: 'bg-chart-2/20 text-chart-2' },
    HIGH: { label: t('priorities.high'), className: 'bg-chart-3/20 text-chart-3' },
    URGENT: { label: t('priorities.urgent'), className: 'bg-chart-4/20 text-chart-4' },
  };
  const cfg = config[priority as keyof typeof config] || config.LOW;
  return (
    <span className={cn('inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium', cfg.className)}>
      {cfg.label}
    </span>
  );
}
