import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';

const providers = [
  { id: 'google', name: 'Google', icon: 'G', url: '/oauth2/authorization/google', bg: 'bg-[#4285F4]' },
  { id: 'github', name: 'GitHub', icon: 'GH', url: '/oauth2/authorization/github', bg: 'bg-[#333]' },
];

interface Props {
  onError?: (msg: string) => void;
}

export default function OAuthButtons({ onError }: Props) {
  const { t } = useTranslation();

  const handleClick = (provider: typeof providers[0]) => {
    window.location.href = provider.url;
  };

  return (
    <div className="space-y-2">
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-border" />
        </div>
        <div className="relative flex justify-center text-[10px] uppercase">
          <span className="bg-card px-2 text-muted-foreground/50">{t('auth.continueWith')}</span>
        </div>
      </div>

      <div className="flex gap-2">
        {providers.map((p, i) => (
          <motion.button
            key={p.id}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            onClick={() => handleClick(p)}
            className="flex-1 flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl border border-border bg-card text-sm text-muted-foreground hover:text-foreground hover:border-primary/30 hover:bg-accent/50 transition-all active:scale-[0.98]"
          >
            <div className={cn('w-5 h-5 rounded flex items-center justify-center text-[10px] font-bold text-white', p.bg)}>
              {p.icon}
            </div>
            {p.name}
          </motion.button>
        ))}
      </div>

      <p className="text-[10px] text-center text-muted-foreground/30">
        {t('auth.noPasswordStored')}
      </p>
    </div>
  );
}

import { cn } from '@/lib/utils';
