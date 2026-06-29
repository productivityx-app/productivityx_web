import { cn } from '@/lib/utils';

interface LoadingSkeletonProps {
  lines?: number;
  avatar?: boolean;
  card?: boolean;
  className?: string;
}

function Shimmer({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        'relative overflow-hidden rounded-md bg-accent/30 before:absolute before:inset-0 before:-translate-x-full before:animate-[shimmer_1.5s_infinite] before:bg-gradient-to-r before:from-transparent before:via-white/5 before:to-transparent',
        className,
      )}
    />
  );
}

function Line({ width = '100%' }: { width?: string }) {
  return <Shimmer className={`h-3 ${width}`} />;
}

export default function LoadingSkeleton({ lines = 3, avatar, card, className }: LoadingSkeletonProps) {
  if (card) {
    return (
      <div className={cn('bg-card border border-border rounded-xl p-5 space-y-4', className)}>
        <div className="flex items-center gap-3">
          <Shimmer className="h-10 w-10 rounded-full" />
          <div className="space-y-2 flex-1">
            <Shimmer className="h-4 w-1/3" />
            <Shimmer className="h-3 w-1/4" />
          </div>
        </div>
        <Shimmer className="h-3 w-full" />
        <Shimmer className="h-3 w-5/6" />
        <div className="flex gap-2 pt-2">
          <Shimmer className="h-6 w-16 rounded-full" />
          <Shimmer className="h-6 w-20 rounded-full" />
        </div>
      </div>
    );
  }

  return (
    <div className={cn('space-y-3', className)}>
      {avatar && (
        <div className="flex items-center gap-3 mb-4">
          <Shimmer className="h-10 w-10 rounded-full" />
          <div className="space-y-2 flex-1">
            <Shimmer className="h-4 w-1/4" />
            <Shimmer className="h-3 w-1/6" />
          </div>
        </div>
      )}
      {Array.from({ length: lines }).map((_, i) => (
        <Line key={i} width={`${70 + Math.random() * 30}%`} />
      ))}
    </div>
  );
}

export { Shimmer };
