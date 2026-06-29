import { useState } from 'react';
import { Check, Plus, Loader2, GripVertical, Trash2 } from 'lucide-react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import { DndContext, closestCenter, PointerSensor, useSensor, useSensors, DragEndEvent } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { tasksApi } from '@/api/tasks';
import { useTranslation } from 'react-i18next';
import { cn } from '@/lib/utils';
import { Task } from '@/types';

interface Props {
  taskId: string;
  subtasks: Task[];
  onRefresh: () => void;
}

function SortableSubtask({ subtask, taskId, onRefresh }: { subtask: Task; taskId: string; onRefresh: () => void }) {
  const { t } = useTranslation();
  const qc = useQueryClient();
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: subtask.id });

  const toggleMutation = useMutation({
    mutationFn: () => tasksApi.updateStatus(subtask.id, subtask.status === 'DONE' ? 'TODO' : 'DONE'),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['task', taskId] }); onRefresh(); },
  });

  const deleteMutation = useMutation({
    mutationFn: () => tasksApi.softDelete(subtask.id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['task', taskId] }); onRefresh(); toast.success(t('taskDetail.subtaskDeleted')); },
  });

  return (
    <div
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      className="flex items-center gap-2 px-3 py-2 bg-background border border-border rounded-lg group hover:border-primary/30 transition-colors"
    >
      <div {...attributes} {...listeners} className="cursor-grab text-muted-foreground/30 hover:text-muted-foreground">
        <GripVertical size={12} />
      </div>
      <button
        onClick={() => toggleMutation.mutate()}
        className={cn(
          'w-4 h-4 rounded border-2 flex items-center justify-center flex-shrink-0 transition-all',
          subtask.status === 'DONE' ? 'bg-green-500 border-green-500' : 'border-muted-foreground/30 hover:border-green-400',
        )}
      >
        {subtask.status === 'DONE' && <Check size={8} className="text-white" />}
      </button>
      <span className={cn('flex-1 text-sm truncate', subtask.status === 'DONE' && 'line-through text-muted-foreground')}>
        {subtask.title}
      </span>
      <button
        onClick={() => deleteMutation.mutate()}
        className="p-1 rounded text-muted-foreground/0 group-hover:text-muted-foreground hover:text-destructive transition-colors"
      >
        <Trash2 size={10} />
      </button>
    </div>
  );
}

export default function SubtaskList({ taskId, subtasks, onRefresh }: Props) {
  const { t } = useTranslation();
  const qc = useQueryClient();
  const [newTitle, setNewTitle] = useState('');
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 4 } }));

  const completed = subtasks.filter((s) => s.status === 'DONE').length;
  const total = subtasks.length;

  const addMutation = useMutation({
    mutationFn: (title: string) => tasksApi.create({ title, parentTaskId: taskId }),
    onSuccess: () => { setNewTitle(''); qc.invalidateQueries({ queryKey: ['task', taskId] }); onRefresh(); toast.success(t('taskDetail.subtaskAdded')); },
  });

  const reorderMutation = useMutation({
    mutationFn: (items: { id: string; position: number }[]) => tasksApi.reorder(items),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['task', taskId] }),
  });

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const ids = subtasks.map((s) => s.id);
    const oldIndex = ids.indexOf(active.id as string);
    const newIndex = ids.indexOf(over.id as string);
    if (oldIndex === -1 || newIndex === -1) return;
    const items = ids.map((id, i) => ({ id, position: i === oldIndex ? newIndex : i === newIndex ? oldIndex : i }));
    reorderMutation.mutate(items.map((item, i) => ({ ...item, position: i })));
  };

  return (
    <div className="space-y-2">
      {total > 0 && (
        <div className="flex items-center gap-2 mb-3">
          <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
            <div
              className="h-full bg-primary rounded-full transition-all"
              style={{ width: `${Math.round((completed / total) * 100)}%` }}
            />
          </div>
          <span className="text-xs text-muted-foreground tabular-nums">{completed}/{total}</span>
        </div>
      )}

      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={subtasks.map((s) => s.id)} strategy={verticalListSortingStrategy}>
          <AnimatePresence>
            {subtasks.map((subtask) => (
              <SortableSubtask key={subtask.id} subtask={subtask} taskId={taskId} onRefresh={onRefresh} />
            ))}
          </AnimatePresence>
        </SortableContext>
      </DndContext>

      <div className="flex items-center gap-2 pt-1">
        <input
          value={newTitle}
          onChange={(e) => setNewTitle(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter' && newTitle.trim()) addMutation.mutate(newTitle.trim()); }}
          placeholder={t('taskDetail.addSubtaskPlaceholder')}
          className="flex-1 px-3 py-1.5 bg-transparent text-sm text-foreground placeholder:text-muted-foreground/40 outline-none"
        />
        <button
          onClick={() => { if (newTitle.trim()) addMutation.mutate(newTitle.trim()); }}
          disabled={!newTitle.trim() || addMutation.isPending}
          className="p-1.5 rounded-lg bg-primary text-primary-foreground disabled:opacity-40 hover:bg-primary/90 transition-colors"
        >
          {addMutation.isPending ? <Loader2 size={12} className="animate-spin" /> : <Plus size={12} />}
        </button>
      </div>
    </div>
  );
}
