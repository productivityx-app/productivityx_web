import { cn } from '@/lib/utils';

interface Props {
  title: string;
  description?: string;
  children: React.ReactNode;
  className?: string;
}

export default function SettingsSection({ title, description, children, className }: Props) {
  return (
    <div className={cn('space-y-1', className)}>
      <div className="mb-4">
        <h2 className="text-base font-semibold text-foreground">{title}</h2>
        {description && <p className="text-xs text-muted-foreground/60 mt-0.5">{description}</p>}
      </div>
      <div className="bg-card border border-border/60 rounded-xl p-5 space-y-5 shadow-sm">
        {children}
      </div>
    </div>
  );
}
