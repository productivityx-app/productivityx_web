import { useEffect, useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import {
  User, Bell, Palette, Timer, ListChecks, Calendar,
  Cpu, Monitor, Shield, Search, Sparkles, Layout,
} from 'lucide-react';

export interface Category {
  id: string;
  icon: React.ElementType;
}

const categoryIds = [
  'general', 'profile', 'appearance', 'notifications',
  'pomodoro', 'tasks', 'calendar', 'ai', 'devices', 'account',
];

const iconMap: Record<string, React.ElementType> = {
  general: Layout,
  profile: User,
  appearance: Palette,
  notifications: Bell,
  pomodoro: Timer,
  tasks: ListChecks,
  calendar: Calendar,
  ai: Sparkles,
  devices: Monitor,
  account: Shield,
};

interface Props {
  active: string;
  onSelect: (id: string) => void;
}

export default function SettingsSidebar({ active, onSelect }: Props) {
  const { t } = useTranslation();
  const [search, setSearch] = useState('');

  const filtered = useMemo(() => {
    if (!search) return categoryIds;
    const q = search.toLowerCase();
    return categoryIds.filter((id) => t(`settings.categories.${id}`).toLowerCase().includes(q));
  }, [search, t]);

  useEffect(() => {
    if (filtered.length > 0 && !filtered.includes(active)) onSelect(filtered[0]);
  }, [filtered, active, onSelect]);

  return (
    <aside className="w-56 flex-shrink-0 border-r border-border bg-card/50">
      <div className="p-3">
        <div className="relative">
          <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground/50 pointer-events-none" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={t('settings.searchPlaceholder')}
            className="w-full pl-8 pr-3 py-1.5 rounded-lg text-xs bg-accent/30 border border-border text-foreground placeholder:text-muted-foreground/30 outline-none focus:border-primary/40 transition-colors"
          />
        </div>
      </div>
      <nav className="pb-3">
        {filtered.map((id) => {
          const Icon = iconMap[id];
          const isActive = active === id;
          return (
            <button
              key={id}
              onClick={() => onSelect(id)}
              className={cn(
                'w-full flex items-center gap-2.5 px-4 py-2 text-xs font-medium transition-all',
                isActive
                  ? 'bg-primary/10 text-primary border-r-2 border-primary'
                  : 'text-muted-foreground hover:text-foreground hover:bg-accent/30 border-r-2 border-transparent',
              )}
            >
              <Icon size={15} />
              {t(`settings.categories.${id}`)}
            </button>
          );
        })}
        {filtered.length === 0 && (
          <p className="px-4 py-8 text-xs text-muted-foreground/50 text-center">{t('settings.noResults')}</p>
        )}
      </nav>
    </aside>
  );
}
