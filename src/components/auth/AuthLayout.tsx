import { motion } from 'framer-motion';
import { Zap, ShieldCheck } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useIsMobile } from '@/hooks/use-mobile';

interface Props {
  children: React.ReactNode;
  title: string;
  subtitle?: string;
}

export default function AuthLayout({ children, title, subtitle }: Props) {
  const { t } = useTranslation();
  const isMobile = useIsMobile();

  return (
    <div className="min-h-screen flex bg-background">
      {/* Left brand panel */}
      {!isMobile && (
        <div className="hidden lg:flex w-1/2 relative overflow-hidden bg-gradient-to-br from-primary/[0.08] via-primary/[0.03] to-background">
          <div className="absolute inset-0">
            <div
              className="absolute inset-0 opacity-[0.04]"
              style={{
                backgroundImage: `
                  radial-gradient(circle at 20% 50%, hsl(var(--primary)) 0%, transparent 50%),
                  radial-gradient(circle at 80% 20%, hsl(var(--primary)) 0%, transparent 50%),
                  radial-gradient(circle at 50% 80%, hsl(var(--primary)) 0%, transparent 50%)
                `,
                animation: 'gradientShift 12s ease infinite',
              }}
            />
            <div
              className="absolute inset-0 opacity-[0.02]"
              style={{
                backgroundImage: `
                  linear-gradient(30deg, hsl(var(--primary)) 12%, transparent 12.5%, transparent 87%, hsl(var(--primary)) 87.5%),
                  linear-gradient(150deg, hsl(var(--primary)) 12%, transparent 12.5%, transparent 87%, hsl(var(--primary)) 87.5%),
                  linear-gradient(30deg, hsl(var(--primary)) 12%, transparent 12.5%, transparent 87%, hsl(var(--primary)) 87.5%),
                  linear-gradient(150deg, hsl(var(--primary)) 12%, transparent 12.5%, transparent 87%, hsl(var(--primary)) 87.5%)
                `,
                backgroundSize: '80px 140px',
                backgroundPosition: '0 0, 0 0, 40px 70px, 40px 70px',
              }}
            />
          </div>

          <div className="relative z-10 flex flex-col justify-between p-16 w-full">
            <div>
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="flex items-center gap-3"
              >
                <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center shadow-lg shadow-primary/30">
                  <Zap size={20} className="text-primary-foreground" />
                </div>
                <span className="text-lg font-bold text-foreground">ProductivityX</span>
              </motion.div>
            </div>

            <div className="space-y-6">
              <motion.blockquote
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="text-2xl font-medium text-foreground/80 italic leading-relaxed"
              >
                "Your productivity, elevated."
              </motion.blockquote>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
                className="flex items-center gap-2 text-xs text-muted-foreground/50"
              >
                <ShieldCheck size={12} />
                {t('auth.secureAuth')}
              </motion.div>
            </div>
          </div>
        </div>
      )}

      {/* Right form panel */}
      <div className="flex-1 flex items-center justify-center p-4 sm:p-8 relative">
        {/* Mobile header */}
        {isMobile && (
          <div className="absolute top-6 left-6 flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
              <Zap size={16} className="text-primary-foreground" />
            </div>
            <span className="text-sm font-bold text-foreground">ProductivityX</span>
          </div>
        )}

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-sm"
        >
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold text-foreground">{title}</h1>
            {subtitle && (
              <p className="text-sm text-muted-foreground mt-1.5">{subtitle}</p>
            )}
          </div>

          <div className="bg-card border border-border/60 rounded-2xl p-6 shadow-lg shadow-black/5 backdrop-blur-sm">
            {children}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
