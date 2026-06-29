import { cn } from '@/lib/utils';

const themes = [
  {
    id: 'LIGHT' as const,
    label: 'Light',
    preview: 'bg-white border border-gray-200',
    sidebar: 'bg-gray-50',
    content: 'bg-white',
    accent: 'bg-blue-500',
    text: 'text-gray-900',
    muted: 'text-gray-400',
  },
  {
    id: 'DARK' as const,
    label: 'Dark',
    preview: 'bg-[#1c1c1e] border border-[#2c2c2e]',
    sidebar: 'bg-[#2c2c2e]',
    content: 'bg-[#1c1c1e]',
    accent: 'bg-blue-500',
    text: 'text-white',
    muted: 'text-gray-500',
  },
  {
    id: 'SYSTEM' as const,
    label: 'System',
    preview: 'bg-gradient-to-r from-white to-[#1c1c1e] border border-gray-200 dark:border-[#2c2c2e]',
    sidebar: 'bg-gradient-to-r from-gray-50 to-[#2c2c2e]',
    content: 'bg-gradient-to-r from-white to-[#1c1c1e]',
    accent: 'bg-blue-500',
    text: 'text-gray-900 dark:text-white',
    muted: 'text-gray-400 dark:text-gray-500',
  },
];

interface Props {
  value: 'DARK' | 'LIGHT' | 'SYSTEM';
  onChange: (v: 'DARK' | 'LIGHT' | 'SYSTEM') => void;
}

export default function ThemePreview({ value, onChange }: Props) {
  return (
    <div className="grid grid-cols-3 gap-3">
      {themes.map((theme) => {
        const selected = value === theme.id;
        return (
          <button
            key={theme.id}
            onClick={() => onChange(theme.id)}
            className={cn(
              'rounded-xl overflow-hidden border-2 transition-all',
              selected ? 'border-primary shadow-md shadow-primary/10' : 'border-border hover:border-muted-foreground/30',
            )}
          >
            <div className={cn('p-2', theme.preview)}>
              <div className={cn('flex gap-1.5', theme.preview)}>
                <div className={cn('w-4 h-12 rounded', theme.sidebar)} />
                <div className={cn('flex-1 rounded p-1.5 space-y-1', theme.content)}>
                  <div className={cn('h-1.5 w-10 rounded-full', theme.accent)} />
                  <div className={cn('h-1 w-16 rounded-full', theme.muted)} />
                  <div className={cn('h-1 w-12 rounded-full', theme.muted)} />
                </div>
              </div>
            </div>
            <div className={cn('px-2.5 py-1.5 text-[11px] font-medium text-center', selected ? 'bg-primary text-primary-foreground' : 'bg-accent/30 text-muted-foreground')}>
              {theme.label}
            </div>
          </button>
        );
      })}
    </div>
  );
}
