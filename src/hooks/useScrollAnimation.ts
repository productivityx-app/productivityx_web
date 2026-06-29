import { useInView } from 'framer-motion';
import { useRef } from 'react';

interface ScrollAnimationOptions {
  once?: boolean;
  margin?: string;
  amount?: 'some' | 'all' | number;
}

export function useScrollAnimation(options: ScrollAnimationOptions = {}) {
  const { once = true, margin = '-50px', amount = 'some' } = options;
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once, margin: margin as `${number}px`, amount });

  return { ref, isInView };
}

export function useStaggerScroll(options: ScrollAnimationOptions = {}) {
  const { ref, isInView } = useScrollAnimation(options);

  const variants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { staggerChildren: 0.05, delayChildren: 0.1 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 12 },
    visible: { opacity: 1, y: 0 },
  };

  return { ref, isInView, variants, itemVariants };
}
