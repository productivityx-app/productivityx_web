import { useState, useMemo, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ChevronLeft, ChevronRight, Plus, Trash2 } from 'lucide-react';
import { format, addMonths, subMonths, addWeeks, subWeeks, addDays, subDays, startOfWeek, endOfWeek, startOfMonth, endOfMonth, startOfDay, endOfDay } from 'date-fns';
import { toast } from 'sonner';
import { motion } from 'framer-motion';
import { eventsApi } from '@/api/events';
import { CalendarEvent } from '@/types';
import { cn } from '@/lib/utils';
import { useTranslation } from 'react-i18next';
import { getDateFnsLocale } from '@/i18n/dateLocales';
import { Skeleton } from '@/components/ui/skeleton';
import ErrorState from '@/components/common/ErrorState';
import MonthView from '@/components/calendar/MonthView';
import WeekView from '@/components/calendar/WeekView';
import DayView from '@/components/calendar/DayView';
import AgendaView from '@/components/calendar/AgendaView';
import EventModal from '@/components/calendar/EventModal';
import MiniCalendar from '@/components/calendar/MiniCalendar';
import UpcomingEvents from '@/components/calendar/UpcomingEvents';
import CalendarEmptyState from '@/components/calendar/CalendarEmptyState';
import ConfirmDialog from '@/components/common/ConfirmDialog';

type ViewMode = 'month' | 'week' | 'day' | 'agenda';

export default function CalendarPage() {
  useEffect(() => { document.title = 'Calendar — ProductivityX'; }, []);
  const { t } = useTranslation();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const [searchParams, setSearchParams] = useSearchParams();

  const viewParam = searchParams.get('view') as ViewMode | null;
  const dateParam = searchParams.get('date');
  const [viewMode, setViewMode] = useState<ViewMode>(viewParam || 'month');
  const [currentDate, setCurrentDate] = useState(dateParam ? new Date(dateParam) : new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<CalendarEvent | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const dateRange = useMemo(() => {
    switch (viewMode) {
      case 'month': {
        const ms = startOfMonth(currentDate);
        const me = endOfMonth(currentDate);
        return { from: startOfWeek(ms), to: endOfWeek(me) };
      }
      case 'week': return { from: startOfWeek(currentDate), to: endOfWeek(currentDate) };
      case 'day': return { from: startOfDay(currentDate), to: endOfDay(currentDate) };
      case 'agenda': return { from: currentDate, to: addDays(currentDate, 7) };
    }
  }, [viewMode, currentDate]);

  const { data: events = [], isLoading, isError, refetch } = useQuery({
    queryKey: ['events', format(dateRange.from, 'yyyy-MM-dd'), format(dateRange.to, 'yyyy-MM-dd')],
    queryFn: () => eventsApi.list({ from: dateRange.from.toISOString(), to: dateRange.to.toISOString() }),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => eventsApi.softDelete(id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['events'] }); toast.success(t('calendar.eventDeleted')); setDeleteId(null); },
  });

  const navigateDate = (direction: 'prev' | 'next') => {
    const dir = direction === 'prev' ? -1 : 1;
    switch (viewMode) {
      case 'month': setCurrentDate((d) => dir > 0 ? addMonths(d, 1) : subMonths(d, 1)); break;
      case 'week': setCurrentDate((d) => dir > 0 ? addWeeks(d, 1) : subWeeks(d, 1)); break;
      case 'day': setCurrentDate((d) => dir > 0 ? addDays(d, 1) : subDays(d, 1)); break;
      case 'agenda': setCurrentDate((d) => dir > 0 ? addWeeks(d, 1) : subWeeks(d, 1)); break;
    }
  };

  const handleViewChange = (mode: ViewMode) => {
    setViewMode(mode);
    setSearchParams((prev) => { prev.set('view', mode); return prev; });
  };

  const handleToday = () => {
    const today = new Date();
    setCurrentDate(today);
    setSelectedDate(today);
  };

  const handleEventClick = (event: CalendarEvent) => {
    setEditingEvent(event);
    setModalOpen(true);
  };

  const handleSlotClick = (date: Date, startTime: string) => {
    const [h, m] = startTime.split(':').map(Number);
    const endHour = (h + 1) % 24;
    setSelectedDate(date);
    setEditingEvent(null);
    setModalOpen(true);
  };

  const getHeaderLabel = () => {
    switch (viewMode) {
      case 'month': return format(currentDate, 'MMMM yyyy', { locale: getDateFnsLocale() });
      case 'week': {
        const ws = startOfWeek(currentDate);
        const we = endOfWeek(currentDate);
        return `${format(ws, 'MMM d')} – ${format(we, 'MMM d, yyyy')}`;
      }
      case 'day': return format(currentDate, 'EEEE, MMMM d, yyyy', { locale: getDateFnsLocale() });
      case 'agenda': return t('calendar.agenda');
    }
  };

  const VIEW_OPTIONS: { mode: ViewMode; label: string }[] = [
    { mode: 'month', label: t('calendar.month') },
    { mode: 'week', label: t('calendar.week') },
    { mode: 'day', label: t('calendar.day') },
    { mode: 'agenda', label: t('calendar.agendaShort') },
  ];

  return (
    <div className="p-4 sm:p-6 h-full flex flex-col">
      <div className="flex items-center justify-between mb-4 gap-2">
        <div className="flex items-center gap-2">
          <button onClick={() => navigateDate('prev')} className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent transition-colors">
            <ChevronLeft size={16} />
          </button>
          <button onClick={handleToday} className="px-3 py-1 text-xs font-medium bg-card border border-border rounded-lg text-foreground hover:bg-accent transition-colors">
            {t('calendar.today')}
          </button>
          <button onClick={() => navigateDate('next')} className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent transition-colors">
            <ChevronRight size={16} />
          </button>
          <h1 className="text-lg font-bold text-foreground hidden sm:block min-w-[180px]">{getHeaderLabel()}</h1>
        </div>

        <div className="flex items-center gap-2">
          <div className="bg-card border border-border rounded-lg p-0.5 flex">
            {VIEW_OPTIONS.map(({ mode, label }) => (
              <button
                key={mode}
                onClick={() => handleViewChange(mode)}
                className={cn(
                  'px-3 py-1 rounded text-xs font-medium transition-all',
                  viewMode === mode ? 'bg-primary text-primary-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground',
                )}
              >
                {label}
              </button>
            ))}
          </div>
          <button onClick={() => navigate('/calendar/trash')} className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent transition-colors">
            <Trash2 size={15} />
          </button>
          <button
            onClick={() => { setEditingEvent(null); setSelectedDate(new Date()); setModalOpen(true); }}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-primary text-primary-foreground rounded-lg text-xs font-medium hover:bg-primary/90 transition-colors"
          >
            <Plus size={14} />
            <span className="hidden sm:inline">{t('calendar.newEvent')}</span>
          </button>
        </div>
      </div>

      {isLoading ? (
        <div className="flex-1 flex gap-4">
          <div className="flex-1 space-y-4">
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-[500px] rounded-xl" />
          </div>
          {sidebarOpen && <div className="hidden lg:block w-64 space-y-4"><Skeleton className="h-48 rounded-xl" /><Skeleton className="h-32 rounded-xl" /></div>}
        </div>
      ) : isError ? (
        <ErrorState onRetry={refetch} />
      ) : (
        <div className="flex-1 flex gap-4 overflow-hidden">
          <div className="flex-1 overflow-y-auto">
            {events.length === 0 && viewMode !== 'agenda' ? (
              <CalendarEmptyState type={viewMode} onAddEvent={() => { setEditingEvent(null); setSelectedDate(new Date()); setModalOpen(true); }} />
            ) : viewMode === 'month' ? (
              <MonthView
                currentMonth={currentDate}
                events={events}
                selectedDate={selectedDate}
                onDateSelect={(d) => { setSelectedDate(d); handleViewChange('day'); }}
                onEventClick={handleEventClick}
              />
            ) : viewMode === 'week' ? (
              <WeekView
                currentDate={currentDate}
                events={events}
                onEventClick={handleEventClick}
                onSlotClick={handleSlotClick}
              />
            ) : viewMode === 'day' ? (
              <DayView
                currentDate={currentDate}
                events={events}
                onEventClick={handleEventClick}
                onSlotClick={handleSlotClick}
              />
            ) : (
              <AgendaView
                currentDate={currentDate}
                events={events}
                onEventClick={handleEventClick}
              />
            )}
          </div>

          {sidebarOpen && (
            <motion.div
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: 256, opacity: 1 }}
              className="hidden lg:block w-64 flex-shrink-0 space-y-4"
            >
              <MiniCalendar
                currentMonth={currentDate}
                onMonthChange={(d) => setCurrentDate((prev) => {
                  const newD = new Date(prev); newD.setFullYear(d.getFullYear(), d.getMonth()); return newD;
                })}
                selectedDate={selectedDate}
                onDateSelect={(d) => { setSelectedDate(d); handleViewChange('day'); }}
                events={events}
              />
              <div className="bg-card border border-border rounded-xl p-3">
                <h3 className="text-xs font-semibold text-foreground mb-2">{t('calendar.upcoming')}</h3>
                <UpcomingEvents events={events} />
              </div>
            </motion.div>
          )}
        </div>
      )}

      <EventModal
        open={modalOpen}
        onClose={() => { setModalOpen(false); setEditingEvent(null); }}
        event={editingEvent}
        defaultDate={selectedDate || new Date()}
      />

      <ConfirmDialog
        open={!!deleteId}
        onOpenChange={() => setDeleteId(null)}
        title={t('eventDetail.deleteConfirmTitle')}
        description={t('eventDetail.deleteConfirmDesc')}
        confirmText={t('eventDetail.deleteConfirmText')}
        onConfirm={() => deleteId && deleteMutation.mutate(deleteId)}
        destructive
      />
    </div>
  );
}
