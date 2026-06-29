import { cn } from '@/lib/utils';

interface LabeledDividerProps {
  label: string;
  className?: string;
}

export default function LabeledDivider({ label, className }: LabeledDividerProps) {
  return (
    <div className={cn('flex items-center gap-3', className)}>
      <div className="flex-1 h-px bg-border" />
      <span className="text-xs text-muted-foreground/50 font-medium whitespace-nowrap">{label}</span>
      <div className="flex-1 h-px bg-border" />
    </div>
  );
}
