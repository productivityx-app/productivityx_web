import { X, FileText, CheckSquare, CalendarDays } from 'lucide-react';
import { SearchResult } from '@/types';
import { cn } from '@/lib/utils';
import { formatDistanceToNow } from 'date-fns';
import { getDateFnsLocale } from '@/i18n/dateLocales';

const iconMap: Record<string, React.ElementType> = {
  NOTE: FileText, TASK: CheckSquare, EVENT: CalendarDays,
};
const colorMap: Record<string, string> = {
  NOTE: 'text-blue-400', TASK: 'text-green-400', EVENT: 'text-purple-400',
};

interface Props {
  result: SearchResult | null;
  onClose: () => void;
  onOpen: () => void;
}

export default function SearchPreview({ result, onClose, onOpen }: Props) {
  if (!result) return null;

  const Icon = iconMap[result.type] || FileText;

  return (
    <div className="w-80 border-l border-border bg-card/50 flex-shrink-0 overflow-y-auto p-5">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2 text-sm font-medium text-foreground">
          <Icon size={16} className={colorMap[result.type]} />
          <span>{result.type}</span>
        </div>
        <button onClick={onClose} className="p-1 rounded-md text-muted-foreground/50 hover:text-foreground hover:bg-accent">
          <X size={14} />
        </button>
      </div>
      <h3 className="text-base font-semibold text-foreground mb-2">{result.title}</h3>
      {result.snippet && (
        <p className="text-sm text-muted-foreground/70 leading-relaxed">{result.snippet}</p>
      )}
      <div className="mt-6 pt-4 border-t border-border">
        <p className="text-xs text-muted-foreground/50">
          Updated {formatDistanceToNow(new Date(result.updatedAt), { addSuffix: true, locale: getDateFnsLocale() })}
        </p>
      </div>
      <button
        onClick={onOpen}
        className="mt-4 w-full px-3 py-2 rounded-lg bg-primary text-primary-foreground text-xs font-medium hover:opacity-90 transition-all"
      >
        Open {result.type.toLowerCase()}
      </button>
    </div>
  );
}
