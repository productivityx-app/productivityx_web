import { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ArrowLeft, Save, Trash2, Sparkles, History } from 'lucide-react';
import { toast } from 'sonner';
import { format, differenceInDays, isPast } from 'date-fns';
import { tasksApi } from '@/api/tasks';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Skeleton } from '@/components/ui/skeleton';
import SubtaskList from '@/components/tasks/SubtaskList';
import TaskProperties from '@/components/tasks/TaskProperties';
import PriorityBadge from '@/components/common/PriorityBadge';

export default function TaskDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const { t } = useTranslation();
  const isNew = id === 'new';
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState('TODO');
  const [priority, setPriority] = useState('MEDIUM');
  const [dueDate, setDueDate] = useState('');
  const [dueTime, setDueTime] = useState('');
  const [estimatedMinutes, setEstimatedMinutes] = useState<number | null>(null);
  const [saving, setSaving] = useState(false);
  const [showProperties, setShowProperties] = useState(true);

  const { data: task, isLoading } = useQuery({
    queryKey: ['task', id],
    queryFn: () => tasksApi.get(id as string),
    enabled: !isNew && !!id,
  });

  useEffect(() => {
    if (task) {
      setTitle(task.title || '');
      setDescription(task.description || '');
      setStatus(task.status);
      setPriority(task.priority);
      setDueDate(task.dueDate ? task.dueDate.split('T')[0] : '');
      setDueTime(task.dueTime || '');
      setEstimatedMinutes(task.estimatedMinutes);
    }
  }, [task]);

  const createMutation = useMutation({
    mutationFn: (data: Record<string, unknown>) => tasksApi.create(data),
    onSuccess: (newTask) => {
      qc.invalidateQueries({ queryKey: ['tasks'] });
      navigate(`/tasks/${newTask.id}`, { replace: true });
      toast.success(t('taskDetail.createdSuccess'));
    },
  });

  const updateMutation = useMutation({
    mutationFn: (data: Record<string, unknown>) => tasksApi.update(id!, data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['tasks'] }); qc.invalidateQueries({ queryKey: ['task', id] }); toast.success(t('taskDetail.saveSuccess')); },
  });

  const deleteMutation = useMutation({
    mutationFn: () => tasksApi.softDelete(id!),
    onSuccess: () => { toast.success(t('tasks.movedToTrash')); navigate('/tasks'); qc.invalidateQueries({ queryKey: ['tasks'] }); },
  });

  const handleSave = () => {
    if (!title.trim()) { toast.error(t('taskDetail.titleRequired')); return; }
    setSaving(true);
    const data: Record<string, unknown> = {
      title: title.trim(),
      description: description || null,
      status,
      priority,
      dueDate: dueDate || null,
      dueTime: dueTime || null,
      estimatedMinutes,
    };
    (isNew ? createMutation : updateMutation).mutate(data, { onSettled: () => setSaving(false) });
  };

  const handlePropertyUpdate = (data: Record<string, unknown>) => {
    if (isNew) return;
    updateMutation.mutate(data);
  };

  const activityLog = useMemo(() => {
    if (!task) return [];
    const logs: { time: string; event: string }[] = [];
    logs.push({ time: task.createdAt, event: t('taskDetail.activityCreated') });
    if (task.completedAt) logs.push({ time: task.completedAt, event: t('taskDetail.activityCompleted') });
    if (task.updatedAt !== task.createdAt) logs.push({ time: task.updatedAt, event: t('taskDetail.activityUpdated') });
    return logs.sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime());
  }, [task, t]);

  const aiSuggestions = useMemo(() => {
    if (!task) return [];
    const suggestions: string[] = [];
    if (task.dueDate && isPast(new Date(task.dueDate)) && task.status !== 'DONE') {
      suggestions.push(t('taskDetail.aiOverdue'));
    }
    if (task.status === 'IN_PROGRESS') {
      const days = differenceInDays(new Date(), new Date(task.updatedAt));
      if (days >= 3) suggestions.push(t('taskDetail.aiInProgressLong', { days }));
    }
    if (task.subtasks && task.subtasks.length > 0) {
      const done = task.subtasks.filter((s) => s.status === 'DONE').length;
      if (done === 0) suggestions.push(t('taskDetail.aiNoSubtasksDone'));
    }
    return suggestions;
  }, [task, t]);

  if (isLoading) {
    return (
      <div className="p-6 max-w-4xl mx-auto space-y-4">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-32 rounded-xl" />
        <Skeleton className="h-48 rounded-xl" />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <header className="flex items-center gap-2 px-4 py-2 border-b border-border bg-card/50 flex-shrink-0">
        <button
          onClick={() => navigate('/tasks')}
          className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
        >
          <ArrowLeft size={16} />
        </button>
        {task?.title && (
          <span className="text-xs text-muted-foreground hidden sm:block truncate max-w-[160px]">
            {task.title}
          </span>
        )}
        <div className="flex-1" />
        {task && (
          <button
            onClick={() => setShowProperties(!showProperties)}
            className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
          >
            {showProperties ? t('taskDetail.hideProperties') : t('taskDetail.showProperties')}
          </button>
        )}
        {!isNew && (
          <button
            onClick={() => deleteMutation.mutate()}
            className="p-1.5 rounded-lg text-muted-foreground hover:text-destructive hover:bg-accent transition-colors"
          >
            <Trash2 size={14} />
          </button>
        )}
        <button
          onClick={handleSave}
          disabled={saving || !title.trim() || createMutation.isPending || updateMutation.isPending}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-primary text-primary-foreground rounded-lg text-xs font-medium hover:bg-primary/90 disabled:opacity-40 transition-colors"
        >
          <Save size={12} />
          {saving ? t('common.saving') : t('common.save')}
        </button>
      </header>

      <div className="flex flex-1 overflow-hidden">
        <div className="flex-1 overflow-y-auto p-4 sm:p-6">
          <div className="max-w-3xl mx-auto space-y-6">
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder={t('taskDetail.titlePlaceholder')}
              className="w-full text-2xl font-bold text-foreground bg-transparent outline-none placeholder:text-muted-foreground/40"
            />

            <textarea
              value={description || ''}
              onChange={(e) => setDescription(e.target.value)}
              placeholder={t('taskDetail.descriptionPlaceholder')}
              rows={6}
              className="w-full bg-transparent text-sm text-foreground placeholder:text-muted-foreground/40 outline-none resize-none leading-relaxed"
            />

            <div className="bg-card border border-border rounded-xl p-4 space-y-4">
              <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">{t('taskDetail.properties')}</h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div>
                  <label className="text-xs font-medium text-muted-foreground mb-1.5 block">{t('taskDetail.statusLabel')}</label>
                  <select value={status} onChange={(e) => setStatus(e.target.value)} className="w-full bg-background border border-border rounded-lg px-2.5 py-1.5 text-sm text-foreground outline-none focus-visible:ring-2 focus-visible:ring-ring">
                    <option value="TODO">To Do</option>
                    <option value="IN_PROGRESS">In Progress</option>
                    <option value="ON_HOLD">On Hold</option>
                    <option value="DONE">Done</option>
                    <option value="CANCELLED">Cancelled</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-medium text-muted-foreground mb-1.5 block">{t('taskDetail.priorityLabel')}</label>
                  <select value={priority} onChange={(e) => setPriority(e.target.value)} className="w-full bg-background border border-border rounded-lg px-2.5 py-1.5 text-sm text-foreground outline-none focus-visible:ring-2 focus-visible:ring-ring">
                    <option value="LOW">Low</option>
                    <option value="MEDIUM">Medium</option>
                    <option value="HIGH">High</option>
                    <option value="URGENT">Urgent</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-medium text-muted-foreground mb-1.5 block">{t('taskDetail.dueDateLabel')}</label>
                  <input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} className="w-full bg-background border border-border rounded-lg px-2.5 py-1.5 text-sm text-foreground outline-none focus-visible:ring-2 focus-visible:ring-ring" />
                </div>
                <div>
                  <label className="text-xs font-medium text-muted-foreground mb-1.5 block">{t('taskDetail.estimatedMinutesLabel')}</label>
                  <input type="number" min={0} value={estimatedMinutes ?? ''} onChange={(e) => setEstimatedMinutes(e.target.value ? parseInt(e.target.value) : null)} placeholder={t('taskDetail.minutes')} className="w-full bg-background border border-border rounded-lg px-2.5 py-1.5 text-sm text-foreground outline-none placeholder:text-muted-foreground/40 focus-visible:ring-2 focus-visible:ring-ring" />
                </div>
              </div>
              {dueTime && (
                <div className="flex items-center gap-2">
                  <label className="text-xs font-medium text-muted-foreground">{t('taskDetail.dueTimeLabel')}</label>
                  <input type="time" value={dueTime} onChange={(e) => setDueTime(e.target.value)} className="bg-background border border-border rounded-lg px-2.5 py-1.5 text-sm text-foreground outline-none focus-visible:ring-2 focus-visible:ring-ring" />
                  <button onClick={() => setDueTime('')} className="text-xs text-muted-foreground hover:text-foreground transition-colors">{t('common.clear')}</button>
                </div>
              )}
              {!dueTime && (
                <button onClick={() => setDueTime('12:00')} className="text-xs text-muted-foreground hover:text-foreground transition-colors">{t('taskDetail.addTime')}</button>
              )}
              <div className="flex items-center gap-2">
                <PriorityBadge priority={priority} />
                {dueDate && (
                  <span className="text-xs text-muted-foreground">
                    {t('taskDetail.duePrefix')} {format(new Date(dueDate), 'MMM d, yyyy')}{dueTime ? ` ${dueTime}` : ''}
                  </span>
                )}
              </div>
            </div>

            {task && !isNew && (
              <div>
                <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
                  {t('taskDetail.subtasks')} ({task.subtasks?.length || 0})
                </h3>
                <SubtaskList
                  taskId={task.id}
                  subtasks={task.subtasks || []}
                  onRefresh={() => qc.invalidateQueries({ queryKey: ['task', id] })}
                />
              </div>
            )}

            {task && !isNew && aiSuggestions.length > 0 && (
              <div className="bg-primary/5 border border-primary/20 rounded-xl p-4">
                <h4 className="text-xs font-semibold text-primary flex items-center gap-1.5 mb-2">
                  <Sparkles size={12} />
                  {t('taskDetail.aiSuggestions')}
                </h4>
                <ul className="space-y-1">
                  {aiSuggestions.map((s, i) => (
                    <li key={i} className="text-xs text-muted-foreground flex items-start gap-2">
                      <span className="text-primary mt-0.5">•</span>
                      {s}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {task && !isNew && (
              <div>
                <h4 className="text-xs font-semibold text-muted-foreground flex items-center gap-1.5 mb-2">
                  <History size={12} />
                  {t('taskDetail.activity')}
                </h4>
                <div className="space-y-1">
                  {activityLog.map((log, i) => (
                    <div key={i} className="flex items-center gap-3 text-xs text-muted-foreground">
                      <span className="tabular-nums">{format(new Date(log.time), 'MMM d, HH:mm')}</span>
                      <span>{log.event}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {(task || isNew) && showProperties && (
          <motion.div
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: 280, opacity: 1 }}
            exit={{ width: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden flex-shrink-0 border-l border-border bg-card/30 hidden lg:block"
          >
            <div className="w-[280px] p-4 space-y-4 overflow-y-auto h-full">
              <TaskProperties
                task={task || {
                  id: 'new',
                  userId: '',
                  parentTaskId: null,
                  linkedEventId: null,
                  title: title || '',
                  description: description || null,
                  status: status as any,
                  priority: priority as any,
                  dueDate: dueDate || null,
                  dueTime: dueTime || null,
                  reminderAt: null,
                  estimatedMinutes: estimatedMinutes,
                  actualMinutes: 0,
                  completedAt: null,
                  position: 0,
                  deleted: false,
                  deletedAt: null,
                  version: 1,
                  syncStatus: 'PENDING',
                  subtasks: [],
                  createdAt: new Date().toISOString(),
                  updatedAt: new Date().toISOString(),
                }}
                onUpdate={isNew ? (data) => {
                  if (data.status) setStatus(data.status as string);
                  if (data.priority) setPriority(data.priority as string);
                  if (data.dueDate !== undefined) setDueDate(data.dueDate || '');
                  if (data.dueTime !== undefined) setDueTime(data.dueTime || '');
                  if (data.estimatedMinutes !== undefined) setEstimatedMinutes(data.estimatedMinutes as number | null);
                } : handlePropertyUpdate}
              />
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
