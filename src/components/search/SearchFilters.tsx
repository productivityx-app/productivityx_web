import { useTranslation } from 'react-i18next';
import { cn } from '@/lib/utils';
import { X } from 'lucide-react';

type SearchType = 'ALL' | 'NOTE' | 'TASK' | 'EVENT' | 'CONVERSATION';

const filters: { value: SearchType; color: string }[] = [
  { value: 'ALL', color: '' },
  { value: 'NOTE', color: 'text-blue-400 bg-blue-500/10 border-blue-500/20' },
  { value: 'TASK', color: 'text-green-400 bg-green-500/10 border-green-500/20' },
  { value: 'EVENT', color: 'text-purple-400 bg-purple-500/10 border-purple-500/20' },
  { value: 'CONVERSATION', color: 'text-orange-400 bg-orange-500/10 border-orange-500/20' },
];

interface Props {
  active: SearchType;
  onChange: (v: SearchType) => void;
  dateRange?: string;
  onDateChange?: (v: string) => void;
}

export default function SearchFilters({ active, onChange, dateRange, onDateChange }: Props) {
  const { t } = useTranslation();

  return (
    <div className="flex items-center gap-1.5 flex-wrap">
      {filters.map(({ value, color }) => (
        <button
          key={value}
          onClick={() => onChange(value)}
          className={cn(
            'px-2.5 py-1 text-[11px] font-medium rounded-full border transition-all',
            active === value
              ? value === 'ALL'
                ? 'bg-primary text-primary-foreground border-primary'
                : color
              : 'border-border text-muted-foreground/60 hover:text-foreground hover:border-muted-foreground/30',
          )}
        >
          {value === 'ALL' ? t('searchModal.all') : t(`searchModal.${value.toLowerCase()}s`)}
        </button>
      ))}
    </div>
  );
}

export function ActiveChip({ label, onRemove }: { label: string; onRemove: () => void }) {
  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-primary/10 border border-primary/20 text-[11px] font-medium text-primary">
      {label}
      <button onClick={onRemove} className="hover:bg-primary/20 rounded-full p-0.5">
        <X size={10} />
      </button>
    </span>
  );
}

export type { SearchType };
