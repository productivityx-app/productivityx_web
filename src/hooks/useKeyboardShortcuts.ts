import { useEffect, useCallback } from 'react';
import { useUIStore } from '@/stores/uiStore';

export interface ShortcutDef {
  key: string;
  ctrl?: boolean;
  shift?: boolean;
  meta?: boolean;
  alt?: boolean;
  label: string;
  action: () => void;
}

export function useKeyboardShortcuts(shortcuts: ShortcutDef[]) {
  const setSearchOpen = useUIStore((s) => s.setSearchOpen);

  const handler = useCallback((e: KeyboardEvent) => {
    const target = e.target as HTMLElement;
    const isInput = target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable;

    if (e.key === '/' && !isInput) {
      e.preventDefault();
      setSearchOpen(true);
      return;
    }

    for (const s of shortcuts) {
      const matchCtrl = s.ctrl ? (e.ctrlKey || e.metaKey) : true;
      const matchShift = s.shift ? e.shiftKey : !e.shiftKey;
      const matchMeta = s.meta ? e.metaKey : true;
      const matchAlt = s.alt ? e.altKey : !e.altKey;
      if (e.key.toLowerCase() === s.key.toLowerCase() && matchCtrl && matchShift && matchMeta && matchAlt) {
        e.preventDefault();
        s.action();
        return;
      }
    }
  }, [shortcuts, setSearchOpen]);

  useEffect(() => {
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [handler]);
}
