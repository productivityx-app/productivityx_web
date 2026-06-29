import { useMemo } from 'react';
import { format, parseISO, startOfMonth, endOfMonth, startOfWeek, endOfWeek, eachDayOfInterval, isSameMonth, isSameDay, isToday } from 'date-fns';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { CalendarEvent } from '@/types';

interface Props {
  currentMonth: Date;
  events: CalendarEvent[];
  selectedDate: Date | null;
  onDateSelect: (date: Date) => void;
  onEventClick: (event: CalendarEvent) => void;
}

export default function MonthView({ currentMonth, events, selectedDate, onDateSelect, onEventClick }: Props) {
  const days = useMemo(() => {
    const ms = startOfMonth(currentMonth);
    const me = endOfMonth(currentMonth);
    return eachDayOfInterval({ start: startOfWeek(ms), end: endOfWeek(me) });
  }, [currentMonth]);

  const eventsByDay = useMemo(() => {
    const map: Record<string, CalendarEvent[]> = {};
    for (const event of events) {
      const key = format(parseISO(event.startAt), 'yyyy-MM-dd');
      if (!map[key]) map[key] = [];
      map[key].push(event);
    }
    return map;
  }, [events]);

  const dayLabels = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-card border border-border rounded-xl overflow-hidden">
      <div className="grid grid-cols-7 border-b border-border">
        {dayLabels.map((label) => (
          <div key={label} className="px-2 py-2 text-xs font-medium text-muted-foreground text-center">
            {label}
          </div>
        ))}
      </div>
      <div className="grid grid-cols-7">
        {days.map((day) => {
          const key = format(day, 'yyyy-MM-dd');
          const dayEvents = eventsByDay[key] || [];
          const isCurrentMonth = isSameMonth(day, currentMonth);
          const isSelected = selectedDate && isSameDay(day, selectedDate);

          return (
            <button
              key={key}
              onClick={() => onDateSelect(day)}
              className={cn(
                'min-h-[100px] p-1.5 border-b border-r border-border/50 text-left transition-colors relative group focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none focus-visible:z-10',
                !isCurrentMonth && 'opacity-30',
                isToday(day) && 'bg-primary/[0.04]',
                isSelected && 'bg-primary/[0.06]',
                'hover:bg-accent/20',
              )}
            >
              <span className={cn(
                'text-xs font-medium inline-flex items-center justify-center w-6 h-6 rounded-full mb-1',
                isToday(day) && 'bg-primary text-primary-foreground',
                !isToday(day) && isCurrentMonth && 'text-foreground',
                !isCurrentMonth && 'text-muted-foreground',
              )}>
                {format(day, 'd')}
              </span>
              <div className="space-y-0.5">
                {dayEvents.slice(0, 3).map((event) => (
                  <div
                    key={event.id}
                    onClick={(e) => { e.stopPropagation(); onEventClick(event); }}
                    style={event.color ? { backgroundColor: event.color + '1A', color: event.color } : {}}
                    className={cn(
                      'text-[10px] truncate px-1 py-0.5 rounded cursor-pointer transition-colors',
                      'hover:brightness-110',
                      event.color ? '' : 'bg-primary/10 text-primary/80',
                    )}
                  >
                    {event.allDay ? event.title : `${format(parseISO(event.startAt), 'HH:mm')} ${event.title}`}
                  </div>
                ))}
                {dayEvents.length > 3 && (
                  <span className="text-[10px] text-muted-foreground">+{dayEvents.length - 3} more</span>
                )}
              </div>
            </button>
          );
        })}
      </div>
    </motion.div>
  );
}
