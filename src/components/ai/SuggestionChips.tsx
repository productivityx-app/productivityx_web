import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { Lightbulb, Sparkles } from 'lucide-react';

const SUGGESTIONS = [
  { key: 'summarizeNotes', icon: Lightbulb },
  { key: 'tasksDue', icon: Sparkles },
  { key: 'meetingAgenda', icon: Lightbulb },
  { key: 'focusSession', icon: Sparkles },
];

interface Props {
  onSelect: (text: string) => void;
}

export default function SuggestionChips({ onSelect }: Props) {
  const { t } = useTranslation();

  const labels = [
    t('ai.suggestSummarizeNotes'),
    t('ai.suggestTasksDue'),
    t('ai.suggestMeetingAgenda'),
    t('ai.suggestFocusSession'),
  ];

  return (
    <div className="flex flex-wrap justify-center gap-2 mt-6">
      {SUGGESTIONS.map((s, i) => {
        const Icon = s.icon;
        return (
          <motion.button
            key={s.key}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 + i * 0.06 }}
            onClick={() => onSelect(labels[i])}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-full border border-border/50 bg-card/50 text-xs text-muted-foreground hover:text-foreground hover:border-primary/30 hover:bg-primary/5 transition-all"
          >
            <Icon size={12} />
            {labels[i]}
          </motion.button>
        );
      })}
    </div>
  );
}
