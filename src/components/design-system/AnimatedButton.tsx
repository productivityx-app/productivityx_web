import { useState, useRef } from 'react';
import { cn } from '@/lib/utils';
import { Loader2 } from 'lucide-react';

const variants = {
  primary: 'bg-primary text-primary-foreground border border-primary-border shadow-sm',
  secondary: 'bg-secondary text-secondary-foreground border border-secondary-border',
  destructive: 'bg-destructive text-destructive-foreground border border-destructive-border shadow-sm',
  outline: 'border border-[var(--button-outline)] shadow-xs',
  ghost: 'border border-transparent',
  link: 'text-primary underline-offset-4 hover:underline',
};

const sizes = {
  default: 'h-9 px-4 text-sm',
  sm: 'h-8 px-3 text-xs',
  lg: 'h-10 px-8 text-sm',
  icon: 'h-9 w-9',
  'icon-sm': 'h-8 w-8',
};

interface AnimatedButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: keyof typeof variants;
  size?: keyof typeof sizes;
  loading?: boolean;
  icon?: React.ReactNode;
  ripple?: boolean;
}

export default function AnimatedButton({
  variant = 'primary',
  size = 'default',
  loading = false,
  icon,
  ripple = true,
  className,
  children,
  disabled,
  onClick,
  ...props
}: AnimatedButtonProps) {
  const [ripples, setRipples] = useState<{ x: number; y: number; id: number }[]>([]);
  const ref = useRef<HTMLButtonElement>(null);
  const idRef = useRef(0);

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (ripple && !disabled && !loading) {
      const rect = ref.current?.getBoundingClientRect();
      if (rect) {
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        const id = idRef.current++;
        setRipples((prev) => [...prev, { x, y, id }]);
        setTimeout(() => setRipples((prev) => prev.filter((r) => r.id !== id)), 600);
      }
    }
    onClick?.(e);
  };

  return (
    <button
      ref={ref}
      onClick={handleClick}
      disabled={disabled || loading}
      className={cn(
        'relative inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 overflow-hidden',
        'hover:scale-[1.02] hover:shadow-md active:scale-[0.98]',
        variants[variant],
        sizes[size],
        className,
      )}
      {...props}
    >
      {loading ? (
        <Loader2 size={size === 'sm' ? 14 : 16} className="animate-spin" />
      ) : icon ? (
        <span className="flex-shrink-0">{icon}</span>
      ) : null}
      {children}
      {ripples.map((r) => (
        <span
          key={r.id}
          className="absolute rounded-full bg-white/20 animate-ripple pointer-events-none"
          style={{ left: r.x - 8, top: r.y - 8, width: 16, height: 16 }}
        />
      ))}
    </button>
  );
}
