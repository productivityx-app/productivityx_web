import { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Sparkles, ArrowRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const TYPING_SPEED = 35;
const PAUSE_DURATION = 4000;

interface Props {
  tasksDueToday: number;
  overdue: number;
  notesCount: number;
}

export default function AISuggestionCard({ tasksDueToday, overdue, notesCount }: Props) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [tipIndex, setTipIndex] = useState(0);
  const [displayedText, setDisplayedText] = useState('');
  const [isTyping, setIsTyping] = useState(true);

  const tips = useMemo(() => [
    tasksDueToday > 0 ? t('dashboard.aiTip.tasksDue', { count: tasksDueToday }) : t('dashboard.aiTip.noTasksDue'),
    t('dashboard.aiTip.focusSession'),
    notesCount > 0 ? t('dashboard.aiTip.reviewNotes', { count: notesCount }) : t('dashboard.aiTip.createNote'),
    overdue > 0 ? t('dashboard.aiTip.overdueTasks', { count: overdue }) : t('dashboard.aiTip.stayOnTrack'),
  ], [tasksDueToday, overdue, notesCount, t]);

  const typeText = useCallback((text: string) => {
    setIsTyping(true);
    setDisplayedText('');
    let i = 0;
    const interval = setInterval(() => {
      i++;
      setDisplayedText(text.slice(0, i));
      if (i >= text.length) {
        clearInterval(interval);
        setIsTyping(false);
      }
    }, TYPING_SPEED);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const cleanup = typeText(tips[tipIndex]);
    return cleanup;
  }, [tipIndex, typeText, tips]);

  useEffect(() => {
    if (isTyping) return;
    const timeout = setTimeout(() => {
      setTipIndex((prev) => (prev + 1) % tips.length);
    }, PAUSE_DURATION);
    return () => clearTimeout(timeout);
  }, [isTyping, tips.length]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.5, ease: 'easeOut' }}
      className="relative overflow-hidden rounded-xl border border-border/50 bg-gradient-to-br from-primary/5 via-transparent to-violet-500/5 p-4 group"
    >
      <div className="absolute inset-0 bg-grid-white/5 opacity-[0.03]" />
      <div className="relative z-10">
        <div className="flex items-center gap-2 mb-3">
          <div className="w-7 h-7 rounded-lg bg-primary/15 flex items-center justify-center">
            <Sparkles size={14} className="text-primary" />
          </div>
          <span className="text-xs font-semibold text-foreground uppercase tracking-wider">
            {t('dashboard.aiInsight')}
          </span>
        </div>
        <div className="min-h-[3.5rem]">
          <AnimatePresence mode="wait" initial={false}>
            <motion.p
              key={tipIndex}
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              transition={{ duration: 0.2 }}
              className="text-sm text-foreground/90 leading-relaxed"
            >
              {displayedText}
              {isTyping && <span className="inline-block w-0.5 h-4 bg-primary ml-0.5 animate-pulse align-text-bottom" />}
            </motion.p>
          </AnimatePresence>
        </div>
        <button
          onClick={() => navigate('/ai')}
          className="mt-3 flex items-center gap-1.5 text-xs font-medium text-primary hover:text-primary/80 transition-colors group/btn focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none rounded px-1 py-0.5"
        >
          {t('dashboard.askAI')}
          <ArrowRight size={12} className="transition-transform group-hover/btn:translate-x-0.5" />
        </button>
      </div>
    </motion.div>
  );
}
