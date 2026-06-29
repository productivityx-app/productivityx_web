import { cn } from '@/lib/utils';
import * as AvatarPrimitive from '@radix-ui/react-avatar';

const sizes = {
  xs: 'h-6 w-6 text-[9px]',
  sm: 'h-8 w-8 text-xs',
  md: 'h-10 w-10 text-sm',
  lg: 'h-12 w-12 text-base',
  xl: 'h-16 w-16 text-xl',
};

const statusColors = {
  online: 'bg-green-500',
  away: 'bg-amber-500',
  busy: 'bg-red-500',
  offline: 'bg-muted-foreground/30',
};

const statusSizes = {
  xs: 'h-1.5 w-1.5 ring-[1px]',
  sm: 'h-2 w-2 ring-[1.5px]',
  md: 'h-2.5 w-2.5 ring-[1.5px]',
  lg: 'h-3 w-3 ring-2',
  xl: 'h-3.5 w-3.5 ring-2',
};

interface AvatarProps {
  src?: string;
  fallback?: string;
  alt?: string;
  size?: keyof typeof sizes;
  status?: keyof typeof statusColors;
  className?: string;
}

export default function Avatar({
  src,
  fallback,
  alt,
  size = 'md',
  status,
  className,
}: AvatarProps) {
  const initials = fallback
    ? fallback
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2)
    : '?';

  return (
    <span className="relative inline-flex shrink-0">
      <AvatarPrimitive.Root
        className={cn(
          'relative flex shrink-0 overflow-hidden rounded-full',
          sizes[size],
          className,
        )}
      >
        <AvatarPrimitive.Image
          src={src}
          alt={alt || ''}
          className="aspect-square h-full w-full object-cover"
        />
        <AvatarPrimitive.Fallback className="flex h-full w-full items-center justify-center rounded-full bg-gradient-to-br from-primary/20 to-primary/5 text-muted-foreground font-medium">
          {initials}
        </AvatarPrimitive.Fallback>
      </AvatarPrimitive.Root>
      {status && (
        <span
          className={cn(
            'absolute -bottom-0.5 -right-0.5 rounded-full ring-background',
            statusColors[status],
            statusSizes[size],
          )}
        />
      )}
    </span>
  );
}
