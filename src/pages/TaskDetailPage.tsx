import { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ArrowLeft, Save, Trash2, Sparkles, History, CalendarIcon, Clock } from 'lucide-react';
import { toast } from 'sonner';
import { format, differenceInDays, isPast } from 'date-fns';
import { tasksApi } from '@/api/tasks';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Skeleton } from '@/components/ui/skeleton';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DayPicker } from 'react-day-picker';
import SubtaskList from '@/components/tasks/SubtaskList';
import TaskProperties from '@/components/tasks/TaskProperties';
import PriorityBadge from '@/components/common/PriorityBadge';

function M3TimePicker({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState<'hour' | 'minute'>('hour');

  const hour24 = value ? parseInt(value.split(':')[0]) : 12;
  const minute = value ? parseInt(value.split(':')[1]) : 0;
  const period = hour24 >= 12 ? 'PM' : 'AM';
  const hour12 = hour24 % 12 || 12;

  const [selHour, setSelHour] = useState(hour12);
  const [selMinute, setSelMinute] = useState(minute);
  const [selPeriod, setSelPeriod] = useState(period);

  const S = 260, C = S / 2, R = 96;
  const items = mode === 'hour'
    ? [12, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11]
    : [0, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55];

  const selectedValue = mode === 'hour' ? selHour : selMinute;
  const selIndex = items.indexOf(selectedValue);

  const coords = (index: number) => {
    const a = (index / items.length) * 2 * Math.PI - Math.PI / 2;
    return { x: C + R * Math.cos(a), y: C + R * Math.sin(a) };
  };

  const p = selIndex >= 0 ? coords(selIndex) : null;

  const pick = (val: number) => {
    if (mode === 'hour') {
      setSelHour(val);
      setMode('minute');
    } else {
      setSelMinute(val);
      const h = selHour === 12 ? 0 : selHour;
      const h24 = selPeriod === 'AM' ? h : h + 12;
      onChange(`${String(h24).padStart(2, '0')}:${String(val).padStart(2, '0')}`);
      setOpen(false);
    }
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button className="w-28 flex items-center justify-center gap-1.5 bg-background border border-border rounded-lg px-3 py-2 text-sm text-foreground hover:bg-accent transition-colors">
          <Clock size={14} className="text-muted-foreground shrink-0" />
          {value || <span className="text-muted-foreground/60">—</span>}
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <div className="p-4 sm:p-6">
          <div className="flex items-center justify-center gap-1 mb-5">
            <button
              onClick={() => setMode('hour')}
              className={`text-4xl font-light tabular-nums px-2 py-0.5 rounded-lg transition-colors ${
                mode === 'hour' ? 'text-foreground' : 'text-muted-foreground/40'
              }`}
            >
              {String(selHour).padStart(2, '0')}
            </button>
            <span className={`text-4xl font-light ${mode === 'hour' ? 'text-foreground' : 'text-muted-foreground/40'}`}>:</span>
            <button
              onClick={() => setMode('minute')}
              className={`text-4xl font-light tabular-nums px-2 py-0.5 rounded-lg transition-colors ${
                mode === 'minute' ? 'text-foreground' : 'text-muted-foreground/40'
              }`}
            >
              {String(selMinute).padStart(2, '0')}
            </button>
            <div className="flex flex-col gap-0.5 ml-2">
              <button
                onClick={() => setSelPeriod('AM')}
                className={`text-[10px] font-semibold px-1.5 py-0.5 rounded leading-none transition-colors ${
                  selPeriod === 'AM' ? 'text-foreground bg-muted' : 'text-muted-foreground/40 hover:text-muted-foreground'
                }`}
              >
                AM
              </button>
              <button
                onClick={() => setSelPeriod('PM')}
                className={`text-[10px] font-semibold px-1.5 py-0.5 rounded leading-none transition-colors ${
                  selPeriod === 'PM' ? 'text-foreground bg-muted' : 'text-muted-foreground/40 hover:text-muted-foreground'
                }`}
              >
                PM
              </button>
            </div>
          </div>

          <svg width={S} height={S} viewBox={`0 0 ${S} ${S}`} className="block mx-auto select-none">
            <circle cx={C} cy={C} r={R} className="fill-muted/20" />
            {p && (
              <line x1={C} y1={C} x2={p.x} y2={p.y}
                className="stroke-primary" strokeWidth={2.5} strokeLinecap="round" />
            )}
            <circle cx={C} cy={C} r={4} className="fill-primary" />

            {items.map((val, i) => {
              const pos = coords(i);
              const isSel = val === selectedValue;
              return (
                <g key={val} onClick={() => pick(val)} className="cursor-pointer">
                  {isSel && <circle cx={pos.x} cy={pos.y} r={22} className="fill-primary" />}
                  {!isSel && <circle cx={pos.x} cy={pos.y} r={22} fill="transparent" className="hover:fill-accent/50" />}
                  <text x={pos.x} y={pos.y} textAnchor="middle" dominantBaseline="central"
                    className={`text-sm select-none ${isSel ? 'fill-primary-foreground font-medium' : 'fill-foreground'}`}>
                    {String(val).padStart(2, '0')}
                  </text>
                </g>
              );
            })}
          </svg>
        </div>
      </PopoverContent>
    </Popover>
  );
}

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

  const { data: task, isLoading, isError, refetch } = useQuery({
    queryKey: ['task', id],
    queryFn: () => tasksApi.get(id as string),
    enabled: !isNew && !!id,
    retry: 1,
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

  useEffect(() => {
    if (!isNew && id) refetch();
  }, [id]);

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

  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-3 p-6">
        <p className="text-sm text-muted-foreground">{t('taskDetail.notFound')}</p>
        <button
          onClick={() => navigate('/tasks')}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-primary text-primary-foreground rounded-lg text-xs font-medium hover:bg-primary/90 transition-colors"
        >
          <ArrowLeft size={12} />
          {t('common.back')}
        </button>
      </div>
    );
  }

  return (
    <div key={id || 'new'} className="flex flex-col h-full">
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
              className="w-full text-2xl font-bold text-foreground bg-background/50 border border-border rounded-xl px-4 py-3 placeholder:text-muted-foreground/40 focus-visible:ring-2 focus-visible:ring-ring focus-visible:border-primary transition-all outline-none"
            />

            <textarea
              value={description || ''}
              onChange={(e) => setDescription(e.target.value)}
              placeholder={t('taskDetail.descriptionPlaceholder')}
              rows={6}
              className="w-full bg-background/50 border border-border rounded-xl px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground/40 focus-visible:ring-2 focus-visible:ring-ring focus-visible:border-primary transition-all outline-none resize-none leading-relaxed"
            />

            <div className="bg-card border border-border rounded-xl p-4 sm:p-5 space-y-4">
              <div className="grid grid-cols-2 gap-3 sm:gap-4">
                <div>
                  <label className="text-xs font-medium text-muted-foreground mb-1.5 block">{t('taskDetail.statusLabel')}</label>
                  <Select value={status} onValueChange={setStatus}>
                    <SelectTrigger className="w-full bg-background">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="TODO">To Do</SelectItem>
                      <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
                      <SelectItem value="ON_HOLD">On Hold</SelectItem>
                      <SelectItem value="DONE">Done</SelectItem>
                      <SelectItem value="CANCELLED">Cancelled</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-xs font-medium text-muted-foreground mb-1.5 block">{t('taskDetail.priorityLabel')}</label>
                  <Select value={priority} onValueChange={setPriority}>
                    <SelectTrigger className="w-full bg-background">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="LOW">Low</SelectItem>
                      <SelectItem value="MEDIUM">Medium</SelectItem>
                      <SelectItem value="HIGH">High</SelectItem>
                      <SelectItem value="URGENT">Urgent</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
                <div className="sm:col-span-2">
                  <label className="text-xs font-medium text-muted-foreground mb-1.5 block">{t('taskDetail.dueDateLabel')}</label>
                  <div className="flex gap-2">
                    <Popover>
                      <PopoverTrigger asChild>
                        <button className="flex-1 min-w-0 flex items-center gap-2 bg-background border border-border rounded-lg px-3 py-2 text-sm text-foreground hover:bg-accent transition-colors">
                          <CalendarIcon size={14} className="text-muted-foreground shrink-0" />
                          {dueDate ? format(new Date(dueDate), 'MMM d, yyyy') : <span className="text-muted-foreground/60">Pick a date</span>}
                        </button>
                      </PopoverTrigger>
                      <PopoverContent className="w-[296px] p-0 overflow-hidden" align="start">
                        <div className="bg-primary px-4 pt-5 pb-4">
                          <div className="text-primary-foreground/80 text-xs font-medium uppercase tracking-widest">
                            {dueDate ? format(new Date(dueDate), 'iii') : 'SELECT'}
                          </div>
                          <div className="text-primary-foreground text-2xl font-normal leading-tight mt-0.5">
                            {dueDate ? format(new Date(dueDate), 'MMM d, yyyy') : 'Pick a date'}
                          </div>
                        </div>
                        <div className="p-4">
                          <DayPicker
                            mode="single"
                            selected={dueDate ? new Date(dueDate) : undefined}
                            onSelect={(date) => setDueDate(date ? format(date, 'yyyy-MM-dd') : '')}
                            formatters={{
                              formatWeekdayName: (date: Date) =>
                                ['S','M','T','W','T','F','S'][date.getDay()],
                            }}
                            classNames={{
                              root: "bg-background",
                              months: "relative",
                              month_caption: "flex items-center justify-center h-8 text-sm font-medium text-foreground",
                              caption_label: "text-sm font-medium",
                              nav: "absolute inset-x-0 top-0 flex items-center justify-between px-0.5",
                              button_previous: "size-7 flex items-center justify-center rounded-full hover:bg-accent text-muted-foreground transition-colors",
                              button_next: "size-7 flex items-center justify-center rounded-full hover:bg-accent text-muted-foreground transition-colors",
                              chevron: "size-3.5",
                              table: "w-full border-collapse mt-2",
                              weekdays: "flex",
                              weekday: "size-9 flex items-center justify-center text-xs text-muted-foreground font-normal",
                              week: "flex",
                              day: "flex items-center justify-center p-0",
                              day_button: "size-9 rounded-full text-sm hover:bg-accent transition-colors",
                              selected: "bg-primary text-primary-foreground hover:bg-primary",
                              today: "border border-primary",
                              outside: "text-muted-foreground/30",
                              disabled: "text-muted-foreground/20",
                            }}
                          />
                        </div>
                      </PopoverContent>
                    </Popover>
                    <M3TimePicker value={dueTime} onChange={setDueTime} />
                  </div>
                </div>
                <div>
                  <label className="text-xs font-medium text-muted-foreground mb-1.5 block">{t('taskDetail.estimatedMinutesLabel')}</label>
                  <input type="number" min={0} value={estimatedMinutes ?? ''} onChange={(e) => setEstimatedMinutes(e.target.value ? parseInt(e.target.value) : null)} placeholder={t('taskDetail.minutes')} className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm text-foreground outline-none placeholder:text-muted-foreground/40 focus-visible:ring-2 focus-visible:ring-ring" />
                </div>
              </div>
              <div className="flex items-center gap-2 pt-1">
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

        {task && showProperties && (
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
