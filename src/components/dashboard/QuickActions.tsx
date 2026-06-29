import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { FileText, CheckSquare, CalendarDays, Timer, Sparkles, Trash2, Settings } from 'lucide-react';
import { motion } from 'framer-motion';
import { micro, transitions } from '@/lib/animations';

const primaryActions = [
  { icon: FileText, labelKey: 'dashboard.newNote', path: '/notes/new', color: 'from-primary/20 to-primary/5' },
  { icon: CheckSquare, labelKey: 'dashboard.newTask', path: '/tasks/new', color: 'from-emerald-500/20 to-emerald-500/5' },
  { icon: CalendarDays, labelKey: 'dashboard.newEvent', path: '/calendar', color: 'from-violet-500/20 to-violet-500/5' },
  { icon: Timer, labelKey: 'dashboard.startFocus', path: '/pomodoro', color: 'from-amber-500/20 to-amber-500/5' },
  { icon: Sparkles, labelKey: 'dashboard.askAI', path: '/ai', color: 'from-rose-500/20 to-rose-500/5' },
];

const secondaryActions = [
  { icon: Trash2, labelKey: 'dashboard.viewTrash', path: '/notes/trash' },
  { icon: Settings, labelKey: 'dashboard.openSettings', path: '/settings' },
];

export default function QuickActions() {
  const { t } = useTranslation();
  const navigate = useNavigate();

  return (
    <div className="overflow-x-auto -mx-4 px-4 pb-2 scrollbar-none">
      <div className="flex items-center gap-2 min-w-max">
        {primaryActions.map(({ icon: Icon, labelKey, path, color }, i) => (
          <motion.button
            key={labelKey}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3 + i * 0.05, ...transitions.normal }}
            whileHover={{ scale: 1.05 }}
            whileTap={micro.buttonPress}
            onClick={() => navigate(path)}
            className={`flex items-center gap-2 px-4 py-2 rounded-full border border-border bg-gradient-to-r ${color} backdrop-blur-sm text-sm font-medium text-foreground hover:shadow-lg hover:shadow-primary/5 transition-shadow focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none flex-shrink-0`}
          >
            <Icon size={14} className="text-primary" />
            {t(labelKey)}
          </motion.button>
        ))}
        <div className="w-px h-6 bg-border mx-1" />
        {secondaryActions.map(({ icon: Icon, labelKey, path }) => (
          <motion.button
            key={labelKey}
            whileHover={{ scale: 1.05 }}
            whileTap={micro.buttonPress}
            onClick={() => navigate(path)}
            className="flex items-center gap-2 px-3 py-2 rounded-full text-xs text-muted-foreground hover:text-foreground hover:bg-accent transition-colors focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none flex-shrink-0"
          >
            <Icon size={12} />
            {t(labelKey)}
          </motion.button>
        ))}
      </div>
    </div>
  );
}
