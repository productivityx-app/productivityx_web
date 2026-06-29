export const animationClassNames = {
  fadeIn: 'animate-fade-in',
  fadeInUp: 'animate-fade-in-up',
  fadeInDown: 'animate-fade-in-down',
  fadeInScale: 'animate-fade-in-scale',
  slideInLeft: 'animate-slide-in-left',
  slideInRight: 'animate-slide-in-right',
  slideUp: 'animate-slide-up',
  scaleIn: 'animate-scale-in',
  bounceIn: 'animate-bounce-in',
  shimmer: 'animate-shimmer',
  notificationSlide: 'animate-notification-slide',
} as const;

export const animationDuration = {
  instant: 'var(--duration-instant)',
  fast: 'var(--duration-fast)',
  normal: 'var(--duration-normal)',
  slow: 'var(--duration-slow)',
  slower: 'var(--duration-slower)',
} as const;

export const animationEase = {
  out: 'var(--ease-out)',
  inOut: 'var(--ease-in-out)',
  spring: 'var(--ease-spring)',
} as const;
