import { ClipboardList, BarChart3, Target, FileText } from 'lucide-react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';

interface Props {
  onSelect: (template: string) => void;
}

const TEMPLATES = [
  { key: 'dailyStandup', icon: ClipboardList, color: '#6366F1' },
  { key: 'weeklyReview', icon: BarChart3, color: '#22C55E' },
  { key: 'focusPlan', icon: Target, color: '#F59E0B' },
  { key: 'noteSummary', icon: FileText, color: '#3B82F6' },
];

export default function ConversationStarters({ onSelect }: Props) {
  const { t } = useTranslation();

  return (
    <div className="flex flex-wrap gap-2">
      {TEMPLATES.map((tmpl, i) => {
        const Icon = tmpl.icon;
        return (
          <motion.button
            key={tmpl.key}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.06 }}
            onClick={() => onSelect(tmpl.key)}
            className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl border border-border/50 bg-card/40 text-xs text-muted-foreground hover:text-foreground hover:border-primary/20 hover:bg-primary/5 transition-all"
          >
            <Icon size={14} style={{ color: tmpl.color }} />
            {t(`ai.template${tmpl.key.charAt(0).toUpperCase() + tmpl.key.slice(1)}`)}
          </motion.button>
        );
      })}
    </div>
  );
}
