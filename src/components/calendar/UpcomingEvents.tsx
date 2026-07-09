import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { format, parseISO, isBefore, isAfter, addDays, formatDistanceToNowStrict } from 'date-fns';
import { CalendarEvent } from '@/types';
import { cn } from '@/lib/utils';
import { useTranslation } from 'react-i18next';
import { useTimeFormat } from '@/hooks/use-time-format';

interface Props {
  events: CalendarEvent[];
}

export default function UpcomingEvents({ events }: Props) {
  const { t } = useTranslation();
  const { formatTime } = useTimeFormat();
  const navigate = useNavigate();

  const upcoming = useMemo(() => {
    const now = new Date();
    const weekFromNow = addDays(now, 7);
    return events
      .filter((e) => isAfter(parseISO(e.startAt), now) && isBefore(parseISO(e.startAt), weekFromNow))
      .sort((a, b) => new Date(a.startAt).getTime() - new Date(b.startAt).getTime())
      .slice(0, 5);
  }, [events]);

  return upcoming.length === 0 ? (
    <div className="text-xs text-muted-foreground text-center py-4">{t('calendar.noUpcoming')}</div>
  ) : (
    <div className="space-y-1">
      {upcoming.map((event) => {
        const start = parseISO(event.startAt);
        const color = event.color || '#6366F1';
        return (
          <button
            key={event.id}
            onClick={() => navigate(`/calendar/events/${event.id}`)}
            className="w-full flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-accent transition-colors text-left"
          >
            <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ backgroundColor: color }} />
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium text-foreground truncate">{event.title}</p>
              <p className="text-[10px] text-muted-foreground">
                {event.allDay ? t('calendar.allDay') : formatTime(start)}
                {' · '}
                {formatDistanceToNowStrict(start, { addSuffix: true })}
              </p>
            </div>
          </button>
        );
      })}
    </div>
  );
}
