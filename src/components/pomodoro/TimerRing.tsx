import { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';

interface Props {
  timeRemaining: number;
  totalDuration: number;
  color: string;
  label: string;
  size?: 'normal' | 'large';
  breathing?: boolean;
}

const CIRCUMFERENCE = 2 * Math.PI * 120;

function pad(n: number) { return String(Math.floor(n)).padStart(2, '0'); }

export default function TimerRing({ timeRemaining, totalDuration, color, label, size = 'normal', breathing }: Props) {
  const isLarge = size === 'large';
  const [breatheScale, setBreatheScale] = useState(1);

  useEffect(() => {
    if (!breathing) { setBreatheScale(1); return; }
    const interval = setInterval(() => {
      setBreatheScale((prev) => (prev === 1 ? 1.03 : 1));
    }, 4000);
    return () => clearInterval(interval);
  }, [breathing]);

  const progress = totalDuration > 0 ? 1 - timeRemaining / totalDuration : 0;
  const strokeDashoffset = CIRCUMFERENCE * (1 - progress);
  const mins = Math.floor(timeRemaining / 60);
  const secs = timeRemaining % 60;
  const radius = isLarge ? 120 : 88;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference * (1 - progress);
  const strokeW = isLarge ? 10 : 8;
  const viewBox = isLarge ? 260 : 200;
  const cx = viewBox / 2;

  return (
    <div
      className={cn('relative flex items-center justify-center transition-transform duration-[4000ms] ease-in-out')}
      style={{ transform: `scale(${breatheScale})` }}
    >
      <svg className={cn(isLarge ? 'w-72 h-72' : 'w-56 h-56', '-rotate-90')} viewBox={`0 0 ${viewBox} ${viewBox}`}>
        <defs>
          <linearGradient id={`timer-grad-${label.replace(/\s/g, '')}`} x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor={color} stopOpacity="0.6" />
            <stop offset="100%" stopColor={color} stopOpacity="1" />
          </linearGradient>
          <filter id="glow">
            <feGaussianBlur stdDeviation="4" result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>
        <circle cx={cx} cy={cx} r={radius} fill="none" stroke="hsl(var(--border))" strokeWidth={strokeW} />
        <circle
          cx={cx} cy={cx} r={radius} fill="none"
          stroke={`url(#timer-grad-${label.replace(/\s/g, '')})`}
          strokeWidth={strokeW}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          filter="url(#glow)"
          className="transition-all duration-500 ease-linear"
        />
      </svg>
      <div className={cn("absolute flex flex-col items-center justify-center", isLarge && "inset-10")}>
        <span className={cn('font-bold text-foreground tabular-nums tracking-tight', isLarge ? 'text-6xl leading-none' : 'text-5xl')}>
          {pad(mins)}:{pad(secs)}
        </span>
        <span className={cn('text-muted-foreground', isLarge ? 'text-base mt-2' : 'text-xs mt-1')}>{label}</span>
      </div>
    </div>
  );
}
