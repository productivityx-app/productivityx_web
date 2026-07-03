import { Clock, Calendar, Timer, Target } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { cn } from '@/lib/utils';
import { Task, TaskStatus, TaskPriority } from '@/types';
import { format } from 'date-fns';

interface Props {
  task: Task;
  onUpdate: (data: Record<string, unknown>) => void;
}

const STATUSES: { value: TaskStatus; label: string; dot: string }[] = [
  { value: 'TODO', label: 'To Do', dot: 'bg-blue-500' },
  { value: 'IN_PROGRESS', label: 'In Progress', dot: 'bg-amber-500' },
  { value: 'ON_HOLD', label: 'On Hold', dot: 'bg-orange-500' },
  { value: 'DONE', label: 'Done', dot: 'bg-green-500' },
  { value: 'CANCELLED', label: 'Cancelled', dot: 'bg-gray-500' },
];

const PRIORITIES: { value: TaskPriority; label: string; icon: string }[] = [
  { value: 'LOW', label: 'Low', icon: '🟢' },
  { value: 'MEDIUM', label: 'Medium', icon: '🟡' },
  { value: 'HIGH', label: 'High', icon: '🔶' },
  { value: 'URGENT', label: 'Urgent', icon: '🔴' },
];

export default function TaskProperties({ task, onUpdate }: Props) {
  const { t } = useTranslation();

  const Section = ({ label, htmlFor, children }: { label: string; htmlFor?: string; children: React.ReactNode }) => (
    <div className="space-y-1.5">
      <label htmlFor={htmlFor} className="text-xs font-medium text-muted-foreground uppercase tracking-wider">{label}</label>
      {children}
    </div>
  );

  return (
    <div className="space-y-5">
      <Section label={t('taskDetail.statusLabel')} htmlFor="task-props-status">
        <select
          id="task-props-status"
          name="status"
          value={task.status}
          onChange={(e) => onUpdate({ status: e.target.value })}
          className="w-full px-3 py-1.5 bg-card border border-border rounded-lg text-sm text-foreground outline-none focus:ring-2 focus:ring-ring"
        >
          {STATUSES.map((s) => (
            <option key={s.value} value={s.value}>
              {s.label}
            </option>
          ))}
        </select>
      </Section>

      <Section label={t('taskDetail.priorityLabel')}>
        <div className="flex gap-1">
          {PRIORITIES.map((p) => (
            <button
              key={p.value}
              onClick={() => onUpdate({ priority: p.value })}
              className={cn(
                'flex-1 px-2 py-1.5 rounded-lg text-xs font-medium transition-all',
                task.priority === p.value
                  ? 'bg-primary/10 text-primary ring-1 ring-primary/30'
                  : 'text-muted-foreground hover:text-foreground hover:bg-accent',
              )}
            >
              {p.icon}
            </button>
          ))}
        </div>
      </Section>

      <Section label={t('taskDetail.dueDateLabel')} htmlFor="task-props-dueDate">
        <div className="flex items-center gap-2">
          <Calendar size={14} className="text-muted-foreground" />
          <input
            id="task-props-dueDate"
            name="dueDate"
            type="date"
            value={task.dueDate ? task.dueDate.split('T')[0] : ''}
            onChange={(e) => onUpdate({ dueDate: e.target.value || null })}
            className="flex-1 px-3 py-1.5 bg-card border border-border rounded-lg text-sm text-foreground outline-none focus:ring-2 focus:ring-ring"
          />
        </div>
        {task.dueTime && (
          <div className="flex items-center gap-2 mt-1.5">
            <Clock size={14} className="text-muted-foreground" />
            <input
              id="task-props-dueTime"
              name="dueTime"
              type="time"
              value={task.dueTime}
              onChange={(e) => onUpdate({ dueTime: e.target.value || null })}
              className="flex-1 px-3 py-1.5 bg-card border border-border rounded-lg text-sm text-foreground outline-none focus:ring-2 focus:ring-ring"
            />
          </div>
        )}
      </Section>

      <Section label={t('taskDetail.estimatedMinutesLabel')} htmlFor="task-props-estimatedMinutes">
        <div className="flex items-center gap-2">
          <Timer size={14} className="text-muted-foreground" />
          <input
            id="task-props-estimatedMinutes"
            name="estimatedMinutes"
            type="number"
            min={0}
            step={5}
            value={task.estimatedMinutes || ''}
            onChange={(e) => onUpdate({ estimatedMinutes: e.target.value ? parseInt(e.target.value) : null })}
            placeholder={t('taskDetail.minutes')}
            className="flex-1 px-3 py-1.5 bg-card border border-border rounded-lg text-sm text-foreground outline-none focus:ring-2 focus:ring-ring"
          />
        </div>
      </Section>

      <Section label={t('taskDetail.actualTime')}>
        <div className="flex items-center gap-2">
          <Target size={14} className="text-muted-foreground" />
          <span className="text-sm text-foreground">{task.actualMinutes || 0} {t('taskDetail.minutes')}</span>
        </div>
      </Section>

      <Section label={t('taskDetail.created')}>
        <p className="text-sm text-muted-foreground">
          {format(new Date(task.createdAt), 'MMM d, yyyy HH:mm')}
        </p>
      </Section>

      <Section label={t('taskDetail.updated')}>
        <p className="text-sm text-muted-foreground">
          {format(new Date(task.updatedAt), 'MMM d, yyyy HH:mm')}
        </p>
      </Section>
    </div>
  );
}
