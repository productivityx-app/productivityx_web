import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ArrowLeft, Trash2, Loader2, MapPin } from 'lucide-react';
import { toast } from 'sonner';
import { format, parseISO } from 'date-fns';
import { eventsApi } from '@/api/events';
import { useTranslation } from 'react-i18next';
import { getDateFnsLocale } from '@/i18n/dateLocales';
import { useTimeFormat } from '@/hooks/use-time-format';
import ConfirmDialog from '@/components/common/ConfirmDialog';
import EventModal from '@/components/calendar/EventModal';

export default function EventDetailPage() {
  const { t } = useTranslation();
  const { formatTime, formatDateTime } = useTimeFormat();
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);

  const { data: event, isLoading } = useQuery({
    queryKey: ['event', id],
    queryFn: () => eventsApi.get(id!),
  });

  const deleteMutation = useMutation({
    mutationFn: () => eventsApi.softDelete(id!),
    onSuccess: () => { navigate('/calendar'); toast.success(t('eventDetail.eventDeleted')); qc.invalidateQueries({ queryKey: ['events'] }); },
  });

  if (isLoading) return <div className="flex items-center justify-center h-full"><Loader2 className="animate-spin text-primary" /></div>;
  if (!event) return <div className="p-6 text-muted-foreground text-sm">{t('eventDetail.notFound')}</div>;

  const start = parseISO(event.startAt);
  const end = parseISO(event.endAt);

  return (
    <div className="p-4 sm:p-6 max-w-2xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => navigate('/calendar')} className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent transition-colors">
          <ArrowLeft size={16} />
        </button>
        <h1 className="text-lg font-bold text-foreground flex-1">{t('eventDetail.title')}</h1>
        <button onClick={() => setEditOpen(true)} className="px-3 py-1.5 text-xs font-medium bg-card border border-border rounded-lg text-foreground hover:bg-accent transition-colors">
          {t('common.edit')}
        </button>
        <button onClick={() => setDeleteOpen(true)} className="p-1.5 rounded-lg text-muted-foreground hover:text-destructive hover:bg-accent transition-colors">
          <Trash2 size={15} />
        </button>
      </div>

      <div className="bg-card border border-border rounded-xl p-6 space-y-5">
        <div className="flex items-start gap-3">
          <div className="w-4 h-4 rounded-full mt-0.5 flex-shrink-0" style={{ backgroundColor: event.color || '#6366F1' }} />
          <div>
            <h2 className="text-xl font-semibold text-foreground">{event.title}</h2>
            {event.description && <p className="text-sm text-muted-foreground mt-1">{event.description}</p>}
          </div>
        </div>

        <div className="space-y-3 text-sm">
          <div className="flex items-start gap-2">
            <span className="text-muted-foreground font-medium w-20 flex-shrink-0">{t('eventDetail.when')}</span>
            <div className="text-foreground">
              {event.allDay ? (
                <span>{format(start, 'EEEE, MMMM d, yyyy', { locale: getDateFnsLocale() })} · {t('eventDetail.allDay')}</span>
              ) : (
                <span>
                  {format(start, 'EEEE, MMMM d, yyyy', { locale: getDateFnsLocale() })}
                  <br />
                  {formatTime(start)} \u2013 {formatTime(end)}
                </span>
              )}
            </div>
          </div>

          {event.location && (
            <div className="flex items-start gap-2">
              <span className="text-muted-foreground font-medium w-20 flex-shrink-0">{t('eventDetail.location')}</span>
              <span className="text-foreground flex items-center gap-1"><MapPin size={12} />{event.location}</span>
            </div>
          )}

          {event.recurrenceRule && (
            <div className="flex items-start gap-2">
              <span className="text-muted-foreground font-medium w-20 flex-shrink-0">{t('eventDetail.repeats')}</span>
              <span className="text-foreground">{event.recurrenceRule}</span>
            </div>
          )}

          {event.reminderMinutes != null && event.reminderMinutes > 0 && (
            <div className="flex items-start gap-2">
              <span className="text-muted-foreground font-medium w-20 flex-shrink-0">{t('eventDetail.reminder')}</span>
              <span className="text-foreground">{t('eventDetail.reminderBefore', { minutes: event.reminderMinutes })}</span>
            </div>
          )}
        </div>

        <div className="text-xs text-muted-foreground pt-2 border-t border-border">
          {t('eventDetail.created')} {formatDateTime(parseISO(event.createdAt))}
        </div>
      </div>

      <EventModal open={editOpen} onClose={() => setEditOpen(false)} event={event} />

      <ConfirmDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        title={t('eventDetail.deleteConfirmTitle')}
        description={t('eventDetail.deleteConfirmDesc')}
        confirmText={t('eventDetail.deleteConfirmText')}
        onConfirm={() => deleteMutation.mutate()}
        destructive
      />
    </div>
  );
}
