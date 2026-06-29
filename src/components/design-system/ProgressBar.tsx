import { cn } from '@/lib/utils';

const colors = {
  primary: 'bg-primary',
  success: 'bg-green-500',
  warning: 'bg-amber-500',
  destructive: 'bg-destructive',
  info: 'bg-blue-500',
};

interface ProgressBarProps {
  value: number;
  max?: number;
  label?: string;
  showValue?: boolean;
  color?: keyof typeof colors;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export default function ProgressBar({
  value,
  max = 100,
  label,
  showValue = false,
  color = 'primary',
  size = 'md',
  className,
}: ProgressBarProps) {
  const pct = Math.min(Math.max((value / max) * 100, 0), 100);
  const heights = { sm: 'h-1.5', md: 'h-2', lg: 'h-3' };

  return (
    <div className={cn('space-y-1.5', className)}>
      {(label || showValue) && (
        <div className="flex items-center justify-between">
          {label && <span className="text-xs text-muted-foreground">{label}</span>}
          {showValue && <span className="text-xs text-muted-foreground/60">{Math.round(pct)}%</span>}
        </div>
      )}
      <div className={cn('w-full overflow-hidden rounded-full bg-accent/30', heights[size])}>
        <div
          className={cn('h-full rounded-full transition-all duration-500 ease-out', colors[color])}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}
