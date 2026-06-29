import { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';

interface RichTooltipProps {
  children: React.ReactNode;
  title: string;
  description?: string;
  shortcut?: string;
  delay?: number;
  side?: 'top' | 'bottom' | 'left' | 'right';
}

export default function RichTooltip({
  children,
  title,
  description,
  shortcut,
  delay = 300,
  side = 'top',
}: RichTooltipProps) {
  return (
    <TooltipProvider delayDuration={delay}>
      <Tooltip>
        <TooltipTrigger asChild>{children}</TooltipTrigger>
        <TooltipContent side={side} className="max-w-[220px]">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-xs font-medium">{title}</span>
              {shortcut && (
                <kbd className="px-1 py-0.5 rounded bg-primary-foreground/10 text-[9px] font-mono uppercase tracking-wide">
                  {shortcut}
                </kbd>
              )}
            </div>
            {description && <p className="text-[10px] text-primary-foreground/70 leading-relaxed">{description}</p>}
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
