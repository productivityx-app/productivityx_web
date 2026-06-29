import { MotionConfig, MotionGlobalConfig } from 'framer-motion';
import { type ReactNode, useEffect, useState } from 'react';

MotionGlobalConfig.skipAnimations = false;

export function MotionProvider({ children }: { children: ReactNode }) {
  const [reducedMotion, setReducedMotion] = useState(() => {
    if (typeof window === 'undefined') return false;
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  });

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    const handler = (e: MediaQueryListEvent) => {
      setReducedMotion(e.matches);
      MotionGlobalConfig.skipAnimations = e.matches;
    };
    mq.addEventListener('change', handler);
    MotionGlobalConfig.skipAnimations = mq.matches;
    return () => mq.removeEventListener('change', handler);
  }, []);

  return (
    <MotionConfig reducedMotion={reducedMotion ? 'always' : 'never'} transition={{ type: 'tween', duration: 0.2, ease: [0, 0, 0.2, 1] }}>
      {children}
    </MotionConfig>
  );
}
