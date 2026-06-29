import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { cn } from '@/lib/utils';

interface OnboardingStepProps {
  step: number;
  totalSteps: number;
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  onNext?: () => void;
  onBack?: () => void;
  onSkip?: () => void;
  nextLabel?: string;
  backLabel?: string;
  canGoNext?: boolean;
  hideBack?: boolean;
  hideSkip?: boolean;
  isLast?: boolean;
}

export default function OnboardingStep({
  step,
  totalSteps,
  title,
  subtitle,
  children,
  onNext,
  onBack,
  onSkip,
  nextLabel,
  backLabel,
  canGoNext = true,
  hideBack,
  hideSkip,
  isLast,
}: OnboardingStepProps) {
  const { t } = useTranslation();

  return (
    <motion.div
      key={step}
      initial={{ opacity: 0, x: 40 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -40 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
      className="flex flex-col"
    >
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          {[0, 1, 2, 3, 4].map((s) => (
            <div
              key={s}
              className={cn(
                'w-2 h-2 rounded-full transition-all duration-300',
                s === step ? 'w-6 bg-primary' :
                s < step ? 'bg-primary/40' : 'bg-border',
              )}
            />
          ))}
        </div>
        <span className="text-[11px] font-medium text-muted-foreground/50">
          Step {step + 1} of {totalSteps}
        </span>
      </div>

      <motion.h2
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="text-xl font-bold text-foreground mb-1.5"
      >
        {title}
      </motion.h2>

      {subtitle && (
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="text-sm text-muted-foreground/70 mb-6 leading-relaxed"
        >
          {subtitle}
        </motion.p>
      )}

      <div className="flex-1">{children}</div>

      <div className="flex items-center justify-between pt-6 mt-6 border-t border-border">
        <div className="flex items-center gap-2">
          {!hideBack && onBack && (
            <button
              onClick={onBack}
              className="px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-accent rounded-lg transition-colors"
            >
              {backLabel || t('common.back', 'Back')}
            </button>
          )}
          {!hideSkip && onSkip && step < totalSteps - 1 && (
            <button
              onClick={onSkip}
              className="px-4 py-2 text-sm font-medium text-muted-foreground/50 hover:text-muted-foreground transition-colors"
            >
              {t('common.skip', 'Skip')}
            </button>
          )}
        </div>
        <button
          onClick={onNext}
          disabled={!canGoNext}
          className={cn(
            'px-6 py-2 rounded-xl text-sm font-medium transition-all',
            isLast
              ? 'bg-primary text-primary-foreground hover:bg-primary/90 shadow-lg shadow-primary/20'
              : 'bg-primary text-primary-foreground hover:bg-primary/90 shadow-lg shadow-primary/20',
            !canGoNext && 'opacity-50 cursor-not-allowed',
          )}
        >
          {nextLabel || (isLast ? t('onboarding.getStarted', 'Get Started') : t('common.continue', 'Continue'))}
        </button>
      </div>
    </motion.div>
  );
}
