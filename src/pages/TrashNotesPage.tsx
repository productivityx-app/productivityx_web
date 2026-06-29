import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, RotateCcw, Trash2, FileText, Trash as TrashIcon, Archive } from 'lucide-react';
import EmptyState from '@/components/common/EmptyState';
import { toast } from 'sonner';
import { formatDistanceToNow } from 'date-fns';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { cn } from '@/lib/utils';
import { getDateFnsLocale } from '@/i18n/dateLocales';
import { notesApi } from '@/api/notes';
import { useState } from 'react';
import ConfirmDialog from '@/components/common/ConfirmDialog';

export default function TrashNotesPage() {
  const navigate = useNavigate();
  const qc = useQueryClient();
  const { t } = useTranslation();
  const locale = getDateFnsLocale();
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [restoring, setRestoring] = useState<string | null>(null);

  const { data, isLoading } = useQuery({ queryKey: ['notes-trash'], queryFn: () => notesApi.listTrash() });

  const restoreMutation = useMutation({
    mutationFn: (id: string) => notesApi.restore(id),
    onSuccess: (_data, id) => {
      qc.invalidateQueries({ queryKey: ['notes-trash'] });
      toast.success(t('trash.noteRestored'));
      setRestoring(id);
      setTimeout(() => setRestoring(null), 1500);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => notesApi.hardDelete(id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['notes-trash'] }); toast.success(t('trash.notePermanentlyDeleted')); setDeleteId(null); },
  });

  const emptyTrashMutation = useMutation({
    mutationFn: () => {
      const ids = notes.map((n) => n.id);
      return Promise.all(ids.map((id) => notesApi.hardDelete(id)));
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['notes-trash'] }); toast.success(t('trash.trashEmptied')); },
  });

  const notes = data?.content || [];

  return (
    <div className="p-4 sm:p-6 max-w-3xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/notes')}
            className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent transition-colors focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
          >
            <ArrowLeft size={16} />
          </button>
          <h1 className="text-lg font-bold text-foreground">{t('trashPages.notesTrash')}</h1>
          {notes.length > 0 && (
            <span className="text-xs text-muted-foreground tabular-nums">({notes.length})</span>
          )}
        </div>
        {notes.length > 0 && (
          <button
            onClick={() => emptyTrashMutation.mutate()}
            className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg text-destructive hover:bg-destructive/10 transition-colors focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
          >
            <TrashIcon size={12} />
            {t('trash.emptyTrash')}
          </button>
        )}
      </div>

      {isLoading ? (
        <div className="space-y-2">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-16 bg-muted rounded-xl animate-pulse" />
          ))}
        </div>
      ) : notes.length === 0 ? (
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
            {notes.map((note) => (
              <motion.div
                key={note.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                className={cn(
                  'bg-card border rounded-xl p-4 flex items-center gap-4 transition-colors',
                  restoring === note.id ? 'border-primary/30 bg-primary/5' : 'border-border hover:border-primary/30 hover:bg-accent/50',
                )}
              >
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary/10 to-violet-500/10 flex items-center justify-center flex-shrink-0">
                  <FileText size={14} className="text-primary/60" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">
                    {note.title || t('notes.untitled')}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {t('common.deleted')} {note.deletedAt ? formatDistanceToNow(new Date(note.deletedAt), { addSuffix: true, locale }) : t('common.recently')}
                  </p>
                </div>
                <motion.button
                  whileTap={{ scale: 0.9 }}
                  onClick={() => restoreMutation.mutate(note.id)}
                  className="p-2 rounded-lg text-muted-foreground hover:text-primary hover:bg-accent transition-colors focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
                >
                  <RotateCcw size={14} />
                </motion.button>
                <button
                  onClick={() => setDeleteId(note.id)}
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
        title={t('trash.permanentlyDeleteNote')}
        description={t('trash.cannotBeUndone')}
        confirmText={t('common.deleteForever')}
        onConfirm={() => deleteId && deleteMutation.mutate(deleteId)}
        destructive
      />
    </div>
  );
}
