import { Search, X, ArrowUpDown } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { cn } from '@/lib/utils';

export type FilterKey = 'today' | 'overdue' | 'highPriority' | 'noDueDate' | 'assignedToMe';
export type SortKey = 'dueDate' | 'priority' | 'createdAt' | 'title';
export type GroupKey = 'none' | 'priority' | 'dueDate' | 'status';

const FILTERS: { key: FilterKey; labelKey: string }[] = [
  { key: 'today', labelKey: 'tasks.filterToday' },
  { key: 'overdue', labelKey: 'tasks.filterOverdue' },
  { key: 'highPriority', labelKey: 'tasks.filterHighPriority' },
  { key: 'noDueDate', labelKey: 'tasks.filterNoDueDate' },
  { key: 'assignedToMe', labelKey: 'tasks.filterAssignedToMe' },
];

interface Props {
  search: string;
  onSearchChange: (v: string) => void;
  activeFilters: FilterKey[];
  onToggleFilter: (key: FilterKey) => void;
  sort: SortKey;
  onSortChange: (key: SortKey) => void;
  sortDir: 'asc' | 'desc';
  onToggleSortDir: () => void;
  group: GroupKey;
  onGroupChange: (key: GroupKey) => void;
}

export default function TaskFilters({
  search, onSearchChange, activeFilters, onToggleFilter,
  sort, onSortChange, sortDir, onToggleSortDir, group, onGroupChange,
}: Props) {
  const { t } = useTranslation();

  const SORT_OPTIONS: { key: SortKey; labelKey: string }[] = [
    { key: 'dueDate', labelKey: 'tasks.sortDueDate' },
    { key: 'priority', labelKey: 'tasks.sortPriority' },
    { key: 'createdAt', labelKey: 'tasks.sortCreated' },
    { key: 'title', labelKey: 'tasks.sortTitle' },
  ];

  const GROUP_OPTIONS: { key: GroupKey; labelKey: string }[] = [
    { key: 'none', labelKey: 'tasks.groupNone' },
    { key: 'priority', labelKey: 'tasks.groupPriority' },
    { key: 'dueDate', labelKey: 'tasks.groupDueDate' },
    { key: 'status', labelKey: 'tasks.groupStatus' },
  ];

  return (
    <div className="space-y-3">
      <div className="relative">
        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
        <input
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder={t('common.search')}
          className="w-full h-9 pl-9 pr-8 bg-card border border-border rounded-xl text-sm text-foreground placeholder:text-muted-foreground/40 outline-none focus:ring-2 focus:ring-ring"
        />
        {search && (
          <button onClick={() => onSearchChange('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
            <X size={14} />
          </button>
        )}
      </div>

      <div className="flex flex-wrap items-center gap-1.5">
        {FILTERS.map((f) => (
          <button
            key={f.key}
            onClick={() => onToggleFilter(f.key)}
            className={cn(
              'px-2.5 py-1 rounded-lg text-xs font-medium transition-colors',
              activeFilters.includes(f.key)
                ? 'bg-primary/10 text-primary border border-primary/30'
                : 'bg-card border border-border text-muted-foreground hover:text-foreground hover:border-primary/30',
            )}
          >
            {t(f.labelKey)}
          </button>
        ))}

        <div className="w-px h-5 bg-border mx-1" />

        <select
          value={sort}
          onChange={(e) => onSortChange(e.target.value as SortKey)}
          className="px-2.5 py-1 rounded-lg text-xs bg-card border border-border text-muted-foreground outline-none focus:ring-2 focus:ring-ring"
        >
          {SORT_OPTIONS.map((o) => (
            <option key={o.key} value={o.key}>{t(o.labelKey)}</option>
          ))}
        </select>

        <button
          onClick={onToggleSortDir}
          className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
        >
          <ArrowUpDown size={12} className={cn('transition-transform', sortDir === 'desc' && 'rotate-180')} />
        </button>

        <div className="w-px h-5 bg-border mx-1" />

        <select
          value={group}
          onChange={(e) => onGroupChange(e.target.value as GroupKey)}
          className="px-2.5 py-1 rounded-lg text-xs bg-card border border-border text-muted-foreground outline-none focus:ring-2 focus:ring-ring"
        >
          {GROUP_OPTIONS.map((o) => (
            <option key={o.key} value={o.key}>{t(o.labelKey)}</option>
          ))}
        </select>
      </div>
    </div>
  );
}
