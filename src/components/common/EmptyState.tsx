import { motion } from 'framer-motion';
import { LucideIcon, Plus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { ReactNode } from 'react';

interface Action {
  label: string;
  onClick?: () => void;
  to?: string;
  icon?: LucideIcon;
  variant?: 'primary' | 'secondary' | 'ghost';
}

interface Badge {
  label: string;
  variant?: 'default' | 'pro' | 'tip' | 'new';
}

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  secondaryIcon?: LucideIcon;
  actions?: Action[];
  badge?: Badge;
  templates?: { name: string; onClick: () => void }[];
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  animated?: boolean;
  gradient?: string;
  children?: ReactNode;
}

const sizeMap = {
  sm: { icon: 20, wrapper: 'w-12 h-12', circle: 'w-14 h-14', title: 'text-base', desc: 'text-xs', py: 'py-12' },
  md: { icon: 28, wrapper: 'w-16 h-16', circle: 'w-18 h-18', title: 'text-lg', desc: 'text-sm', py: 'py-16' },
  lg: { icon: 36, wrapper: 'w-20 h-20', circle: 'w-22 h-22', title: 'text-xl', desc: 'text-sm', py: 'py-20' },
};

const gradients: Record<string, string> = {
  notes: 'from-primary/20 to-violet-500/20',
  tasks: 'from-emerald-500/20 to-primary/20',
  calendar: 'from-blue-500/20 to-primary/20',
  pomodoro: 'from-rose-500/20 to-amber-500/20',
  ai: 'from-primary/30 via-primary/10 to-transparent',
  search: 'from-sky-500/20 to-primary/20',
  trash: 'from-muted-foreground/10 to-muted-foreground/5',
  default: 'from-primary/20 to-primary/5',
};

export default function EmptyState({
  icon: Icon,
  title,
  description,
  secondaryIcon: SecondaryIcon,
  actions,
  badge,
  templates,
  className,
  size = 'md',
  animated = true,
  gradient,
  children,
}: EmptyStateProps) {
  const navigate = useNavigate();
  const s = sizeMap[size];
  const g = gradient || 'default';
  const gradClass = gradients[g] || gradients.default;

  const content = (
    <div className={cn('flex flex-col items-center justify-center px-4 text-center', s.py, className)}>
      <motion.div
        initial={animated ? { opacity: 0, scale: 0.8 } : undefined}
        animate={animated ? { opacity: 1, scale: 1 } : undefined}
        transition={{ duration: 0.4, ease: 'easeOut' }}
        className="relative mb-5"
      >
        <div className={cn('rounded-full bg-gradient-to-br flex items-center justify-center ring-1 ring-primary/10', s.circle, gradClass)}>
          <div className={cn('rounded-2xl flex items-center justify-center', s.wrapper)}>
            <Icon size={s.icon} className="text-primary/60" />
          </div>
        </div>
        {SecondaryIcon && (
          <motion.div
            initial={animated ? { opacity: 0, y: 5 } : undefined}
            animate={animated ? { opacity: 1, y: 0 } : undefined}
            transition={{ delay: 0.2 }}
            className="absolute -bottom-1 -right-1 w-7 h-7 rounded-lg bg-primary flex items-center justify-center shadow-lg shadow-primary/20"
          >
            <SecondaryIcon size={14} className="text-primary-foreground" />
          </motion.div>
        )}
        {badge && (
          <motion.div
            initial={animated ? { opacity: 0, y: -5 } : undefined}
            animate={animated ? { opacity: 1, y: 0 } : undefined}
            transition={{ delay: 0.15 }}
            className={cn(
              'absolute -top-2 -right-2 px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider',
              badge.variant === 'pro' ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white' :
              badge.variant === 'new' ? 'bg-green-500 text-white' :
              badge.variant === 'tip' ? 'bg-primary text-primary-foreground' :
              'bg-card border border-border text-muted-foreground',
            )}
          >
            {badge.label}
          </motion.div>
        )}
      </motion.div>

      <motion.h3
        initial={animated ? { opacity: 0, y: 10 } : undefined}
        animate={animated ? { opacity: 1, y: 0 } : undefined}
        transition={{ delay: 0.1 }}
        className={cn('font-semibold text-foreground mb-1.5', s.title)}
      >
        {title}
      </motion.h3>

      <motion.p
        initial={animated ? { opacity: 0, y: 10 } : undefined}
        animate={animated ? { opacity: 1, y: 0 } : undefined}
        transition={{ delay: 0.15 }}
        className={cn('text-muted-foreground max-w-sm leading-relaxed mb-6', s.desc)}
      >
        {description}
      </motion.p>

      {actions && actions.length > 0 && (
        <motion.div
          initial={animated ? { opacity: 0, y: 10 } : undefined}
          animate={animated ? { opacity: 1, y: 0 } : undefined}
          transition={{ delay: 0.2 }}
          className="flex flex-wrap items-center justify-center gap-3"
        >
          {actions.map((action, i) => {
            const IconBtn = action.icon || Plus;
            const base = 'inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium transition-all focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none';
            if (action.variant === 'ghost') {
              return (
                <button
                  key={i}
                  onClick={() => { action.onClick?.(); if (action.to) navigate(action.to); }}
                  className={cn(base, 'text-muted-foreground hover:text-foreground hover:bg-accent')}
                >
                  <IconBtn size={14} />
                  {action.label}
                </button>
              );
            }
            if (action.variant === 'secondary') {
              return (
                <button
                  key={i}
                  onClick={() => { action.onClick?.(); if (action.to) navigate(action.to); }}
                  className={cn(base, 'bg-card border border-border text-foreground hover:bg-accent shadow-sm')}
                >
                  <IconBtn size={14} />
                  {action.label}
                </button>
              );
            }
            return (
              <button
                key={i}
                onClick={() => { action.onClick?.(); if (action.to) navigate(action.to); }}
                className={cn(base, 'bg-primary text-primary-foreground hover:bg-primary/90 shadow-lg shadow-primary/20 hover:shadow-primary/30')}
              >
                <IconBtn size={14} />
                {action.label}
              </button>
            );
          })}
        </motion.div>
      )}

      {templates && templates.length > 0 && (
        <motion.div
          initial={animated ? { opacity: 0 } : undefined}
          animate={animated ? { opacity: 1 } : undefined}
          transition={{ delay: 0.3 }}
          className="mt-4"
        >
          <p className="text-[10px] font-medium text-muted-foreground/50 uppercase tracking-wider mb-2">Templates</p>
          <div className="flex flex-wrap items-center justify-center gap-2">
            {templates.map((tmpl) => (
              <button
                key={tmpl.name}
                onClick={tmpl.onClick}
                className="px-3 py-1.5 rounded-lg bg-card border border-border text-xs text-muted-foreground hover:text-foreground hover:border-primary/30 hover:bg-accent transition-all"
              >
                {tmpl.name}
              </button>
            ))}
          </div>
        </motion.div>
      )}

      {children}
    </div>
  );

  return animated ? (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
    >
      {content}
    </motion.div>
  ) : content;
}
