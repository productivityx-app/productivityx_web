import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { Sparkles } from 'lucide-react';
import SuggestionChips from './SuggestionChips';

interface Props {
  onSuggestion: (text: string) => void;
  onNewChat: () => void;
}

export default function WelcomeScreen({ onSuggestion, onNewChat }: Props) {
  const { t } = useTranslation();

  return (
    <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className="relative"
      >
        <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-primary/30 via-primary/10 to-transparent flex items-center justify-center mb-6 relative overflow-hidden">
          <div
            className="absolute inset-0 opacity-20"
            style={{
              background: 'conic-gradient(from 0deg, hsl(var(--primary)), transparent, hsl(var(--primary)), transparent, hsl(var(--primary)))',
              animation: 'spin 4s linear infinite',
            }}
          />
          <Sparkles size={32} className="text-primary relative z-10" />
        </div>
      </motion.div>

      <motion.h1
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
        className="text-2xl font-bold text-foreground mb-2"
      >
        {t('ai.welcomeTitle')}
      </motion.h1>

      <motion.p
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.25 }}
        className="text-sm text-muted-foreground/60 max-w-sm mb-8"
      >
        {t('ai.aiDescription')}
      </motion.p>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.35 }}
      >
        <button
          onClick={onNewChat}
          className="px-6 py-2.5 bg-primary text-primary-foreground rounded-full text-sm font-medium hover:bg-primary/90 transition-all shadow-lg shadow-primary/20"
        >
          {t('ai.startConversation')}
        </button>
      </motion.div>

      <SuggestionChips onSelect={onSuggestion} />
    </div>
  );
}
