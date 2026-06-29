import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, RotateCcw, Trash2, CalendarDays, Archive } from 'lucide-react';
import EmptyState from '@/components/common/EmptyState';
import { toast } from 'sonner';
import { formatDistanceToNow, format, parseISO } from 'date-fns';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { getDateFnsLocale } from '@/i18n/dateLocales';
import { eventsApi } from '@/api/events';
import { cn } from '@/lib/utils';
import { useState } from 'react';
import ConfirmDialog from '@/components/common/ConfirmDialog';

export default function TrashCalendarPage() {
  const navigate = useNavigate();
  const qc = useQueryClient();
  const { t } = useTranslation();
  const locale = getDateFnsLocale();
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [restoring, setRestoring] = useState<string | null>(null);

  const { data } = useQuery({ queryKey: ['events-trash'], queryFn: () => eventsApi.listTrash() });

  const restoreMutation = useMutation({
    mutationFn: (id: string) => eventsApi.restore(id),
    onSuccess: (_data, id) => {
      qc.invalidateQueries({ queryKey: ['events-trash'] });
      toast.success(t('trash.eventRestored'));
      setRestoring(id);
      setTimeout(() => setRestoring(null), 1500);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => eventsApi.hardDelete(id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['events-trash'] }); toast.success(t('trash.eventPermanentlyDeleted')); setDeleteId(null); },
  });

  const events = data?.content || [];

  return (
    <div className="p-4 sm:p-6 max-w-3xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <button
          onClick={() => navigate('/calendar')}
          className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent transition-colors focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
        >
          <ArrowLeft size={16} />
        </button>
        <h1 className="text-lg font-bold text-foreground">{t('trashPages.calendarTrash')}</h1>
        {events.length > 0 && <span className="text-xs text-muted-foreground tabular-nums">({events.length})</span>}
      </div>

      {events.length === 0 ? (
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
            {events.map((ev) => (
              <motion.div
                key={ev.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                className={cn(
                  'bg-card border rounded-xl p-4 flex items-center gap-4 transition-colors',
                  restoring === ev.id ? 'border-primary/30 bg-primary/5' : 'border-border hover:border-primary/30 hover:bg-accent/50',
                )}
              >
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary/10 to-violet-500/10 flex items-center justify-center flex-shrink-0">
                  <CalendarDays size={14} className="text-primary/60" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">{ev.title}</p>
                  <p className="text-xs text-muted-foreground">
                    {format(parseISO(ev.startAt), 'MMM d, yyyy', { locale })} · {t('common.deleted')} {ev.deletedAt ? formatDistanceToNow(new Date(ev.deletedAt), { addSuffix: true, locale }) : t('common.recently')}
                  </p>
                </div>
                <motion.button
                  whileTap={{ scale: 0.9 }}
                  onClick={() => restoreMutation.mutate(ev.id)}
                  className="p-2 rounded-lg text-muted-foreground hover:text-primary hover:bg-accent transition-colors focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
                >
                  <RotateCcw size={14} />
                </motion.button>
                <button
                  onClick={() => setDeleteId(ev.id)}
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
        title={t('trash.permanentlyDeleteEvent')}
        description={t('trash.cannotBeUndone')}
        confirmText={t('common.deleteForever')}
        onConfirm={() => deleteId && deleteMutation.mutate(deleteId)}
        destructive
      />
    </div>
  );
}
