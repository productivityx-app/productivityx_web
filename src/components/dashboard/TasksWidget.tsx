import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { CheckSquare, Circle, CheckCircle2, ArrowRight, Clock, AlertTriangle } from 'lucide-react';
import { motion } from 'framer-motion';
import { formatDistanceToNow, isToday, parseISO } from 'date-fns';
import { getDateFnsLocale } from '@/i18n/dateLocales';
import EmptyState from './EmptyState';
import type { Task } from '@/types';

const priorityColor: Record<string, string> = {
  URGENT: 'border-l-rose-500 bg-rose-500/5',
  HIGH: 'border-l-orange-500 bg-orange-500/5',
  MEDIUM: 'border-l-primary/40',
  LOW: 'border-l-muted-foreground/20',
};

const statusIcon = {
  TODO: Circle,
  IN_PROGRESS: Clock,
  DONE: CheckCircle2,
};

interface Props {
  tasks: Task[];
}

export default function TasksWidget({ tasks }: Props) {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const locale = getDateFnsLocale();
  const [view, setView] = useState<'list' | 'kanban'>('list');

  const today = new Date();
  const dueToday = tasks.filter((t) => t.dueDate && isToday(new Date(t.dueDate)) && t.status !== 'DONE' && t.status !== 'CANCELLED');
  const overdue = tasks.filter((t) => t.dueDate && new Date(t.dueDate) < today && t.status !== 'DONE' && t.status !== 'CANCELLED');
  const totalForToday = tasks.filter((t) => t.dueDate && isToday(new Date(t.dueDate)));
  const doneToday = totalForToday.filter((t) => t.status === 'DONE').length;
  const progressToday = totalForToday.length > 0 ? doneToday / totalForToday.length : 0;

  const displayTasks = dueToday.length > 0 ? dueToday : overdue.length > 0 ? overdue : tasks.filter(t => t.status !== 'DONE' && t.status !== 'CANCELLED').slice(0, 5);

  const getRelativeDue = (dueDate: string) => {
    const d = new Date(dueDate);
    const now = new Date();
    const diff = d.getTime() - now.getTime();
    const hours = Math.round(diff / (1000 * 60 * 60));
    if (hours < 0) return t('tasks.overdue');
    if (hours < 2) return t('tasks.dueUrgent', { hours });
    return formatDistanceToNow(d, { addSuffix: true, locale });
  };

  if (tasks.length === 0) {
    return (
      <div className="bg-card border border-border rounded-xl">
        <EmptyState
          icon={CheckSquare}
          title={t('tasks.noTasksYet')}
          description={t('dashboard.createFirstTask')}
          action={{ label: t('tasks.addTask'), onClick: () => navigate('/tasks/new') }}
        />
      </div>
    );
  }

  return (
    <div className="bg-card border border-border rounded-xl p-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-xs font-semibold text-foreground uppercase tracking-wider">{t('nav.tasks')}</h3>
        <div className="flex items-center gap-1">
          <button
            onClick={() => setView('list')}
            className={`text-[10px] px-2 py-0.5 rounded transition-colors ${view === 'list' ? 'bg-primary/10 text-primary' : 'text-muted-foreground hover:text-foreground'}`}
          >
            {t('tasks.list')}
          </button>
          <button
            onClick={() => setView('kanban')}
            className={`text-[10px] px-2 py-0.5 rounded transition-colors ${view === 'kanban' ? 'bg-primary/10 text-primary' : 'text-muted-foreground hover:text-foreground'}`}
          >
            {t('tasks.board')}
          </button>
        </div>
      </div>

      {totalForToday.length > 0 && (
        <div className="mb-3">
          <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
            <span>{t('dashboard.todayProgress')}</span>
            <span className="tabular-nums">{doneToday}/{totalForToday.length}</span>
          </div>
          <div className="h-1.5 bg-muted rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-primary rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${progressToday * 100}%` }}
              transition={{ duration: 0.8, ease: 'easeOut' }}
            />
          </div>
        </div>
      )}

      <div className="space-y-1">
        {displayTasks.slice(0, 5).map((task, i) => {
          const isUrgent = task.dueDate && new Date(task.dueDate) < today && task.status !== 'DONE';
          const StatusIcon = statusIcon[task.status as keyof typeof statusIcon] || Circle;
          return (
            <motion.button
              key={task.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.35 + i * 0.04, ease: 'easeOut' }}
              whileHover={{ x: 2 }}
              onClick={() => navigate(`/tasks/${task.id}`)}
              className="w-full text-left flex items-center gap-2.5 rounded-lg p-2 hover:bg-accent/50 transition-colors focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none group"
            >
              <StatusIcon size={14} className={`flex-shrink-0 ${task.status === 'DONE' ? 'text-primary' : 'text-muted-foreground/40 group-hover:text-muted-foreground'}`} />
              <div className="flex-1 min-w-0">
                <p className={`text-sm truncate ${task.status === 'DONE' ? 'line-through text-muted-foreground' : 'text-foreground'}`}>
                  {task.title}
                </p>
                <div className="flex items-center gap-2 mt-0.5">
                  {task.dueDate && (
                    <span className={`text-[10px] flex items-center gap-0.5 ${isUrgent ? 'text-rose-500 font-medium' : 'text-muted-foreground'}`}>
                      {isUrgent && <AlertTriangle size={10} />}
                      {getRelativeDue(task.dueDate)}
                    </span>
                  )}
                  {task.priority && task.priority !== 'MEDIUM' && (
                    <span className={`text-[10px] px-1 py-0.5 rounded-full font-medium ${
                      task.priority === 'URGENT' ? 'bg-rose-500/10 text-rose-500' :
                      task.priority === 'HIGH' ? 'bg-orange-500/10 text-orange-500' :
                      'bg-muted text-muted-foreground'
                    }`}>
                      {t(`priorities.${task.priority.toLowerCase()}`)}
                    </span>
                  )}
                </div>
              </div>
              <ArrowRight size={12} className="text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0" />
            </motion.button>
          );
        })}
      </div>

      {tasks.length > 5 && (
        <button
          onClick={() => navigate('/tasks')}
          className="mt-2 w-full text-xs text-center text-muted-foreground hover:text-primary transition-colors py-1 focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none rounded"
        >
          {t('dashboard.viewAllTasks', { count: tasks.length })}
        </button>
      )}
    </div>
  );
}
