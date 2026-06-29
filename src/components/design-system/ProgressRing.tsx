import { cn } from '@/lib/utils';

const colors = {
  primary: 'stroke-primary',
  success: 'stroke-green-500',
  warning: 'stroke-amber-500',
  destructive: 'stroke-destructive',
  info: 'stroke-blue-500',
};

interface ProgressRingProps {
  value: number;
  max?: number;
  size?: number;
  strokeWidth?: number;
  label?: string;
  color?: keyof typeof colors;
  className?: string;
}

export default function ProgressRing({
  value,
  max = 100,
  size = 64,
  strokeWidth = 5,
  label,
  color = 'primary',
  className,
}: ProgressRingProps) {
  const pct = Math.min(Math.max((value / max) * 100, 0), 100);
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (pct / 100) * circumference;

  return (
    <div className={cn('relative inline-flex items-center justify-center', className)}>
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth={strokeWidth}
          className="text-accent/30"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          className={cn('transition-all duration-500 ease-out', colors[color])}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
        />
      </svg>
      {label && (
        <span className="absolute text-xs font-semibold text-foreground">{label}</span>
      )}
    </div>
  );
}
