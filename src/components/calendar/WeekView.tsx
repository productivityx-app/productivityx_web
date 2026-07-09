import { useMemo } from 'react';
import { format, parseISO, startOfWeek, addDays, isSameDay, isToday, differenceInMinutes, isWithinInterval, areIntervalsOverlapping } from 'date-fns';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { CalendarEvent } from '@/types';
import { useTimeFormat } from '@/hooks/use-time-format';
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

interface OverlapGroup {
  columns: number;
  assignments: Map<string, number>;
}

function computeOverlap(events: CalendarEvent[]): OverlapGroup {
  const sorted = [...events].sort((a, b) => new Date(a.startAt).getTime() - new Date(b.startAt).getTime());
  const assignments = new Map<string, number>();
  const columns: CalendarEvent[][] = [];

  for (const event of sorted) {
    const start = parseISO(event.startAt);
    const end = parseISO(event.endAt);
    let placed = false;
    for (let col = 0; col < columns.length; col++) {
      const lastInCol = columns[col][columns[col].length - 1];
      if (!areIntervalsOverlapping(
        { start: parseISO(lastInCol.startAt), end: parseISO(lastInCol.endAt) },
        { start, end },
      )) {
        columns[col].push(event);
        assignments.set(event.id, col);
        placed = true;
        break;
      }
    }
    if (!placed) {
      columns.push([event]);
      assignments.set(event.id, columns.length - 1);
    }
  }

  return { columns: columns.length || 1, assignments };
}

export default function WeekView({ currentDate, events, onEventClick, onSlotClick }: Props) {
  const { formatTime } = useTimeFormat();
  const weekStart = startOfWeek(currentDate, { weekStartsOn: 0 });
  const days = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));

  const now = new Date();
  const currentTimeTop = (now.getHours() * 60 + now.getMinutes()) / 30 * (SLOT_HEIGHT / 2);

  const allDayEvents = useMemo(() =>
    events.filter((e) => e.allDay).filter((e) => days.some((d) => isSameDay(parseISO(e.startAt), d))),
    [events, days],
  );

  const timedEventsByDay = useMemo(() => {
    const map: Record<string, CalendarEvent[]> = {};
    for (const day of days) {
      const key = format(day, 'yyyy-MM-dd');
      map[key] = events.filter((e) => !e.allDay && isSameDay(parseISO(e.startAt), day));
    }
    return map;
  }, [events, days]);

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-card border border-border rounded-xl overflow-hidden flex flex-col">
      <div className="flex border-b border-border">
        <div className="w-14 flex-shrink-0" />
        {days.map((day) => (
          <div key={day.toISOString()} className={cn('flex-1 text-center py-2 border-r border-border last:border-r-0', isToday(day) && 'bg-primary/[0.03]')}>
            <div className="text-xs text-muted-foreground">{format(day, 'EEE')}</div>
            <div className={cn('text-sm font-semibold inline-flex items-center justify-center w-8 h-8 rounded-full', isToday(day) && 'bg-primary text-primary-foreground', !isToday(day) && 'text-foreground')}>
              {format(day, 'd')}
            </div>
          </div>
        ))}
      </div>

      {allDayEvents.length > 0 && (
        <div className="flex border-b border-border bg-muted/20">
          <div className="w-14 flex-shrink-0 px-1 py-1 text-[10px] text-muted-foreground text-right pr-2">all-day</div>
          {days.map((day) => {
            const dayKey = format(day, 'yyyy-MM-dd');
            const dayAllDay = allDayEvents.filter((e) => isSameDay(parseISO(e.startAt), day));
            return (
              <div key={day.toISOString()} className="flex-1 border-r border-border last:border-r-0 p-1 space-y-0.5">
                {dayAllDay.map((event) => (
                  <EventCard key={event.id} event={event} compact onClick={() => onEventClick(event)} />
                ))}
              </div>
            );
          })}
        </div>
      )}

      <div className="flex-1 overflow-y-auto">
        <div className="relative flex" style={{ height: HOURS.length * HOUR_HEIGHT }}>
          <div className="w-14 flex-shrink-0 relative">
            {HOURS.map((hour) => (
              <div key={hour} className="absolute text-[10px] text-muted-foreground pr-2 text-right" style={{ top: hour * HOUR_HEIGHT - 6, right: 4 }}>
                {hour === 0 ? '' : formatTime(new Date().setHours(hour, 0, 0, 0))}
              </div>
            ))}
          </div>
          {days.map((day) => {
            const dayKey = format(day, 'yyyy-MM-dd');
            const dayEvents = timedEventsByDay[dayKey] || [];
            const { columns, assignments } = computeOverlap(dayEvents);
            return (
              <div key={day.toISOString()} className="flex-1 relative border-r border-border last:border-r-0">
                {HOURS.map((hour) => (
                  <button
                    key={hour}
                    type="button"
                    onClick={() => onSlotClick(day, `${String(hour).padStart(2, '0')}:00`)}
                    className="absolute w-full border-t border-border/50 cursor-pointer hover:bg-accent/20 transition-colors focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none focus-visible:z-10"
                    style={{ top: hour * HOUR_HEIGHT, height: HOUR_HEIGHT }}
                    aria-label={`${format(day, 'EEEE')} ${hour}:00`}
                  />
                ))}
                {dayEvents.map((event) => {
                  const start = parseISO(event.startAt);
                  const end = parseISO(event.endAt);
                  const startMinutes = start.getHours() * 60 + start.getMinutes();
                  const duration = differenceInMinutes(end, start);
                  const top = (startMinutes / 30) * (SLOT_HEIGHT / 2);
                  const height = Math.max((duration / 30) * (SLOT_HEIGHT / 2), SLOT_HEIGHT / 2);
                  const col = assignments.get(event.id) || 0;
                  const width = 100 / columns;
                  const left = col * width;
                  return (
                    <div key={event.id} className="absolute" style={{ top, height, width: `${width}%`, left: `${left}%` }}>
                      <EventCard event={event} compact onClick={() => onEventClick(event)} />
                    </div>
                  );
                })}
                {isToday(day) && (
                  <div className="absolute left-0 right-0 z-20 pointer-events-none" style={{ top: currentTimeTop }}>
                    <div className="flex items-center">
                      <div className="w-2 h-2 rounded-full bg-red-500 -ml-1" />
                      <div className="flex-1 h-px bg-red-500" />
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </motion.div>
  );
}
