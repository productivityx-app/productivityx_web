import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { format } from 'date-fns';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';
import { eventsApi } from '@/api/events';
import { CalendarEvent } from '@/types';
import { useTranslation } from 'react-i18next';
import { cn } from '@/lib/utils';

const EVENT_COLORS = ['#6366F1', '#8B5CF6', '#EC4899', '#EF4444', '#F59E0B', '#10B981', '#06B6D4'];

const RECURRENCE_OPTIONS = [
  { value: '', labelKey: 'calendar.recurrenceNone' },
  { value: 'DAILY', labelKey: 'calendar.recurrenceDaily' },
  { value: 'WEEKLY', labelKey: 'calendar.recurrenceWeekly' },
  { value: 'MONTHLY', labelKey: 'calendar.recurrenceMonthly' },
  { value: 'YEARLY', labelKey: 'calendar.recurrenceYearly' },
];

const REMINDER_OPTIONS = [
  { value: 0, labelKey: 'calendar.reminderNone' },
  { value: 5, labelKey: 'calendar.reminder5min' },
  { value: 15, labelKey: 'calendar.reminder15min' },
  { value: 30, labelKey: 'calendar.reminder30min' },
  { value: 60, labelKey: 'calendar.reminder1hour' },
  { value: 1440, labelKey: 'calendar.reminder1day' },
];

interface Props {
  open: boolean;
  onClose: () => void;
  event?: CalendarEvent | null;
  defaultDate?: Date;
  defaultStartTime?: string;
  defaultEndTime?: string;
}

export default function EventModal({ open, onClose, event, defaultDate, defaultStartTime, defaultEndTime }: Props) {
  const { t } = useTranslation();
  const qc = useQueryClient();
  const isEdit = !!event;

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('');
  const [date, setDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [startTime, setStartTime] = useState('09:00');
  const [endTime, setEndTime] = useState('10:00');
  const [allDay, setAllDay] = useState(false);
  const [color, setColor] = useState(EVENT_COLORS[0]);
  const [recurrence, setRecurrence] = useState('');
  const [reminder, setReminder] = useState(0);

  useEffect(() => {
    if (event) {
      setTitle(event.title);
      setDescription(event.description || '');
      setLocation(event.location || '');
      setDate(format(new Date(event.startAt), 'yyyy-MM-dd'));
      setStartTime(format(new Date(event.startAt), 'HH:mm'));
      setEndTime(format(new Date(event.endAt), 'HH:mm'));
      setAllDay(event.allDay);
      setColor(event.color || EVENT_COLORS[0]);
      setRecurrence(event.recurrenceRule || '');
      setReminder(event.reminderMinutes ?? 0);
    } else {
      setTitle('');
      setDescription('');
      setLocation('');
      setDate(defaultDate ? format(defaultDate, 'yyyy-MM-dd') : format(new Date(), 'yyyy-MM-dd'));
      setStartTime(defaultStartTime || '09:00');
      setEndTime(defaultEndTime || '10:00');
      setAllDay(false);
      setColor(EVENT_COLORS[0]);
      setRecurrence('');
      setReminder(0);
    }
  }, [event, defaultDate, open, defaultStartTime, defaultEndTime]);

  const toInstant = (d: string, t: string) => new Date(`${d}T${t}:00`).toISOString();

  const createMutation = useMutation({
    mutationFn: () => eventsApi.create({
      title, description: description || null, location: location || null,
      color, allDay, recurrenceRule: recurrence || null, reminderMinutes: reminder || null,
      startAt: allDay ? toInstant(date, '00:00') : toInstant(date, startTime),
      endAt:   allDay ? toInstant(date, '23:59') : toInstant(date, endTime),
    } as Partial<CalendarEvent>),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['events'] }); toast.success(t('calendar.createSuccess')); onClose(); },
    onError: () => toast.error(t('calendar.failedToCreate')),
  });

  const updateMutation = useMutation({
    mutationFn: () => eventsApi.update(event!.id, {
      title, description: description || null, location: location || null,
      color, allDay, recurrenceRule: recurrence || null, reminderMinutes: reminder || null,
      startAt: allDay ? toInstant(date, '00:00') : toInstant(date, startTime),
      endAt:   allDay ? toInstant(date, '23:59') : toInstant(date, endTime),
    } as Partial<CalendarEvent>),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['events'] }); qc.invalidateQueries({ queryKey: ['event', event!.id] }); toast.success(t('calendar.updateSuccess')); onClose(); },
    onError: () => toast.error(t('calendar.failedToUpdate')),
  });

  const handleSubmit = () => {
    if (!title.trim()) { toast.error(t('calendar.titleRequired')); return; }
    if (isEdit) updateMutation.mutate(); else createMutation.mutate();
  };

  const isPending = createMutation.isPending || updateMutation.isPending;

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
            onClick={(e) => e.stopPropagation()}
            className="bg-card border border-border rounded-2xl w-full max-w-lg max-h-[85vh] overflow-y-auto shadow-2xl"
          >
            <div className="flex items-center justify-between px-5 py-4 border-b border-border">
              <h2 className="text-base font-semibold text-foreground">{isEdit ? t('calendar.editEvent') : t('calendar.newEvent')}</h2>
              <button onClick={onClose} className="p-1 rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent"><X size={16} /></button>
            </div>

            <div className="p-5 space-y-4">
              <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder={t('calendar.titlePlaceholder')}
                autoFocus
                className="w-full px-3 py-2 bg-background border border-border rounded-xl text-sm text-foreground placeholder:text-muted-foreground/40 outline-none focus:ring-2 focus:ring-ring"
                onKeyDown={(e) => e.key === 'Enter' && title.trim() && handleSubmit()}
              />

              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder={t('calendar.descriptionPlaceholder')}
                rows={3}
                className="w-full px-3 py-2 bg-background border border-border rounded-xl text-sm text-foreground placeholder:text-muted-foreground/40 outline-none focus:ring-2 focus:ring-ring resize-none"
              />

              <input
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder={t('calendar.locationPlaceholder')}
                className="w-full px-3 py-2 bg-background border border-border rounded-xl text-sm text-foreground placeholder:text-muted-foreground/40 outline-none focus:ring-2 focus:ring-ring"
              />

              <div className="flex items-center gap-2">
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="flex-1 px-3 py-2 bg-background border border-border rounded-xl text-sm text-foreground outline-none focus:ring-2 focus:ring-ring"
                />
                {!allDay && (
                  <>
                    <input type="time" value={startTime} onChange={(e) => setStartTime(e.target.value)} className="px-3 py-2 bg-background border border-border rounded-xl text-sm text-foreground outline-none focus:ring-2 focus:ring-ring" />
                    <span className="text-muted-foreground text-xs">–</span>
                    <input type="time" value={endTime} onChange={(e) => setEndTime(e.target.value)} className="px-3 py-2 bg-background border border-border rounded-xl text-sm text-foreground outline-none focus:ring-2 focus:ring-ring" />
                  </>
                )}
              </div>

              <label className="flex items-center gap-2 text-sm text-foreground cursor-pointer">
                <input type="checkbox" checked={allDay} onChange={(e) => setAllDay(e.target.checked)} className="rounded" />
                {t('calendar.allDayLabel')}
              </label>

              <div>
                <p className="text-xs font-medium text-muted-foreground mb-2">{t('calendar.colorLabel')}</p>
                <div className="flex gap-2">
                  {EVENT_COLORS.map((c) => (
                    <button key={c} onClick={() => setColor(c)} className={cn('w-7 h-7 rounded-full border-2 transition-all', color === c ? 'border-foreground scale-110' : 'border-transparent')} style={{ backgroundColor: c }} />
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <p className="text-xs font-medium text-muted-foreground mb-1.5">{t('calendar.recurrenceLabel')}</p>
                  <select value={recurrence} onChange={(e) => setRecurrence(e.target.value)} className="w-full px-3 py-2 bg-background border border-border rounded-xl text-sm text-foreground outline-none focus:ring-2 focus:ring-ring">
                    {RECURRENCE_OPTIONS.map((o) => (
                      <option key={o.value} value={o.value}>{t(o.labelKey)}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <p className="text-xs font-medium text-muted-foreground mb-1.5">{t('calendar.reminderLabel')}</p>
                  <select value={reminder} onChange={(e) => setReminder(Number(e.target.value))} className="w-full px-3 py-2 bg-background border border-border rounded-xl text-sm text-foreground outline-none focus:ring-2 focus:ring-ring">
                    {REMINDER_OPTIONS.map((o) => (
                      <option key={o.value} value={o.value}>{t(o.labelKey)}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 px-5 py-4 border-t border-border">
              <button onClick={onClose} className="px-4 py-2 text-xs font-medium text-muted-foreground hover:text-foreground bg-secondary rounded-xl hover:bg-secondary/80 transition-colors">{t('calendar.cancelButton')}</button>
              <button
                onClick={handleSubmit}
                disabled={!title.trim() || isPending}
                className="px-4 py-2 text-xs font-medium text-primary-foreground bg-primary rounded-xl hover:bg-primary/90 disabled:opacity-40 transition-colors"
              >
                {isPending ? t('common.saving') : isEdit ? t('calendar.saveButton') : t('calendar.createButton')}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
