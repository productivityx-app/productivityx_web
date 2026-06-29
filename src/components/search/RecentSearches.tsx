import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Clock, Trash2 } from 'lucide-react';

interface RecentSearch {
  query: string;
  timestamp: number;
}

const STORAGE_KEY = 'px-recent-searches';
const MAX = 8;

function load(): RecentSearch[] {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]'); }
  catch { return []; }
}

function save(items: RecentSearch[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
}

export function useRecentSearches() {
  const [items, setItems] = useState<RecentSearch[]>(load);

  useEffect(() => { save(items); }, [items]);

  const add = (query: string) => {
    if (!query.trim()) return;
    setItems((prev) => {
      const filtered = prev.filter((r) => r.query.toLowerCase() !== query.toLowerCase());
      return [{ query: query.trim(), timestamp: Date.now() }, ...filtered].slice(0, MAX);
    });
  };

  const remove = (query: string) => {
    setItems((prev) => prev.filter((r) => r.query.toLowerCase() !== query.toLowerCase()));
  };

  const clear = () => setItems([]);

  return { recentSearches: items, addRecent: add, removeRecent: remove, clearRecent: clear };
}

interface Props {
  searches: RecentSearch[];
  onSelect: (q: string) => void;
  onRemove: (q: string) => void;
  onClear: () => void;
}

export default function RecentSearches({ searches, onSelect, onRemove, onClear }: Props) {
  const { t } = useTranslation();
  if (searches.length === 0) return null;

  return (
    <div className="px-4 py-3">
      <div className="flex items-center justify-between mb-2">
        <span className="text-[11px] font-medium text-muted-foreground/50">{t('searchModal.recentSearches')}</span>
        <button onClick={onClear} className="text-[10px] text-muted-foreground/30 hover:text-muted-foreground/60 transition-colors">
          {t('searchModal.clearAll')}
        </button>
      </div>
      <div className="space-y-0.5">
        {searches.map((s) => (
          <div key={s.query + s.timestamp} className="flex items-center group">
            <button
              onClick={() => onSelect(s.query)}
              className="flex items-center gap-2 flex-1 px-2 py-1.5 rounded-lg text-xs text-muted-foreground hover:text-foreground hover:bg-accent/30 transition-colors text-left"
            >
              <Clock size={12} className="text-muted-foreground/30" />
              {s.query}
            </button>
            <button
              onClick={() => onRemove(s.query)}
              className="p-1 rounded text-muted-foreground/20 hover:text-muted-foreground/60 opacity-0 group-hover:opacity-100 transition-all"
            >
              <Trash2 size={10} />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
