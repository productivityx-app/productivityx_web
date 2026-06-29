import { useState, useRef, useEffect } from 'react';
import { Plus, Loader2 } from 'lucide-react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { tasksApi } from '@/api/tasks';
import { useTranslation } from 'react-i18next';
import { cn } from '@/lib/utils';
import { TaskStatus } from '@/types';

interface Props {
  defaultStatus?: TaskStatus;
  className?: string;
}

export default function TaskQuickAdd({ defaultStatus = 'TODO', className }: Props) {
  const { t } = useTranslation();
  const qc = useQueryClient();
  const [title, setTitle] = useState('');
  const [expanded, setExpanded] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (expanded && inputRef.current) inputRef.current.focus();
  }, [expanded]);

  const mutation = useMutation({
    mutationFn: (t: string) => tasksApi.create({ title: t, status: defaultStatus }),
    onSuccess: () => {
      setTitle('');
      qc.invalidateQueries({ queryKey: ['tasks'] });
      toast.success(t('taskDetail.createdSuccess'));
    },
  });

  const handleSubmit = () => {
    const trimmed = title.trim();
    if (!trimmed || mutation.isPending) return;
    mutation.mutate(trimmed);
  };

  return (
    <div className={cn('relative', className)}>
      {!expanded ? (
        <button
          onClick={() => setExpanded(true)}
          className="w-full flex items-center gap-2 px-3 py-2 text-sm text-muted-foreground hover:text-foreground hover:bg-accent rounded-lg transition-colors focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
        >
          <Plus size={14} />
          {t('tasks.addTask')}
        </button>
      ) : (
        <div className="flex items-center gap-2 p-2 bg-card border border-border rounded-xl">
          <input
            ref={inputRef}
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') handleSubmit(); if (e.key === 'Escape') setExpanded(false); }}
            onBlur={() => { if (!title.trim()) setExpanded(false); }}
            placeholder={t('taskDetail.titlePlaceholder')}
            className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground/40 outline-none"
          />
          <button
            onClick={handleSubmit}
            disabled={!title.trim() || mutation.isPending}
            className="p-1.5 rounded-lg bg-primary text-primary-foreground disabled:opacity-40 hover:bg-primary/90 transition-colors"
          >
            {mutation.isPending ? <Loader2 size={14} className="animate-spin" /> : <Plus size={14} />}
          </button>
        </div>
      )}
    </div>
  );
}
