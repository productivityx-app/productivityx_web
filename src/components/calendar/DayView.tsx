import { useMemo } from 'react';
import { format, parseISO, isSameDay, isToday, differenceInMinutes, areIntervalsOverlapping } from 'date-fns';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { CalendarEvent } from '@/types';
import EventCard from './EventCard';

interface Props {
  currentDate: Date;
  events: CalendarEvent[];
  onEventClick: (event: CalendarEvent) => void;
  onSlotClick: (date: Date, startTime: string) => void;
}

const HOURS = Array.from({ length: 24 }, (_, i) => i);
const SLOT_HEIGHT = 48;
const HOUR_HEIGHT = SLOT_HEIGHT * 2;

export default function DayView({ currentDate, events, onEventClick, onSlotClick }: Props) {
  const now = new Date();
  const currentTimeTop = (now.getHours() * 60 + now.getMinutes()) / 30 * (SLOT_HEIGHT / 2);

  const dayEvents = useMemo(() => {
    const allDay: CalendarEvent[] = [];
    const timed: CalendarEvent[] = [];
    for (const e of events) {
      if (isSameDay(parseISO(e.startAt), currentDate)) {
        if (e.allDay) allDay.push(e); else timed.push(e);
      }
    }
    return { allDay, timed };
  }, [events, currentDate]);

  const columns = useMemo(() => {
    const sorted = [...dayEvents.timed].sort((a, b) => new Date(a.startAt).getTime() - new Date(b.startAt).getTime());
    const cols: CalendarEvent[][] = [];
    const assignments = new Map<string, number>();
    for (const event of sorted) {
      const start = parseISO(event.startAt);
      const end = parseISO(event.endAt);
      let placed = false;
      for (let col = 0; col < cols.length; col++) {
        const last = cols[col][cols[col].length - 1];
        if (!areIntervalsOverlapping({ start: parseISO(last.startAt), end: parseISO(last.endAt) }, { start, end })) {
          cols[col].push(event);
          assignments.set(event.id, col);
          placed = true; break;
        }
      }
      if (!placed) { cols.push([event]); assignments.set(event.id, cols.length - 1); }
    }
    return { total: Math.max(cols.length, 1), assignments };
  }, [dayEvents.timed]);

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-card border border-border rounded-xl overflow-hidden">
      <div className={cn('px-4 py-3 border-b border-border', isToday(currentDate) && 'bg-primary/[0.03]')}>
        <div className="text-sm font-semibold text-foreground">{format(currentDate, 'EEEE, MMMM d')}</div>
        <div className="text-xs text-muted-foreground">{dayEvents.timed.length + dayEvents.allDay.length} events</div>
      </div>

      {dayEvents.allDay.length > 0 && (
        <div className="px-4 py-2 border-b border-border bg-muted/20 space-y-1">
          <span className="text-[10px] font-medium text-muted-foreground">All day</span>
          {dayEvents.allDay.map((event) => (
            <EventCard key={event.id} event={event} compact onClick={() => onEventClick(event)} />
          ))}
        </div>
      )}

      <div className="overflow-y-auto" style={{ height: 'calc(100vh - 280px)' }}>
        <div className="relative" style={{ height: HOURS.length * HOUR_HEIGHT }}>
          <div className="absolute left-0 top-0 bottom-0 w-14">
            {HOURS.map((hour) => (
              <div key={hour} className="absolute text-[10px] text-muted-foreground pr-2 text-right w-full" style={{ top: hour * HOUR_HEIGHT - 6 }}>
                {hour === 0 ? '' : format(new Date().setHours(hour, 0, 0, 0), 'ha')}
              </div>
            ))}
          </div>
          <div className="ml-14 relative">
            {HOURS.map((hour) => (
              <button
                key={hour}
                type="button"
                onClick={() => onSlotClick(currentDate, `${String(hour).padStart(2, '0')}:00`)}
                className="border-t border-border/50 cursor-pointer hover:bg-accent/20 transition-colors focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none focus-visible:z-10"
                style={{ height: HOUR_HEIGHT }}
                aria-label={`${format(currentDate, 'EEEE')} ${hour}:00`}
              />
            ))}
            {dayEvents.timed.map((event) => {
              const start = parseISO(event.startAt);
              const end = parseISO(event.endAt);
              const startMin = start.getHours() * 60 + start.getMinutes();
              const dur = differenceInMinutes(end, start);
              const top = (startMin / 30) * (SLOT_HEIGHT / 2);
              const height = Math.max((dur / 30) * (SLOT_HEIGHT / 2), SLOT_HEIGHT / 2);
              const col = columns.assignments.get(event.id) || 0;
              const width = 100 / columns.total;
              return (
                <div key={event.id} className="absolute left-0" style={{ top, height, width: `${width}%`, left: `${col * width}%` }}>
                  <EventCard event={event} onClick={() => onEventClick(event)} />
                </div>
              );
            })}
            {isToday(currentDate) && (
              <div className="absolute left-0 right-0 z-20 pointer-events-none" style={{ top: currentTimeTop }}>
                <div className="flex items-center">
                  <div className="w-2 h-2 rounded-full bg-red-500 -ml-1" />
                  <div className="flex-1 h-px bg-red-500" />
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
