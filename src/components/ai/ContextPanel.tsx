import { useState } from 'react';
import { FileText, CheckSquare, CalendarDays, ChevronDown, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { cn } from '@/lib/utils';

interface ContextItem {
  id: string;
  type: 'note' | 'task' | 'event';
  title: string;
  subtitle?: string;
}

interface Props {
  notes: ContextItem[];
  tasks: ContextItem[];
  events: ContextItem[];
  isLoading?: boolean;
}

function Section({
  icon: Icon,
  label,
  items,
  color,
  defaultOpen = true,
}: {
  icon: React.ElementType;
  label: string;
  items: ContextItem[];
  color: string;
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div className="border-b border-border/50 last:border-b-0">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center justify-between w-full px-4 py-2.5 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors"
      >
        <div className="flex items-center gap-2">
          <Icon size={14} style={{ color }} />
          {label}
          <span className="text-[10px] text-muted-foreground/50">({items.length})</span>
        </div>
        {open ? <ChevronDown size={12} /> : <ChevronRight size={12} />}
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-2.5 space-y-1">
              {items.length === 0 ? (
                <p className="text-[11px] text-muted-foreground/30 italic">None</p>
              ) : (
                items.slice(0, 5).map((item) => (
                  <div key={item.id} className="flex items-center gap-2 py-1">
                    <div className="w-1 h-1 rounded-full flex-shrink-0" style={{ backgroundColor: color }} />
                    <span className="text-[11px] text-muted-foreground truncate">{item.title || 'Untitled'}</span>
                  </div>
                ))
              )}
              {items.length > 5 && (
                <p className="text-[10px] text-muted-foreground/40 pl-3">+{items.length - 5} more</p>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function ContextPanel({ notes, tasks, events, isLoading }: Props) {
  const { t } = useTranslation();

  return (
    <div className="w-64 flex-shrink-0 border-l border-border bg-card/50 flex flex-col">
      <div className="px-4 py-3 border-b border-border">
        <h3 className="text-xs font-semibold text-foreground">{t('ai.contextPanel')}</h3>
      </div>
      <div className="flex-1 overflow-y-auto divide-y divide-border/50">
        <Section icon={FileText} label={t('ai.referencedNotes')} items={notes} color="#3B82F6" />
        <Section icon={CheckSquare} label={t('ai.relatedTasks')} items={tasks} color="#22C55E" />
        <Section icon={CalendarDays} label={t('ai.upcomingEvents')} items={events} color="#8B5CF6" />
      </div>
    </div>
  );
}
