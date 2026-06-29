import { create } from 'zustand';

interface UIState {
  sidebarOpen: boolean;
  sidebarCollapsed: boolean;
  sidebarWidth: number;
  searchOpen: boolean;
  commandPaletteOpen: boolean;
  isOnline: boolean;
  showOnboarding: boolean;
  activeSpotlight: string | null;
  toggleSidebar: () => void;
  setSidebarOpen: (open: boolean) => void;
  setSidebarCollapsed: (collapsed: boolean) => void;
  toggleSidebarCollapsed: () => void;
  setSidebarWidth: (width: number) => void;
  toggleSearch: () => void;
  setSearchOpen: (open: boolean) => void;
  setCommandPaletteOpen: (open: boolean) => void;
  toggleCommandPalette: () => void;
  setOnline: (online: boolean) => void;
  setShowOnboarding: (show: boolean) => void;
  setActiveSpotlight: (key: string | null) => void;
}

const savedCollapsed = localStorage.getItem('sidebarCollapsed') === 'true';
const savedWidth = Math.max(200, Math.min(350, parseInt(localStorage.getItem('sidebarWidth') || '240')));

export const useUIStore = create<UIState>()((set) => ({
  sidebarOpen: false,
  sidebarCollapsed: savedCollapsed,
  sidebarWidth: savedWidth,
  searchOpen: false,
  commandPaletteOpen: false,
  isOnline: navigator.onLine,
  showOnboarding: false,
  activeSpotlight: null,
  toggleSidebar: () => set((s) => ({ sidebarOpen: !s.sidebarOpen })),
  setSidebarOpen: (open) => set({ sidebarOpen: open }),
  setSidebarCollapsed: (collapsed) => {
    localStorage.setItem('sidebarCollapsed', String(collapsed));
    set({ sidebarCollapsed: collapsed });
  },
  toggleSidebarCollapsed: () => set((s) => {
    const next = !s.sidebarCollapsed;
    localStorage.setItem('sidebarCollapsed', String(next));
    return { sidebarCollapsed: next };
  }),
  setSidebarWidth: (width) => {
    const clamped = Math.max(200, Math.min(350, width));
    localStorage.setItem('sidebarWidth', String(clamped));
    set({ sidebarWidth: clamped });
  },
  toggleSearch: () => set((s) => ({ searchOpen: !s.searchOpen })),
  setSearchOpen: (open) => set({ searchOpen: open }),
  setCommandPaletteOpen: (open) => set({ commandPaletteOpen: open }),
  toggleCommandPalette: () => set((s) => ({ commandPaletteOpen: !s.commandPaletteOpen })),
  setOnline: (isOnline) => set({ isOnline }),
  setShowOnboarding: (show) => set({ showOnboarding: show }),
  setActiveSpotlight: (key) => set({ activeSpotlight: key }),
}));
