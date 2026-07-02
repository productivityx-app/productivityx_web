import { useState, useMemo, useCallback, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Trash2, LayoutGrid, AlignLeft, CalendarDays, Plus } from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import { stagger } from '@/lib/animations';
import { DndContext, closestCenter, PointerSensor, useSensor, useSensors, DragEndEvent, DragOverlay } from '@dnd-kit/core';
import { format, isToday, isPast, parseISO, startOfMonth, endOfMonth, eachDayOfInterval, getDay, startOfWeek, endOfWeek, isSameDay, isSameMonth } from 'date-fns';
import { tasksApi } from '@/api/tasks';
import { Task, TaskStatus, TaskPriority } from '@/types';
import { cn } from '@/lib/utils';
import { useTranslation } from 'react-i18next';
import { Skeleton } from '@/components/ui/skeleton';
import TaskEmptyState from '@/components/tasks/TaskEmptyState';
import ErrorState from '@/components/common/ErrorState';
import TaskListItem from '@/components/tasks/TaskListItem';
import TaskKanbanColumn from '@/components/tasks/TaskKanbanColumn';
import TaskFilters, { FilterKey, SortKey, GroupKey } from '@/components/tasks/TaskFilters';
import TaskQuickAdd from '@/components/tasks/TaskQuickAdd';
import BulkActionsBar from '@/components/tasks/BulkActionsBar';
import KanbanCard from '@/components/tasks/TaskKanbanCard';

function useDebounce<T>(value: T, delay: number): [T, (v: T) => void] {
  const [debouncedValue, setDebouncedValue] = useState(value);
  const [immediateValue, setImmediateValue] = useState(value);
  const timerRef = useRef<ReturnType<typeof setTimeout>>();

  const setValue = useCallback((v: T) => {
    setImmediateValue(v);
    clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => setDebouncedValue(v), delay);
  }, [delay]);

  useEffect(() => {
    return () => clearTimeout(timerRef.current);
  }, []);

  return [debouncedValue, setValue];
}

type ViewMode = 'list' | 'kanban' | 'calendar';

const COLUMNS: { id: TaskStatus; color: string }[] = [
  { id: 'TODO', color: 'border-t-blue-500' },
  { id: 'IN_PROGRESS', color: 'border-t-amber-500' },
  { id: 'ON_HOLD', color: 'border-t-orange-500' },
  { id: 'DONE', color: 'border-t-green-500' },
  { id: 'CANCELLED', color: 'border-t-gray-500' },
];

const STATUS_LABELS: Record<TaskStatus, string> = {
  TODO: 'To Do',
  IN_PROGRESS: 'In Progress',
  ON_HOLD: 'On Hold',
  DONE: 'Done',
  CANCELLED: 'Cancelled',
};

export default function TasksPage() {
  useEffect(() => { document.title = 'Tasks — ProductivityX'; }, []);
  const navigate = useNavigate();
  const qc = useQueryClient();
  const { t } = useTranslation();
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [search, setSearch] = useState('');
  const [debouncedSearch, setSearchDebounced] = useDebounce('', 300);
  const [activeFilters, setActiveFilters] = useState<FilterKey[]>([]);
  const [sort, setSort] = useState<SortKey>('createdAt');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');
  const [group, setGroup] = useState<GroupKey>('none');
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [collapsedColumns, setCollapsedColumns] = useState<Set<string>>(new Set());
  const [activeDragId, setActiveDragId] = useState<string | null>(null);
  const [calendarMonth, setCalendarMonth] = useState(new Date());

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['tasks'],
    queryFn: () => tasksApi.list({ size: 200 }),
  });

  const updateStatusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) => tasksApi.updateStatus(id, status),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['tasks'] }),
  });

  const bulkDeleteMutation = useMutation({
    mutationFn: (ids: string[]) => Promise.all(ids.map((id) => tasksApi.softDelete(id))),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['tasks'] }); setSelected(new Set()); toast.success(t('tasks.bulkDeleted')); },
  });

  const bulkStatusMutation = useMutation({
    mutationFn: ({ ids, status }: { ids: string[]; status: string }) => Promise.all(ids.map((id) => tasksApi.updateStatus(id, status))),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['tasks'] }); setSelected(new Set()); },
  });

  const bulkPriorityMutation = useMutation({
    mutationFn: ({ ids, priority }: { ids: string[]; priority: string }) => Promise.all(ids.map((id) => tasksApi.update(id, { priority }))),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['tasks'] }); setSelected(new Set()); },
  });

  const tasks: Task[] = data?.content || [];

  const filteredTasks = useMemo(() => {
    let filtered = [...tasks];

    if (debouncedSearch) {
      const q = debouncedSearch.toLowerCase();
      filtered = filtered.filter((t) => t.title.toLowerCase().includes(q) || (t.description?.toLowerCase() || '').includes(q));
    }

    for (const f of activeFilters) {
      switch (f) {
        case 'today':
          filtered = filtered.filter((t) => t.dueDate && isToday(parseISO(t.dueDate)));
          break;
        case 'overdue':
          filtered = filtered.filter((t) => t.dueDate && !['DONE', 'CANCELLED'].includes(t.status) && isPast(parseISO(t.dueDate)));
          break;
        case 'highPriority':
          filtered = filtered.filter((t) => t.priority === 'HIGH' || t.priority === 'URGENT');
          break;
        case 'noDueDate':
          filtered = filtered.filter((t) => !t.dueDate);
          break;
      }
    }

    filtered.sort((a, b) => {
      let cmp = 0;
      switch (sort) {
        case 'dueDate':
          cmp = (a.dueDate || '').localeCompare(b.dueDate || '');
          break;
        case 'priority': {
          const order: Record<string, number> = { URGENT: 0, HIGH: 1, MEDIUM: 2, LOW: 3 };
          cmp = (order[a.priority] ?? 99) - (order[b.priority] ?? 99);
          break;
        }
        case 'createdAt':
          cmp = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
          break;
        case 'title':
          cmp = a.title.localeCompare(b.title);
          break;
      }
      return sortDir === 'desc' ? -cmp : cmp;
    });

    return filtered;
  }, [tasks, debouncedSearch, activeFilters, sort, sortDir]);

  const groupedTasks = useMemo(() => {
    if (group === 'none') return { '': filteredTasks };
    if (group === 'priority') {
      const groups: Record<string, Task[]> = {};
      for (const t of filteredTasks) {
        const key = t.priority;
        if (!groups[key]) groups[key] = [];
        groups[key].push(t);
      }
      return groups;
    }
    if (group === 'dueDate') {
      const groups: Record<string, Task[]> = { 'No Date': [] };
      for (const t of filteredTasks) {
        if (!t.dueDate) { groups['No Date'].push(t); continue; }
        const d = format(parseISO(t.dueDate), 'MMM d, yyyy');
        if (!groups[d]) groups[d] = [];
        groups[d].push(t);
      }
      return groups;
    }
    if (group === 'status') {
      const groups: Record<string, Task[]> = {};
      for (const t of filteredTasks) {
        const key = STATUS_LABELS[t.status] || t.status;
        if (!groups[key]) groups[key] = [];
        groups[key].push(t);
      }
      return groups;
    }
    return { '': filteredTasks };
  }, [filteredTasks, group]);

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 8 } }));

  const handleDragEnd = (event: DragEndEvent) => {
    setActiveDragId(null);
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const task = tasks.find((t) => t.id === active.id);
    if (!task) return;
    const overIdStr = over.id as string;
    const overTask = tasks.find((t) => t.id === overIdStr);
    const targetStatus = overTask ? overTask.status : (overIdStr as TaskStatus);
    if (task.status !== targetStatus && COLUMNS.some((c) => c.id === targetStatus)) {
      updateStatusMutation.mutate({ id: task.id, status: targetStatus });
    }
  };

  const toggleFilter = useCallback((key: FilterKey) => {
    setActiveFilters((prev) => prev.includes(key) ? prev.filter((f) => f !== key) : [...prev, key]);
  }, []);

  const toggleSelect = useCallback((id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  }, []);

  const calendarDays = useMemo(() => {
    const monthStart = startOfMonth(calendarMonth);
    const monthEnd = endOfMonth(calendarMonth);
    const calStart = startOfWeek(monthStart);
    const calEnd = endOfWeek(monthEnd);
    return eachDayOfInterval({ start: calStart, end: calEnd });
  }, [calendarMonth]);

  const tasksByDate = useMemo(() => {
    const map: Record<string, Task[]> = {};
    for (const t of tasks) {
      if (!t.dueDate) continue;
      const key = format(parseISO(t.dueDate), 'yyyy-MM-dd');
      if (!map[key]) map[key] = [];
      map[key].push(t);
    }
    return map;
  }, [tasks]);

  return (
    <div className="p-4 sm:p-6 h-full flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-lg sm:text-xl font-bold text-foreground">{t('tasks.title')}</h1>
        <div className="flex items-center gap-2">
          <button
            onClick={() => navigate('/tasks/new')}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-primary text-primary-foreground rounded-lg text-xs font-medium hover:bg-primary/90 transition-colors"
          >
            <Plus size={14} />
            <span className="hidden sm:inline">{t('tasks.addTask')}</span>
          </button>
          <button onClick={() => navigate('/tasks/trash')} className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent transition-colors">
            <Trash2 size={15} />
          </button>
          <div className="flex items-center gap-0.5 bg-card border border-border rounded-lg p-0.5">
            {([['list', AlignLeft], ['kanban', LayoutGrid], ['calendar', CalendarDays]] as [ViewMode, typeof AlignLeft][]).map(([mode, Icon]) => (
              <button
                key={mode}
                onClick={() => setViewMode(mode)}
                className={cn(
                  'px-2.5 py-1 rounded text-xs font-medium flex items-center gap-1 transition-all',
                  viewMode === mode ? 'bg-primary text-primary-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground',
                )}
              >
                <Icon size={12} />
                {t(mode === 'list' ? 'tasks.list' : mode === 'kanban' ? 'tasks.board' : 'tasks.calendar')}
              </button>
            ))}
          </div>
        </div>
      </div>

      {viewMode !== 'kanban' && (
        <div className="mb-4">
          <TaskFilters
            search={search} onSearchChange={(v) => { setSearch(v); setSearchDebounced(v); }}
            activeFilters={activeFilters} onToggleFilter={toggleFilter}
            sort={sort} onSortChange={setSort}
            sortDir={sortDir} onToggleSortDir={() => setSortDir((d) => d === 'asc' ? 'desc' : 'asc')}
            group={group} onGroupChange={setGroup}
          />
        </div>
      )}

      {isError && !isLoading ? (
        <ErrorState onRetry={refetch} />
      ) : viewMode === 'kanban' ? (
        isLoading ? (
          <div className="flex gap-4 flex-1 overflow-x-auto pb-4">
            {COLUMNS.map((col) => (
              <div key={col.id} className="flex-shrink-0 w-72 bg-card border border-border rounded-xl">
                <div className="px-4 py-3 border-b border-border"><Skeleton className="h-5 w-24" /></div>
                <div className="p-3 space-y-2"><Skeleton className="h-24 rounded-xl" /><Skeleton className="h-24 rounded-xl" /></div>
              </div>
            ))}
          </div>
        ) : (
          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragStart={(e) => setActiveDragId(e.active.id as string)} onDragEnd={handleDragEnd}>
            <div className="flex gap-4 overflow-x-auto pb-4 flex-1">
              {COLUMNS.map((col) => (
                <TaskKanbanColumn
                  key={col.id}
                  id={col.id}
                  label={t(`statuses.${col.id.toLowerCase()}` as any)}
                  count={tasks.filter((t) => t.status === col.id).length}
                  color={col.color}
                  tasks={tasks.filter((t) => t.status === col.id)}
                  collapsed={collapsedColumns.has(col.id)}
                  onToggleCollapse={() => setCollapsedColumns((prev) => { const n = new Set(prev); n.has(col.id) ? n.delete(col.id) : n.add(col.id); return n; })}
                />
              ))}
            </div>
            <DragOverlay>
              {activeDragId ? <KanbanCard task={tasks.find((t) => t.id === activeDragId)!} /> : null}
            </DragOverlay>
          </DndContext>
        )
      ) : viewMode === 'calendar' ? (
        <div className="flex-1 overflow-y-auto">
          <div className="flex items-center justify-between mb-4">
            <button onClick={() => setCalendarMonth(new Date(calendarMonth.getFullYear(), calendarMonth.getMonth() - 1, 1))} className="px-3 py-1 text-sm text-muted-foreground hover:text-foreground hover:bg-accent rounded-lg">&larr;</button>
            <span className="text-sm font-semibold text-foreground">{format(calendarMonth, 'MMMM yyyy')}</span>
            <button onClick={() => setCalendarMonth(new Date(calendarMonth.getFullYear(), calendarMonth.getMonth() + 1, 1))} className="px-3 py-1 text-sm text-muted-foreground hover:text-foreground hover:bg-accent rounded-lg">&rarr;</button>
          </div>
          <div className="grid grid-cols-7 gap-px bg-border rounded-xl overflow-hidden">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((d) => (
              <div key={d} className="bg-card px-2 py-1.5 text-xs font-medium text-muted-foreground text-center">{d}</div>
            ))}
            {calendarDays.map((day) => {
              const key = format(day, 'yyyy-MM-dd');
              const dayTasks = tasksByDate[key] || [];
              return (
                <div
                  key={key}
                  className={cn(
                    'bg-card min-h-[80px] p-1.5 transition-colors',
                    !isSameMonth(day, calendarMonth) && 'opacity-30',
                    isToday(day) && 'bg-primary/[0.04]',
                  )}
                >
                  <span className={cn('text-xs font-medium', isToday(day) ? 'text-primary' : 'text-muted-foreground')}>
                    {format(day, 'd')}
                  </span>
                  <div className="mt-1 space-y-0.5">
                    {dayTasks.slice(0, 3).map((t) => (
                      <button
                        key={t.id}
                        onClick={() => navigate(`/tasks/${t.id}`)}
                        className="w-full text-left text-xs truncate px-1 py-0.5 rounded bg-primary/10 text-primary/80 hover:bg-primary/20 transition-colors"
                      >
                        {t.title}
                      </button>
                    ))}
                    {dayTasks.length > 3 && (
                      <span className="text-xs text-muted-foreground">+{dayTasks.length - 3} more</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        <div className="flex-1 overflow-y-auto">
          {isLoading ? (
            <div className="space-y-2">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-14 bg-muted rounded-xl animate-pulse" />
              ))}
            </div>
          ) : filteredTasks.length === 0 ? (
            <TaskEmptyState
              type={search || activeFilters.length > 0 ? 'filtered' : 'empty'}
              onAddTask={() => navigate('/tasks/new')}
            />
          ) : (
            <div className="space-y-2">
              <TaskQuickAdd className="mb-3" />
              {Object.entries(groupedTasks).map(([groupKey, groupTasks]) => (
                <motion.div
                  key={groupKey}
                  variants={stagger.container}
                  initial="initial"
                  animate="animate"
                >
                  {groupKey && (
                    <div className="flex items-center gap-2 px-1 py-2">
                      <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">{groupKey}</span>
                      <span className="text-xs text-muted-foreground bg-muted px-1.5 py-0.5 rounded-full">{groupTasks.length}</span>
                    </div>
                  )}
                  <div className="space-y-1.5">
                    {groupTasks.map((task) => (
                      <motion.div key={task.id} variants={stagger.itemFade}>
                        <TaskListItem
                          task={task}
                          selected={selected.has(task.id)}
                          onToggleSelect={toggleSelect}
                          onClick={() => navigate(`/tasks/${task.id}`)}
                        />
                      </motion.div>
                    ))}
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      )}

      {selected.size > 0 && (
        <BulkActionsBar
          count={selected.size}
          onClear={() => setSelected(new Set())}
          onBulkComplete={() => {
            const ids = Array.from(selected);
            Promise.all(ids.map((id) => tasksApi.updateStatus(id, 'DONE')))
              .then(() => { qc.invalidateQueries({ queryKey: ['tasks'] }); setSelected(new Set()); });
          }}
          onBulkDelete={() => bulkDeleteMutation.mutate(Array.from(selected))}
          onBulkStatus={(status) => bulkStatusMutation.mutate({ ids: Array.from(selected), status })}
          onBulkPriority={(priority) => bulkPriorityMutation.mutate({ ids: Array.from(selected), priority })}
        />
      )}
    </div>
  );
}
