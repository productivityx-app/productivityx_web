import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Lightbulb, Sparkles, Keyboard } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SpotlightTooltipProps {
  show: boolean;
  title: string;
  description: string;
  shortcut?: string;
  icon?: 'tip' | 'feature' | 'keyboard';
  side?: 'top' | 'bottom' | 'left' | 'right';
  targetRect?: DOMRect;
  onDismiss: () => void;
  onAction?: () => void;
  actionLabel?: string;
  dismissLabel?: string;
}

const iconMap = {
  tip: Lightbulb,
  feature: Sparkles,
  keyboard: Keyboard,
};

const iconColors = {
  tip: 'text-amber-500 bg-amber-500/10',
  feature: 'text-primary bg-primary/10',
  keyboard: 'text-blue-500 bg-blue-500/10',
};

export default function SpotlightTooltip({
  show,
  title,
  description,
  shortcut,
  icon = 'tip',
  side = 'bottom',
  targetRect,
  onDismiss,
  onAction,
  actionLabel,
  dismissLabel = 'Got it',
}: SpotlightTooltipProps) {
  const [mounted, setMounted] = useState(false);
  const Icon = iconMap[icon];

  useEffect(() => {
    if (show) {
      setMounted(true);
    } else {
      const t = setTimeout(() => setMounted(false), 300);
      return () => clearTimeout(t);
    }
  }, [show]);

  const positionStyle = targetRect
    ? {
        top: side === 'bottom' ? targetRect.bottom + 12 : side === 'top' ? targetRect.top - 12 : undefined,
        left: side === 'bottom' || side === 'top' ? targetRect.left + targetRect.width / 2 : undefined,
      }
    : {};

  return (
    <AnimatePresence>
      {show && mounted && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40"
            onClick={onDismiss}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: side === 'top' ? 10 : -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: side === 'top' ? 10 : -10 }}
            transition={{ type: 'spring', damping: 20, stiffness: 300 }}
            className={cn(
              'fixed z-50 w-72 p-4 rounded-2xl bg-card border border-border shadow-2xl',
            )}
            style={targetRect ? {
              ...positionStyle,
              transform: 'translateX(-50%)',
            } : { top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }}
          >
            <button
              onClick={onDismiss}
              className="absolute top-2.5 right-2.5 p-1 rounded-lg text-muted-foreground/40 hover:text-muted-foreground hover:bg-accent transition-colors"
            >
              <X size={12} />
            </button>

            <div className="flex items-start gap-3">
              <div className={cn('p-2 rounded-xl flex-shrink-0', iconColors[icon])}>
                <Icon size={16} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h4 className="text-sm font-semibold text-foreground">{title}</h4>
                  {shortcut && (
                    <kbd className="px-1.5 py-0.5 rounded bg-muted text-[9px] font-mono text-muted-foreground uppercase tracking-wide border border-border">
                      {shortcut}
                    </kbd>
                  )}
                </div>
                <p className="text-xs text-muted-foreground mt-1 leading-relaxed">{description}</p>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 mt-3 pt-3 border-t border-border">
              {onAction && actionLabel && (
                <button
                  onClick={onAction}
                  className="px-3 py-1.5 rounded-lg bg-primary text-primary-foreground text-xs font-medium hover:bg-primary/90 transition-colors"
                >
                  {actionLabel}
                </button>
              )}
              <button
                onClick={onDismiss}
                className={cn(
                  'px-3 py-1.5 rounded-lg text-xs font-medium transition-colors',
                  onAction ? 'text-muted-foreground hover:text-foreground hover:bg-accent' : 'bg-primary text-primary-foreground hover:bg-primary/90',
                )}
              >
                {dismissLabel}
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
