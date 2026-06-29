import { forwardRef, HTMLAttributes } from 'react';
import { motion } from 'framer-motion';
import { Clock, ListChecks } from 'lucide-react';
import { formatDistanceToNow, isPast, parseISO } from 'date-fns';
import { cn } from '@/lib/utils';
import { getDateFnsLocale } from '@/i18n/dateLocales';
import { Task } from '@/types';
import PriorityBadge from '@/components/common/PriorityBadge';

interface Props extends HTMLAttributes<HTMLDivElement> {
  task: Task;
  dragHandleProps?: Record<string, unknown>;
}

const KanbanCard = forwardRef<HTMLDivElement, Props>(({ task, dragHandleProps: _dragHandleProps, className, style, onClick, ...rest }, ref) => {
  const locale = getDateFnsLocale();
  const isOverdue = task.dueDate && !['DONE', 'CANCELLED'].includes(task.status) && isPast(parseISO(task.dueDate));
  const completedSubtasks = task.subtasks?.filter((s) => s.status === 'DONE').length || 0;
  const totalSubtasks = task.subtasks?.length || 0;

  return (
    <motion.div
      ref={ref}
      layout
      layoutId={task.id}
      className={cn("bg-background border border-border rounded-xl p-3 cursor-pointer hover:border-primary/30 hover:shadow-sm transition-all", className)}
      style={style}
      onClick={onClick}
    >
      <p className="text-sm font-medium text-foreground mb-2 line-clamp-2">{task.title}</p>
      {task.description && (
        <p className="text-xs text-muted-foreground line-clamp-2 mb-2">{task.description}</p>
      )}
      <div className="flex items-center gap-2 flex-wrap">
        <PriorityBadge priority={task.priority} />
        {task.dueDate && (
          <span className={cn('text-xs flex items-center gap-1', isOverdue ? 'text-destructive' : 'text-muted-foreground')}>
            <Clock size={10} />
            {formatDistanceToNow(parseISO(task.dueDate), { addSuffix: true, locale })}
          </span>
        )}
      </div>
      {totalSubtasks > 0 && (
        <div className="mt-2 flex items-center gap-2">
          <div className="flex-1 h-1 bg-muted rounded-full overflow-hidden">
            <div
              className="h-full bg-primary rounded-full transition-all"
              style={{ width: `${Math.round((completedSubtasks / totalSubtasks) * 100)}%` }}
            />
          </div>
          <span className="text-xs text-muted-foreground flex items-center gap-0.5">
            <ListChecks size={10} />
            {completedSubtasks}/{totalSubtasks}
          </span>
        </div>
      )}
    </motion.div>
  );
});

KanbanCard.displayName = 'KanbanCard';
export default KanbanCard;
