import { Check } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { cn } from '@/lib/utils';

const colors = [
  { id: 'indigo', class: 'bg-indigo-500' },
  { id: 'blue', class: 'bg-blue-500' },
  { id: 'purple', class: 'bg-purple-500' },
  { id: 'green', class: 'bg-green-500' },
  { id: 'orange', class: 'bg-orange-500' },
  { id: 'red', class: 'bg-red-500' },
  { id: 'pink', class: 'bg-pink-500' },
  { id: 'teal', class: 'bg-teal-500' },
];

interface Props {
  value: string;
  onChange: (id: string) => void;
}

export default function AccentColorPicker({ value, onChange }: Props) {
  const { t } = useTranslation();

  return (
    <div className="flex flex-wrap gap-2.5" role="radiogroup" aria-label={t('settings.accentColor', 'Accent color')}>
      {colors.map((c) => {
        const selected = value === c.id;
        return (
          <button
            key={c.id}
            type="button"
            role="radio"
            aria-checked={selected}
            aria-label={c.id.charAt(0).toUpperCase() + c.id.slice(1)}
            onClick={() => onChange(c.id)}
            className={cn(
              'relative w-8 h-8 rounded-full transition-all flex items-center justify-center',
              c.class,
              selected
                ? 'ring-2 ring-offset-2 ring-offset-card ring-foreground scale-110'
                : 'ring-0 opacity-60 hover:opacity-100 hover:scale-105',
            )}
          >
            {selected && <Check className="h-4 w-4 text-white drop-shadow" strokeWidth={3} />}
          </button>
        );
      })}
    </div>
  );
}
