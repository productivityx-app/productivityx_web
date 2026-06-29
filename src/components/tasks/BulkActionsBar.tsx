import { motion } from 'framer-motion';
import { Check, Trash2, X, Tag, ArrowUpDown } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { cn } from '@/lib/utils';
import { TaskStatus } from '@/types';

interface Props {
  count: number;
  onClear: () => void;
  onBulkComplete: () => void;
  onBulkDelete: () => void;
  onBulkStatus: (status: TaskStatus) => void;
  onBulkPriority: (priority: string) => void;
}

export default function BulkActionsBar({ count, onClear, onBulkComplete, onBulkDelete, onBulkStatus, onBulkPriority }: Props) {
  const { t } = useTranslation();

  const STATUSES: { value: TaskStatus; label: string; color: string }[] = [
    { value: 'TODO', label: t('statuses.todo'), color: 'bg-blue-500' },
    { value: 'IN_PROGRESS', label: t('statuses.inProgress'), color: 'bg-amber-500' },
    { value: 'ON_HOLD', label: t('statuses.onHold'), color: 'bg-orange-500' },
    { value: 'DONE', label: t('statuses.done'), color: 'bg-green-500' },
    { value: 'CANCELLED', label: t('statuses.cancelled'), color: 'bg-gray-500' },
  ];

  const PRIORITIES = [
    { value: 'LOW', label: t('priorities.low') },
    { value: 'MEDIUM', label: t('priorities.medium') },
    { value: 'HIGH', label: t('priorities.high') },
    { value: 'URGENT', label: t('priorities.urgent') },
  ];

  return (
    <motion.div
      initial={{ y: 40, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      exit={{ y: 40, opacity: 0 }}
      className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 flex items-center gap-2 px-4 py-2.5 bg-card border border-border rounded-xl shadow-lg backdrop-blur-lg"
    >
      <span className="text-sm font-medium text-foreground whitespace-nowrap mr-1">
        {count} {t('tasks.selected')}
      </span>

      <div className="w-px h-5 bg-border" />

      <button
        onClick={onBulkComplete}
        className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium text-green-600 hover:bg-green-500/10 transition-colors"
      >
        <Check size={12} />
        {t('tasks.bulkComplete')}
      </button>

      <div className="relative group">
        <button className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-accent transition-colors">
          <ArrowUpDown size={12} />
          {t('tasks.bulkStatus')}
        </button>
        <div className="absolute bottom-full left-0 mb-1 hidden group-hover:block bg-card border border-border rounded-xl p-1 shadow-lg min-w-[140px]">
          {STATUSES.map((s) => (
            <button
              key={s.value}
              onClick={() => onBulkStatus(s.value)}
              className="flex items-center gap-2 w-full px-3 py-1.5 text-xs text-foreground hover:bg-accent rounded-lg transition-colors"
            >
              <span className={cn('w-2 h-2 rounded-full', s.color)} />
              {s.label}
            </button>
          ))}
        </div>
      </div>

      <div className="relative group">
        <button className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-accent transition-colors">
          <Tag size={12} />
          {t('tasks.bulkPriority')}
        </button>
        <div className="absolute bottom-full left-0 mb-1 hidden group-hover:block bg-card border border-border rounded-xl p-1 shadow-lg min-w-[140px]">
          {PRIORITIES.map((p) => (
            <button
              key={p.value}
              onClick={() => onBulkPriority(p.value)}
              className="flex items-center gap-2 w-full px-3 py-1.5 text-xs text-foreground hover:bg-accent rounded-lg transition-colors"
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      <div className="w-px h-5 bg-border" />

      <button
        onClick={onBulkDelete}
        className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium text-destructive hover:bg-destructive/10 transition-colors"
      >
        <Trash2 size={12} />
        {t('common.delete')}
      </button>

      <button
        onClick={onClear}
        className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
      >
        <X size={14} />
      </button>
    </motion.div>
  );
}
