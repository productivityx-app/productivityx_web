import { cn } from '@/lib/utils';
import { X } from 'lucide-react';

const colors = {
  default: 'bg-primary text-primary-foreground border-primary-border',
  secondary: 'bg-secondary text-secondary-foreground border-secondary-border',
  destructive: 'bg-destructive text-destructive-foreground border-destructive-border',
  success: 'bg-green-500/15 text-green-600 dark:text-green-400 border-green-500/20',
  warning: 'bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/20',
  info: 'bg-blue-500/15 text-blue-600 dark:text-blue-400 border-blue-500/20',
  outline: 'border border-[var(--badge-outline)] text-foreground',
};

const sizes = {
  sm: 'px-1.5 py-0.5 text-[10px]',
  md: 'px-2.5 py-0.5 text-xs',
  lg: 'px-3 py-1 text-sm',
};

interface BadgeProps {
  color?: keyof typeof colors;
  size?: keyof typeof sizes;
  dot?: boolean;
  removable?: boolean;
  onRemove?: () => void;
  children: React.ReactNode;
  className?: string;
}

export default function Badge({
  color = 'default',
  size = 'md',
  dot = false,
  removable = false,
  onRemove,
  children,
  className,
}: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full border font-medium whitespace-nowrap transition-colors',
        colors[color],
        sizes[size],
        className,
      )}
    >
      {dot && <span className="h-1.5 w-1.5 rounded-full bg-current opacity-70" />}
      {children}
      {removable && (
        <button
          onClick={(e) => { e.stopPropagation(); onRemove?.(); }}
          className="ml-0.5 p-0.5 rounded-full hover:bg-black/10 dark:hover:bg-white/10 transition-colors focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
        >
          <X size={10} />
        </button>
      )}
    </span>
  );
}
