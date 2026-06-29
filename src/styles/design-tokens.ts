export const colors = {
  bg: {
    base: '#0f1117',
    card: '#161922',
    elevated: '#1c1f2a',
  },
  primary: {
    base: '#6366f1',
    hover: '#818cf8',
    light: '#a5b4fc',
    gradient: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
  },
  semantic: {
    success: '#10b981',
    warning: '#f59e0b',
    info: '#0ea5e9',
    error: '#f43f5e',
  },
  glass: {
    card: 'rgba(22, 25, 34, 0.7)',
    elevated: 'rgba(28, 31, 42, 0.8)',
    border: 'rgba(255, 255, 255, 0.06)',
  },
  elevation: {
    surface: '0 1px 2px 0 rgba(0, 0, 0, 0.3)',
    raised: '0 4px 6px -1px rgba(0, 0, 0, 0.4), 0 2px 4px -2px rgba(0, 0, 0, 0.3)',
    floating: '0 10px 15px -3px rgba(0, 0, 0, 0.4), 0 4px 6px -4px rgba(0, 0, 0, 0.3)',
    overlay: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
  },
  light: {
    bg: { base: '#ffffff', card: '#f8f9fc', elevated: '#f1f3f8' },
    primary: { base: '#6366f1', hover: '#4f46e5' },
    glass: { card: 'rgba(255, 255, 255, 0.8)', elevated: 'rgba(255, 255, 255, 0.9)', border: 'rgba(0, 0, 0, 0.06)' },
  },
};

export const typography = {
  fontFamily: {
    sans: "'Inter', sans-serif",
    mono: "'JetBrains Mono', 'Fira Code', monospace",
  },
  weight: {
    normal: 400,
    medium: 500,
    semibold: 600,
    bold: 700,
  },
  heading: {
    letterSpacing: '-0.02em',
    lineHeight: 1.3,
  },
  body: {
    lineHeight: 1.6,
  },
  fluid: {
    xs: 'clamp(0.75rem, 0.7rem + 0.25vw, 0.875rem)',
    sm: 'clamp(0.875rem, 0.8rem + 0.3vw, 1rem)',
    base: 'clamp(1rem, 0.9rem + 0.4vw, 1.125rem)',
    lg: 'clamp(1.125rem, 1rem + 0.5vw, 1.25rem)',
    xl: 'clamp(1.25rem, 1.1rem + 0.6vw, 1.5rem)',
    '2xl': 'clamp(1.5rem, 1.3rem + 0.8vw, 1.875rem)',
    '3xl': 'clamp(1.875rem, 1.5rem + 1.2vw, 2.25rem)',
  },
};

export const animation = {
  duration: {
    instant: '0ms',
    fast: '150ms',
    normal: '250ms',
    slow: '350ms',
    slower: '500ms',
  },
  ease: {
    out: 'cubic-bezier(0, 0, 0.2, 1)',
    inOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
    spring: 'cubic-bezier(0.34, 1.56, 0.64, 1)',
  },
};
