import type { Variants, Transition, TargetAndTransition } from 'framer-motion';

export const transitions = {
  fast: { duration: 0.15, ease: [0, 0, 0.2, 1] } satisfies Transition,
  normal: { duration: 0.25, ease: [0, 0, 0.2, 1] } satisfies Transition,
  slow: { duration: 0.35, ease: [0, 0, 0.2, 1] } satisfies Transition,
  slower: { duration: 0.5, ease: [0, 0, 0.2, 1] } satisfies Transition,
  spring: { type: 'spring', stiffness: 400, damping: 25 } satisfies Transition,
  springGentle: { type: 'spring', stiffness: 200, damping: 20 } satisfies Transition,
  springSnap: { type: 'spring', stiffness: 600, damping: 30 } satisfies Transition,
} as const;

export const pageTransition: Record<string, Variants> = {
  fadeSlideUp: {
    initial: { opacity: 0, y: 12 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -12 },
  },
  slideLeft: {
    initial: { opacity: 0, x: 30 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -30 },
  },
  slideRight: {
    initial: { opacity: 0, x: -30 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: 30 },
  },
  scale: {
    initial: { opacity: 0, scale: 0.92 },
    animate: { opacity: 1, scale: 1 },
    exit: { opacity: 0, scale: 0.92 },
  },
};

export const pageTransitionConfig = {
  default: pageTransition.fadeSlideUp,
  slideLeft: pageTransition.slideLeft,
  slideRight: pageTransition.slideRight,
  modal: pageTransition.scale,
};

export const stagger: Record<string, Variants> = {
  container: {
    initial: {},
    animate: {
      transition: {
        staggerChildren: 0.05,
        delayChildren: 0.1,
      },
    },
  },
  containerFast: {
    initial: {},
    animate: {
      transition: {
        staggerChildren: 0.03,
        delayChildren: 0.05,
      },
    },
  },
  containerSlow: {
    initial: {},
    animate: {
      transition: {
        staggerChildren: 0.08,
        delayChildren: 0.15,
      },
    },
  },
  item: {
    initial: { opacity: 0, y: 12 },
    animate: { opacity: 1, y: 0 },
  },
  itemFade: {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
  },
  itemScale: {
    initial: { opacity: 0, scale: 0.9 },
    animate: { opacity: 1, scale: 1 },
  },
};

export const micro: Record<string, TargetAndTransition> = {
  buttonPress: { scale: 0.97 },
  buttonTap: { scale: 0.95 },
  cardHover: { scale: 1.02, y: -2 },
  cardTap: { scale: 0.98 },
  iconHover: { scale: 1.1, rotate: 5 },
  iconTap: { scale: 0.9 },
  rowHover: { backgroundColor: 'var(--elevate-1)' },
};

export const microTransition: Record<string, Transition> = {
  button: { type: 'spring', stiffness: 500, damping: 30 },
  card: { type: 'spring', stiffness: 300, damping: 20 },
  icon: { type: 'spring', stiffness: 400, damping: 15 },
  default: transitions.fast,
};

export const loading: Record<string, Variants> = {
  shimmer: {
    initial: { backgroundPosition: '-200% 0' },
    animate: { backgroundPosition: '200% 0' },
  },
  skeleton: {
    initial: { opacity: 0.5 },
    animate: { opacity: [0.5, 1, 0.5] },
  },
  spinner: {
    initial: { rotate: 0 },
    animate: { rotate: 360 },
  },
  progress: {
    initial: { scaleX: 0 },
    animate: { scaleX: 1 },
  },
  skeletonList: {
    animate: {
      transition: { staggerChildren: 0.05 },
    },
  },
  skeletonListItem: {
    initial: { opacity: 0, y: 8 },
    animate: { opacity: 0.5, y: 0 },
  },
};

export const feedback: Record<string, Variants> = {
  checkmark: {
    initial: { pathLength: 0, opacity: 0 },
    animate: { pathLength: 1, opacity: 1 },
  },
  errorShake: {
    initial: { x: 0 },
    animate: { x: [0, -4, 4, -4, 4, 0] },
  },
  toastSlideIn: {
    initial: { opacity: 0, x: 80, scale: 0.95 },
    animate: { opacity: 1, x: 0, scale: 1 },
    exit: { opacity: 0, x: 80, scale: 0.95 },
  },
  confetti: {
    initial: { opacity: 0, scale: 0, y: 0 },
    animate: { opacity: [0, 1, 0], scale: [0, 1, 0.5], y: [0, -60, -120] },
  },
};

export const text: Record<string, Variants> = {
  typing: {
    initial: { width: '0%' },
    animate: { width: '100%' },
  },
  fadeIn: {
    initial: { opacity: 0, y: 8 },
    animate: { opacity: 1, y: 0 },
  },
  characterContainer: {
    animate: {
      transition: { staggerChildren: 0.03, delayChildren: 0.1 },
    },
  },
  characterItem: {
    initial: { opacity: 0, y: 20, rotateX: -90 },
    animate: { opacity: 1, y: 0, rotateX: 0 },
  },
  wordContainer: {
    animate: {
      transition: { staggerChildren: 0.05, delayChildren: 0.1 },
    },
  },
  wordItem: {
    initial: { opacity: 0, y: 12 },
    animate: { opacity: 1, y: 0 },
  },
};

export const scroll: Record<string, Variants> = {
  fadeInUp: {
    initial: { opacity: 0, y: 24 },
    whileInView: { opacity: 1, y: 0 },
  },
  fadeInDown: {
    initial: { opacity: 0, y: -24 },
    whileInView: { opacity: 1, y: 0 },
  },
  fadeInLeft: {
    initial: { opacity: 0, x: -24 },
    whileInView: { opacity: 1, x: 0 },
  },
  fadeInRight: {
    initial: { opacity: 0, x: 24 },
    whileInView: { opacity: 1, x: 0 },
  },
  scaleIn: {
    initial: { opacity: 0, scale: 0.9 },
    whileInView: { opacity: 1, scale: 1 },
  },
};

export const scrollViewport = { once: true, margin: '-50px' } as const;

export function reducedMotionVariants<T extends Variants | TargetAndTransition>(
  variants: T,
  reduced: T,
): T {
  return reduced;
}

export const drag: Record<string, TargetAndTransition> = {
  kanbanCard: {
    boxShadow: '0 10px 30px -10px rgba(0,0,0,0.3)',
    scale: 1.05,
    rotate: 2,
    zIndex: 50,
  },
  sidebarResize: {
    cursor: 'col-resize',
  },
};

export const springConfig = {
  default: { type: 'spring' as const, stiffness: 300, damping: 25 },
  wobbly: { type: 'spring' as const, stiffness: 200, damping: 10 },
  smooth: { type: 'spring' as const, stiffness: 100, damping: 20 },
};
