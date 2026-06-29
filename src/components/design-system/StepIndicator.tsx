import { cn } from '@/lib/utils';
import { Check } from 'lucide-react';

interface Step {
  label: string;
  description?: string;
}

interface StepIndicatorProps {
  steps: Step[];
  current: number;
  className?: string;
}

export default function StepIndicator({ steps, current, className }: StepIndicatorProps) {
  return (
    <div className={cn('flex items-center gap-0', className)}>
      {steps.map((step, i) => {
        const isCompleted = i < current;
        const isCurrent = i === current;
        return (
          <div key={i} className="flex items-center flex-1 last:flex-none">
            <div className="flex flex-col items-center">
              <div
                className={cn(
                  'flex items-center justify-center w-8 h-8 rounded-full border-2 transition-all text-xs font-semibold',
                  isCompleted
                    ? 'bg-primary border-primary text-primary-foreground'
                    : isCurrent
                      ? 'border-primary text-primary'
                      : 'border-muted-foreground/30 text-muted-foreground/50',
                )}
              >
                {isCompleted ? <Check size={14} /> : i + 1}
              </div>
              <span
                className={cn(
                  'mt-1.5 text-[10px] font-medium whitespace-nowrap',
                  isCompleted || isCurrent ? 'text-foreground' : 'text-muted-foreground/50',
                )}
              >
                {step.label}
              </span>
            </div>
            {i < steps.length - 1 && (
              <div
                className={cn(
                  'flex-1 h-px mx-3 mt-[-1.5rem]',
                  isCompleted ? 'bg-primary' : 'bg-muted-foreground/20',
                )}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}
