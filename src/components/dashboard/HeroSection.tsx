import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { format } from 'date-fns';
import { getDateFnsLocale } from '@/i18n/dateLocales';
import { useAuthStore } from '@/stores/authStore';
import FocusOfDay from './FocusOfDay';
import { transitions } from '@/lib/animations';

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return { emoji: '🌅', key: 'morning' };
  if (h < 17) return { emoji: '☀️', key: 'afternoon' };
  return { emoji: '🌆', key: 'evening' };
}

export default function HeroSection() {
  const { t } = useTranslation();
  const { profile } = useAuthStore();
  const { emoji, key } = getGreeting();
  const locale = getDateFnsLocale();
  const today = new Date();

  return (
    <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-card via-card/95 to-card border border-border p-6 min-h-[180px]">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          className="absolute -top-1/3 -left-1/4 w-[500px] h-[500px] rounded-full bg-primary/[0.04] blur-[100px]"
          animate={{ x: [0, 30, -20, 0], y: [0, -20, 30, 0] }}
          transition={{ duration: 15, repeat: Infinity, ease: 'easeInOut' }}
        />
        <motion.div
          className="absolute -bottom-1/3 -right-1/4 w-[400px] h-[400px] rounded-full bg-violet-500/[0.04] blur-[100px]"
          animate={{ x: [0, -30, 20, 0], y: [0, 20, -30, 0] }}
          transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut' }}
        />
        <motion.div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] rounded-full bg-amber-500/[0.03] blur-[80px]"
          animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.6, 0.3] }}
          transition={{ duration: 18, repeat: Infinity, ease: 'easeInOut' }}
        />
      </div>
      <div className="relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ ...transitions.slow }}
        >
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="flex items-center gap-3 mb-1">
                <span className="text-3xl">{emoji}</span>
                <h1 className="text-2xl font-bold text-foreground tracking-tight">
                  {t(`dashboard.greeting.${key}`, { name: profile?.firstName || t('dashboard.greetingFallback', { name: '' }) })}
                </h1>
              </div>
              <p className="text-sm text-muted-foreground mb-3">
                {format(today, 'EEEE, MMMM d, yyyy', { locale })}
              </p>
              <FocusOfDay />
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
