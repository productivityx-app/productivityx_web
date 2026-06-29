import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, RotateCcw, Trash2, CheckSquare, Archive } from 'lucide-react';
import EmptyState from '@/components/common/EmptyState';
import { toast } from 'sonner';
import { formatDistanceToNow } from 'date-fns';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { getDateFnsLocale } from '@/i18n/dateLocales';
import { tasksApi } from '@/api/tasks';
import { cn } from '@/lib/utils';
import { useState } from 'react';
import ConfirmDialog from '@/components/common/ConfirmDialog';

export default function TrashTasksPage() {
  const navigate = useNavigate();
  const qc = useQueryClient();
  const { t } = useTranslation();
  const locale = getDateFnsLocale();
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [restoring, setRestoring] = useState<string | null>(null);

  const { data } = useQuery({ queryKey: ['tasks-trash'], queryFn: () => tasksApi.listTrash() });

  const restoreMutation = useMutation({
    mutationFn: (id: string) => tasksApi.restore(id),
    onSuccess: (_data, id) => {
      qc.invalidateQueries({ queryKey: ['tasks-trash'] });
      toast.success(t('trash.taskRestored'));
      setRestoring(id);
      setTimeout(() => setRestoring(null), 1500);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => tasksApi.hardDelete(id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['tasks-trash'] }); toast.success(t('trash.taskPermanentlyDeleted')); setDeleteId(null); },
  });

  const tasks = data?.content || [];

  return (
    <div className="p-4 sm:p-6 max-w-3xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <button
          onClick={() => navigate('/tasks')}
          className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent transition-colors focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
        >
          <ArrowLeft size={16} />
        </button>
        <h1 className="text-lg font-bold text-foreground">{t('trashPages.tasksTrash')}</h1>
        {tasks.length > 0 && (
          <span className="text-xs text-muted-foreground tabular-nums">({tasks.length})</span>
        )}
      </div>

      {tasks.length === 0 ? (
        <EmptyState
          icon={Archive}
          title={t('trash.title')}
          description={t('trash.trashEmptyDesc')}
          gradient="trash"
          size="sm"
        />
      ) : (
        <div className="space-y-2">
          <AnimatePresence>
            {tasks.map((task) => (
              <motion.div
                key={task.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                className={cn(
                  'bg-card border rounded-xl p-4 flex items-center gap-4 transition-colors',
                  restoring === task.id ? 'border-primary/30 bg-primary/5' : 'border-border hover:border-primary/30 hover:bg-accent/50',
                )}
              >
                <CheckSquare size={16} className="text-muted-foreground flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">{task.title}</p>
                  <p className="text-xs text-muted-foreground">
                    {t('common.deleted')} {task.deletedAt ? formatDistanceToNow(new Date(task.deletedAt), { addSuffix: true, locale }) : t('common.recently')}
                  </p>
                </div>
                <motion.button
                  whileTap={{ scale: 0.9 }}
                  onClick={() => restoreMutation.mutate(task.id)}
                  className="p-2 rounded-lg text-muted-foreground hover:text-primary hover:bg-accent transition-colors focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
                >
                  <RotateCcw size={14} />
                </motion.button>
                <button
                  onClick={() => setDeleteId(task.id)}
                  className="p-2 rounded-lg text-muted-foreground hover:text-destructive hover:bg-accent transition-colors focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
                >
                  <Trash2 size={14} />
                </button>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      <ConfirmDialog
        open={!!deleteId}
        onOpenChange={() => setDeleteId(null)}
        title={t('trash.permanentlyDeleteTask')}
        description={t('trash.cannotBeUndone')}
        confirmText={t('common.deleteForever')}
        onConfirm={() => deleteId && deleteMutation.mutate(deleteId)}
        destructive
      />
    </div>
  );
}
