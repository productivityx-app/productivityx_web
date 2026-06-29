import { useMemo } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { format, startOfMonth, endOfMonth, startOfWeek, endOfWeek, addDays, isSameDay, isSameMonth, isToday, addMonths, subMonths, parseISO } from 'date-fns';
import { cn } from '@/lib/utils';
import { CalendarEvent } from '@/types';

interface Props {
  currentMonth: Date;
  onMonthChange: (date: Date) => void;
  selectedDate: Date | null;
  onDateSelect: (date: Date) => void;
  events: CalendarEvent[];
}

export default function MiniCalendar({ currentMonth, onMonthChange, selectedDate, onDateSelect, events }: Props) {
  const dayNames = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

  const days = useMemo(() => {
    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(currentMonth);
    const calStart = startOfWeek(monthStart);
    const calEnd = endOfWeek(monthEnd);
    const result: Date[] = [];
    let d = calStart;
    while (d <= calEnd) { result.push(d); d = addDays(d, 1); }
    return result;
  }, [currentMonth]);

  const eventDates = useMemo(() => {
    const set = new Set<string>();
    for (const e of events) set.add(format(parseISO(e.startAt), 'yyyy-MM-dd'));
    return set;
  }, [events]);

  return (
    <div className="bg-card border border-border rounded-xl p-3">
      <div className="flex items-center justify-between mb-2">
        <button onClick={() => onMonthChange(subMonths(currentMonth, 1))} className="p-1 rounded text-muted-foreground hover:text-foreground hover:bg-accent">
          <ChevronLeft size={12} />
        </button>
        <span className="text-xs font-semibold text-foreground">{format(currentMonth, 'MMMM yyyy')}</span>
        <button onClick={() => onMonthChange(addMonths(currentMonth, 1))} className="p-1 rounded text-muted-foreground hover:text-foreground hover:bg-accent">
          <ChevronRight size={12} />
        </button>
      </div>
      <div className="grid grid-cols-7 gap-0.5 text-center">
        {dayNames.map((d, i) => (
          <span key={i} className="text-[10px] font-medium text-muted-foreground py-1">{d}</span>
        ))}
        {days.map((day) => {
          const key = format(day, 'yyyy-MM-dd');
          const hasEvent = eventDates.has(key);
          const isSel = selectedDate && isSameDay(day, selectedDate);
          return (
            <button
              key={key}
              onClick={() => onDateSelect(day)}
              className={cn(
                'relative text-[11px] w-7 h-7 rounded-full flex items-center justify-center transition-colors',
                !isSameMonth(day, currentMonth) && 'text-muted-foreground/30',
                isSel && 'bg-primary text-primary-foreground font-semibold',
                !isSel && isToday(day) && 'border border-primary text-primary font-semibold',
                !isSel && !isToday(day) && 'text-foreground hover:bg-accent',
              )}
            >
              {format(day, 'd')}
              {hasEvent && !isSel && (
                <span className="absolute bottom-0.5 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-primary" />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
