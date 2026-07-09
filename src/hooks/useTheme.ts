import { useLayoutEffect } from 'react';
import { useAuthStore } from '../stores/authStore';

export function useTheme() {
  const { profile } = useAuthStore();

  // useLayoutEffect (rather than useEffect) applies the theme class before the
  // browser paints, which avoids a flash of the wrong theme (FOUC) on load
  // and on theme switches.
  useLayoutEffect(() => {
    const theme = profile?.theme || 'SYSTEM';
    const root = document.documentElement;

    const apply = (prefersDark: boolean) => {
      if (theme === 'SYSTEM') {
        root.classList.toggle('dark', prefersDark);
        root.classList.toggle('light', !prefersDark);
      } else {
        root.classList.toggle('dark', theme === 'DARK');
        root.classList.toggle('light', theme === 'LIGHT');
      }
    };

    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    apply(mq.matches);

    if (theme === 'SYSTEM') {
      const handler = (e: MediaQueryListEvent) => apply(e.matches);
      mq.addEventListener('change', handler);
      return () => mq.removeEventListener('change', handler);
    }
  }, [profile?.theme]);

  const setTheme = async (theme: 'DARK' | 'LIGHT' | 'SYSTEM') => {
    const { profileApi } = await import('../api/profile');
    const updated = await profileApi.update({ theme });
    useAuthStore.getState().updateProfile(updated);
  };

  return { theme: profile?.theme || 'SYSTEM', setTheme };
}
