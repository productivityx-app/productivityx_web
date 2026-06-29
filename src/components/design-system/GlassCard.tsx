import { cn } from '@/lib/utils';

interface GlassCardProps {
  intensity?: number;
  border?: boolean;
  hover?: boolean;
  padding?: 'none' | 'sm' | 'md' | 'lg';
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
}

const paddingMap = { none: '', sm: 'p-3', md: 'p-5', lg: 'p-8' };

export default function GlassCard({
  border = true,
  hover = false,
  padding = 'md',
  children,
  className,
  onClick,
}: GlassCardProps) {
  return (
    <div
      onClick={onClick}
      className={cn(
        'rounded-2xl backdrop-blur-xl transition-all duration-300 bg-card',
        border && 'border border-border/40',
        hover && 'hover:shadow-lg hover:-translate-y-0.5',
        onClick && 'cursor-pointer',
        paddingMap[padding],
        className,
      )}
    >
      {children}
    </div>
  );
}
