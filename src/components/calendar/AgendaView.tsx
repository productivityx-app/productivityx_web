import { useMemo, useState } from 'react';
import { format, parseISO, isSameDay, isAfter, isBefore, startOfDay, endOfDay } from 'date-fns';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { useTranslation } from 'react-i18next';
import { CalendarEvent } from '@/types';
import EventCard from './EventCard';

interface Props {
  currentDate: Date;
  events: CalendarEvent[];
  onEventClick: (event: CalendarEvent) => void;
}

export default function AgendaView({ currentDate, events, onEventClick }: Props) {
  const { t } = useTranslation();

  const daysWithEvents = useMemo(() => {
    const now = startOfDay(currentDate);
    const end = endOfDay(currentDate);
    const dayMap: Map<string, CalendarEvent[]> = new Map();

    for (const event of events) {
      const start = parseISO(event.startAt);
      if (isBefore(start, end) && isAfter(parseISO(event.endAt), now)) {
        const key = format(start, 'EEEE, MMMM d');
        if (!dayMap.has(key)) dayMap.set(key, []);
        dayMap.get(key)!.push(event);
      }
    }

    return Array.from(dayMap.entries()).map(([date, evts]) => ({
      date,
      events: evts.sort((a, b) => new Date(a.startAt).getTime() - new Date(b.startAt).getTime()),
    }));
  }, [currentDate, events]);

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-card border border-border rounded-xl p-4 space-y-6">
      {daysWithEvents.length === 0 ? (
        <div className="text-center py-12 text-sm text-muted-foreground">{t('calendar.agendaEmpty')}</div>
      ) : (
        daysWithEvents.map(({ date, events: dayEvents }) => (
          <div key={date}>
            <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">{date}</h3>
            <div className="space-y-1.5">
              {dayEvents.map((event) => {
                const start = parseISO(event.startAt);
                const end = parseISO(event.endAt);
                return (
                  <div
                    key={event.id}
                    onClick={() => onEventClick(event)}
                    className="flex items-start gap-3 px-3 py-2.5 rounded-xl hover:bg-accent/50 cursor-pointer transition-colors"
                  >
                    <div className="flex flex-col items-center w-10 flex-shrink-0">
                      <span className="text-xs font-semibold text-foreground">{format(start, 'h:mm')}</span>
                      <span className="text-[10px] text-muted-foreground">{format(start, 'a')}</span>
                    </div>
                    <div className="w-0.5 rounded-full flex-shrink-0 self-stretch" style={{ backgroundColor: event.color || '#6366F1' }} />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground">{event.title}</p>
                      <p className="text-xs text-muted-foreground">
                        {event.allDay ? t('calendar.allDay') : `${format(start, 'h:mm a')} – ${format(end, 'h:mm a')}`}
                        {event.location && ` · ${event.location}`}
                      </p>
                      {event.description && (
                        <p className="text-xs text-muted-foreground/70 mt-0.5 line-clamp-1">{event.description}</p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))
      )}
    </motion.div>
  );
}
