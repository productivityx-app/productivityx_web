import { useState } from 'react';
import { Trash2, Edit3 } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { cn } from '@/lib/utils';
import { CalendarEvent } from '@/types';
import { useTranslation } from 'react-i18next';

interface Props {
  event: CalendarEvent;
  compact?: boolean;
  onClick?: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
  style?: React.CSSProperties;
  className?: string;
}

const CARD_COLORS: Record<string, string> = {
  '#6366F1': 'border-l-indigo-500 bg-indigo-500/5',
  '#8B5CF6': 'border-l-violet-500 bg-violet-500/5',
  '#EC4899': 'border-l-pink-500 bg-pink-500/5',
  '#EF4444': 'border-l-red-500 bg-red-500/5',
  '#F59E0B': 'border-l-amber-500 bg-amber-500/5',
  '#10B981': 'border-l-emerald-500 bg-emerald-500/5',
  '#06B6D4': 'border-l-cyan-500 bg-cyan-500/5',
};

export default function EventCard({ event, compact, onClick, onEdit, onDelete, style, className }: Props) {
  const { t } = useTranslation();
  const [hover, setHover] = useState(false);
  const colorKey = event.color || '#6366F1';
  const colorClasses = CARD_COLORS[colorKey] || 'border-l-indigo-500 bg-indigo-500/5';
  const start = parseISO(event.startAt);
  const end = parseISO(event.endAt);

  return (
    <div
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      onClick={onClick}
      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onClick?.(); } }}
      style={style}
      tabIndex={0}
      className={cn(
        'border-l-[3px] rounded-lg px-2.5 py-1.5 cursor-pointer transition-all group focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none',
        colorClasses,
        hover && 'shadow-sm scale-[1.02]',
        compact ? 'text-xs' : 'text-sm',
        className,
      )}
    >
      <div className="flex items-center justify-between gap-1">
        <span className="font-medium text-foreground truncate">{event.title}</span>
        {hover && (
          <div className="flex items-center gap-0.5 flex-shrink-0">
            {onEdit && (
              <button onClick={(e) => { e.stopPropagation(); onEdit(); }} className="p-0.5 rounded text-muted-foreground hover:text-foreground hover:bg-background/50">
                <Edit3 size={10} />
              </button>
            )}
            {onDelete && (
              <button onClick={(e) => { e.stopPropagation(); onDelete(); }} className="p-0.5 rounded text-muted-foreground hover:text-destructive hover:bg-background/50">
                <Trash2 size={10} />
              </button>
            )}
          </div>
        )}
      </div>
      {!compact && !event.allDay && (
        <p className="text-xs text-muted-foreground mt-0.5">
          {format(start, 'h:mm a')} – {format(end, 'h:mm a')}
        </p>
      )}
      {event.allDay && <p className="text-xs text-muted-foreground mt-0.5">{t('calendar.allDay')}</p>}
    </div>
  );
}
