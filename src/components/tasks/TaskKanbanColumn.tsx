import { useState } from 'react';
import { Plus, ChevronDown, ChevronUp } from 'lucide-react';
import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { useTranslation } from 'react-i18next';
import { Task, TaskStatus } from '@/types';
import KanbanCard from './TaskKanbanCard';
import TaskQuickAdd from './TaskQuickAdd';

interface Props {
  id: TaskStatus;
  label: string;
  count: number;
  color: string;
  tasks: Task[];
  collapsed?: boolean;
  onToggleCollapse?: () => void;
}

function SortableKanbanCard({ task }: { task: Task }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: task.id });
  const navigate = useNavigate();
  return (
    <div ref={setNodeRef} style={{ transform: CSS.Transform.toString(transform), transition }} {...attributes} {...listeners}>
      <KanbanCard
        task={task}
        onClick={() => navigate(`/tasks/${task.id}`)}
        style={{ opacity: isDragging ? 0.4 : 1 }}
      />
    </div>
  );
}

export default function TaskKanbanColumn({ id, label, count, color, tasks, collapsed, onToggleCollapse }: Props) {
  const { t } = useTranslation();
  const { setNodeRef, isOver } = useDroppable({ id });

  return (
    <div
      className={cn(
        'flex-shrink-0 w-72 bg-card border border-border rounded-xl border-t-[3px] flex flex-col transition-colors',
        color,
        isOver && 'ring-2 ring-primary/30',
      )}
    >
      <div className="px-4 py-3 flex items-center justify-between border-b border-border">
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold text-foreground">{label}</span>
          <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded-full tabular-nums">{count}</span>
        </div>
        <button
          onClick={onToggleCollapse}
          className="p-1 rounded text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
        >
          {collapsed ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
        </button>
      </div>

      {!collapsed && (
        <div ref={setNodeRef} className="flex-1 p-3 space-y-2 overflow-y-auto min-h-[120px]">
          <SortableContext items={tasks.map((t) => t.id)} strategy={verticalListSortingStrategy}>
            {tasks.map((task) => (
              <SortableKanbanCard key={task.id} task={task} />
            ))}
          </SortableContext>
          {tasks.length === 0 && (
            <div className="flex items-center justify-center h-20 text-xs text-muted-foreground">
              {t('tasks.noTasksInColumn')}
            </div>
          )}
        </div>
      )}

      <div className="p-3 border-t border-border">
        <TaskQuickAdd defaultStatus={id} />
      </div>
    </div>
  );
}
