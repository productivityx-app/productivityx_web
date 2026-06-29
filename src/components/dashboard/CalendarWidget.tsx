import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { CalendarDays, Plus } from 'lucide-react';
import { motion } from 'framer-motion';
import { format, isSameDay } from 'date-fns';
import { getDateFnsLocale } from '@/i18n/dateLocales';
import EmptyState from './EmptyState';
import type { CalendarEvent } from '@/types';

interface Props {
  events: CalendarEvent[];
}

export default function CalendarWidget({ events }: Props) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const locale = getDateFnsLocale();

  const now = new Date();
  const sorted = [...events].sort((a, b) => new Date(a.startAt).getTime() - new Date(b.startAt).getTime());
  const ongoing = sorted.filter((e) => new Date(e.startAt) <= now && new Date(e.endAt) >= now);
  const upcoming = sorted.filter((e) => new Date(e.startAt) > now);
  const timelineEvents = [...ongoing, ...upcoming].slice(0, 5);

  const currentTimePercent = (now.getHours() * 60 + now.getMinutes()) / (24 * 60);

  if (events.length === 0) {
    return (
      <div className="bg-card border border-border rounded-xl">
        <EmptyState
          icon={CalendarDays}
          title={t('dashboard.noEventsToday')}
          description={t('dashboard.addFirstEvent')}
          action={{ label: t('calendar.newEvent'), onClick: () => navigate('/calendar') }}
        />
      </div>
    );
  }

  return (
    <div className="bg-card border border-border rounded-xl p-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-xs font-semibold text-foreground uppercase tracking-wider">{t('dashboard.todayEventsSection')}</h3>
        <button
          onClick={() => navigate('/calendar')}
          className="text-xs text-muted-foreground hover:text-primary transition-colors focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none rounded px-1"
        >
          {t('dashboard.viewCalendar')}
        </button>
      </div>

      <div className="relative">
        <div className="absolute left-[7px] top-2 bottom-2 w-0.5 bg-border rounded-full" />

        {timelineEvents.map((event, i) => {
          const start = new Date(event.startAt);
          const end = new Date(event.endAt);
          const startStr = format(start, 'h:mm a', { locale });
          const endStr = format(end, 'h:mm a', { locale });
          const isActive = start <= now && end >= now;

          return (
            <motion.button
              key={event.id}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 + i * 0.05, ease: 'easeOut' }}
              whileHover={{ x: 2 }}
              onClick={() => navigate(`/calendar/events/${event.id}`)}
              className="w-full text-left flex items-start gap-3 pb-3 last:pb-0 group focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none rounded-lg px-1"
            >
              <div className="relative flex-shrink-0 mt-1">
                <div
                  className={`w-[15px] h-[15px] rounded-full border-2 border-background ${isActive ? 'bg-primary ring-2 ring-primary/30' : 'bg-card'}`}
                  style={{ backgroundColor: isActive ? undefined : event.color || 'hsl(var(--muted-foreground))', borderColor: event.color || 'hsl(var(--muted-foreground))' }}
                />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-medium text-foreground truncate group-hover:text-primary transition-colors">
                    {event.title}
                  </p>
                  {isActive && (
                    <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-primary/10 text-primary font-medium uppercase flex-shrink-0">
                      {t('common.live')}
                    </span>
                  )}
                </div>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {event.allDay ? t('calendar.allDay') : `${startStr} – ${endStr}`}
                </p>
                {event.location && (
                  <p className="text-[10px] text-muted-foreground/60 mt-0.5">{event.location}</p>
                )}
              </div>
            </motion.button>
          );
        })}

        {timelineEvents.length === 0 && sorted.length > 0 && (
          <p className="text-xs text-muted-foreground py-4 text-center">
            {t('dashboard.noMoreEventsToday')}
          </p>
        )}
      </div>
    </div>
  );
}
