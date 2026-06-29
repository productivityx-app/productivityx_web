import { useState, memo } from 'react';
import { Check, Trash2, GripVertical, Clock, ListChecks } from 'lucide-react';
import { motion } from 'framer-motion';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { formatDistanceToNow, isPast, parseISO } from 'date-fns';
import { cn } from '@/lib/utils';
import { useTranslation } from 'react-i18next';
import { getDateFnsLocale } from '@/i18n/dateLocales';
import { tasksApi } from '@/api/tasks';
import { Task, TaskStatus, TaskPriority } from '@/types';
import PriorityBadge from '@/components/common/PriorityBadge';

interface Props {
  task: Task;
  selected?: boolean;
  onToggleSelect?: (id: string) => void;
  onClick?: () => void;
  isDragging?: boolean;
}

const STATUS_COLORS: Record<TaskStatus, string> = {
  TODO: 'border-l-blue-500',
  IN_PROGRESS: 'border-l-amber-500',
  ON_HOLD: 'border-l-orange-500',
  DONE: 'border-l-green-500',
  CANCELLED: 'border-l-gray-400',
};

const PRIORITY_LEFT_COLORS: Record<TaskPriority, string> = {
  LOW: 'border-l-transparent',
  MEDIUM: 'border-l-chart-2',
  HIGH: 'border-l-chart-3',
  URGENT: 'border-l-chart-4',
};

const TaskListItem = memo(function TaskListItem({ task, selected, onToggleSelect, onClick, isDragging }: Props) {
  const { t } = useTranslation();
  const qc = useQueryClient();
  const locale = getDateFnsLocale();
  const [hover, setHover] = useState(false);

  const toggleMutation = useMutation({
    mutationFn: () => tasksApi.updateStatus(task.id, task.status === 'DONE' ? 'TODO' : 'DONE'),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['tasks'] }),
  });

  const deleteMutation = useMutation({
    mutationFn: () => tasksApi.softDelete(task.id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['tasks'] }); toast.success(t('tasks.movedToTrash')); },
  });

  const isOverdue = task.dueDate && !['DONE', 'CANCELLED'].includes(task.status) && isPast(parseISO(task.dueDate));
  const completedSubtasks = task.subtasks?.filter((s) => s.status === 'DONE').length || 0;
  const totalSubtasks = task.subtasks?.length || 0;

  return (
    <motion.div
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      className={cn(
        'group flex items-center gap-3 px-4 py-3 border border-border rounded-xl cursor-pointer transition-all bg-card focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none',
        'hover:border-primary/30 hover:shadow-sm',
        isDragging && 'opacity-50 shadow-lg',
        selected && 'border-primary/50 bg-primary/[0.03]',
        STATUS_COLORS[task.status],
        'border-l-4',
      )}
      onClick={onClick}
      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onClick?.(); } }}
      layout
      tabIndex={0}
    >
      {onToggleSelect && (
        <div
          onClick={(e) => { e.stopPropagation(); onToggleSelect(task.id); }}
          className={cn(
            'w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0 transition-colors cursor-pointer',
            selected ? 'bg-primary border-primary' : 'border-muted-foreground/30 hover:border-primary/50',
          )}
        >
          {selected && <Check size={12} className="text-primary-foreground" />}
        </div>
      )}

      <button
        onClick={(e) => { e.stopPropagation(); toggleMutation.mutate(); }}
        className={cn(
          'w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all',
          task.status === 'DONE'
            ? 'bg-green-500 border-green-500'
            : 'border-muted-foreground/30 hover:border-green-400 hover:bg-green-500/10',
        )}
      >
        {task.status === 'DONE' && <Check size={10} className="text-white" />}
      </button>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className={cn(
            'text-sm font-medium truncate',
            task.status === 'DONE' && 'line-through text-muted-foreground',
          )}>
            {task.title}
          </span>
        </div>
        <div className="flex items-center gap-3 mt-0.5">
          {task.dueDate && (
            <span className={cn('text-xs flex items-center gap-1', isOverdue ? 'text-destructive font-medium' : 'text-muted-foreground')}>
              <Clock size={10} />
              {formatDistanceToNow(parseISO(task.dueDate), { addSuffix: true, locale })}
            </span>
          )}
          {totalSubtasks > 0 && (
            <span className="text-xs text-muted-foreground flex items-center gap-1">
              <ListChecks size={10} />
              {completedSubtasks}/{totalSubtasks}
            </span>
          )}
        </div>
      </div>

      <div className={cn('flex items-center gap-1.5', hover ? 'opacity-100' : 'opacity-0 sm:opacity-60')}>
        <PriorityBadge priority={task.priority} />
        {hover && (
          <>
            <button
              onClick={(e) => { e.stopPropagation(); deleteMutation.mutate(); }}
              className="p-1.5 rounded-lg text-muted-foreground hover:text-destructive hover:bg-accent transition-colors"
            >
              <Trash2 size={12} />
            </button>
            <div className="p-1 cursor-grab text-muted-foreground/30 hover:text-muted-foreground">
              <GripVertical size={14} />
            </div>
          </>
        )}
      </div>
    </motion.div>
  );
});

export default TaskListItem;


