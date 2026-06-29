import { FileText, CheckSquare, CalendarDays, MessageSquare } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { getDateFnsLocale } from '@/i18n/dateLocales';
import { SearchResult } from '@/types';
import { cn } from '@/lib/utils';

export const typeConfig: Record<string, { icon: React.ElementType; path: string; color: string; label: string }> = {
  NOTE: { icon: FileText, path: '/notes', color: 'text-blue-400', label: 'Note' },
  TASK: { icon: CheckSquare, path: '/tasks', color: 'text-green-400', label: 'Task' },
  EVENT: { icon: CalendarDays, path: '/calendar/events', color: 'text-purple-400', label: 'Event' },
  CONVERSATION: { icon: MessageSquare, path: '/ai', color: 'text-orange-400', label: 'Conversation' },
};

function highlight(text: string, query: string): React.ReactNode {
  if (!query) return text;
  const escaped = query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const parts = text.split(new RegExp(`(${escaped})`, 'gi'));
  return parts.map((part, i) =>
    part.toLowerCase() === query.toLowerCase()
      ? <mark key={i} className="bg-primary/20 text-foreground rounded-sm px-0.5">{part}</mark>
      : part
  );
}

interface Props {
  result: SearchResult;
  query: string;
  selected?: boolean;
  onSelect: () => void;
  onPreview?: () => void;
}

export default function SearchResultItem({ result, query, selected, onSelect, onPreview }: Props) {
  const cfg = typeConfig[result.type] || typeConfig.NOTE;
  const Icon = cfg.icon;

  return (
    <button
      onClick={onSelect}
      onMouseEnter={onPreview}
      className={cn(
        'w-full flex items-start gap-3 px-4 py-2.5 text-left transition-all',
        selected ? 'bg-primary/10 border-l-2 border-primary' : 'hover:bg-accent/30 border-l-2 border-transparent',
      )}
    >
      <Icon size={15} className={cn('mt-0.5 flex-shrink-0', cfg.color)} />
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-foreground truncate">
            {highlight(result.title, query)}
          </span>
          <span className={cn('text-[10px] font-medium px-1 py-0.5 rounded shrink-0', cfg.color.replace('text-', 'bg-').replace('-400', '/10'), cfg.color)}>
            {cfg.label}
          </span>
        </div>
        {result.snippet && (
          <p className="text-xs text-muted-foreground/70 mt-0.5 line-clamp-1">
            {highlight(result.snippet, query)}
          </p>
        )}
        <p className="text-[10px] text-muted-foreground/40 mt-0.5">
          {formatDistanceToNow(new Date(result.updatedAt), { addSuffix: true, locale: getDateFnsLocale() })}
        </p>
      </div>
    </button>
  );
}
