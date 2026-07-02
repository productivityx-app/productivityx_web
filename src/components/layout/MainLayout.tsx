import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useEffect, useMemo } from 'react';
import {
  Menu, WifiOff, LayoutDashboard, FileText, CheckSquare,
  CalendarDays, Timer, Sparkles, Search, Settings, LogOut,
  MoreHorizontal, Play, Pause,
} from 'lucide-react';
import Sidebar from './Sidebar';
import BreadcrumbNav from './BreadcrumbNav';
import CommandPalette from './CommandPalette';
import { useUIStore } from '@/stores/uiStore';
import { useAuthStore } from '@/stores/authStore';
import { usePomodoroStore } from '@/stores/pomodoroStore';
import { useKeyboardShortcuts, ShortcutDef } from '@/hooks/useKeyboardShortcuts';
import SearchModal from '@/components/search/SearchModal';
import { Sheet, SheetContent } from '@/components/ui/sheet';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';
import { useTranslation } from 'react-i18next';

import { useIsMobile } from '@/hooks/use-mobile';

const bottomNavItems = [
  { icon: LayoutDashboard, labelKey: 'nav.dashboard', path: '/' },
  { icon: FileText, labelKey: 'nav.notes', path: '/notes' },
  { icon: CheckSquare, labelKey: 'nav.tasks', path: '/tasks' },
  { icon: CalendarDays, labelKey: 'nav.calendar', path: '/calendar' },
];

const moreItems = [
  { icon: Timer, labelKey: 'nav.pomodoro', path: '/pomodoro' },
  { icon: Sparkles, labelKey: 'nav.aiAssistant', path: '/ai' },
  { icon: Search, labelKey: 'nav.search', path: '/search' },
  { icon: Settings, labelKey: 'nav.settings', path: '/settings' },
];

function MobileBottomNav() {
  const { t } = useTranslation();
  const { pathname } = useLocation();
  const navigate = useNavigate();

  const isActive = (path: string) => {
    if (path === '/') return pathname === '/';
    return pathname.startsWith(path);
  };

  return (
    <nav className="fixed bottom-0 inset-x-0 z-50 lg:hidden bg-card/90 backdrop-blur-lg border-t border-border safe-area-bottom">
      <div className="flex items-center justify-around h-14 px-2">
        {bottomNavItems.map(({ icon: Icon, labelKey, path }) => (
          <button
            key={path}
            onClick={() => navigate(path)}
            aria-label={t(labelKey)}
            className={cn(
              'flex flex-col items-center justify-center gap-0.5 px-3 py-1.5 rounded-lg transition-colors min-w-0 flex-1 focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none',
              isActive(path)
                ? 'text-primary'
                : 'text-muted-foreground hover:text-foreground',
            )}
          >
            <Icon size={18} />
            <span className="text-[10px] font-medium">{t(labelKey)}</span>
          </button>
        ))}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              className={cn(
                'flex flex-col items-center justify-center gap-0.5 px-3 py-1.5 rounded-lg transition-colors min-w-0 flex-1 min-h-[44px] min-w-[44px] focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none text-muted-foreground',
              )}
            >
              <MoreHorizontal size={18} />
              <span className="text-[10px] font-medium">{t('nav.more')}</span>
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent side="top" align="end" className="w-48 mb-2">
            {moreItems.map(({ icon: Icon, labelKey, path }) => (
              <DropdownMenuItem key={path} onSelect={() => navigate(path)}>
                <Icon className="mr-2 h-4 w-4" />
                <span>{t(labelKey)}</span>
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </nav>
  );
}

function PomodoroMiniIndicator() {
  const { activeSession, isRunning, isPaused, timeRemaining } = usePomodoroStore();
  const navigate = useNavigate();

  if (!activeSession || !isRunning) return null;

  const minutes = Math.floor(timeRemaining / 60);
  const seconds = timeRemaining % 60;

  return (
    <button
      onClick={() => navigate('/pomodoro')}
      className="flex items-center gap-1.5 text-xs text-primary bg-primary/10 px-2.5 py-1 rounded-full hover:bg-primary/20 transition-colors flex-shrink-0"
      aria-label={`Pomodoro timer: ${minutes} minutes ${seconds} seconds remaining`}
    >
      {isPaused ? <Play size={10} /> : <Pause size={10} />}
      <span className="tabular-nums font-medium">{minutes}:{seconds.toString().padStart(2, '0')}</span>
    </button>
  );
}

function Header() {
  const { t } = useTranslation();
  const { setSidebarOpen, isOnline, toggleCommandPalette } = useUIStore();
  const { profile, user, logout } = useAuthStore();
  const navigate = useNavigate();
  const isMobile = useIsMobile();

  return (
    <header className="h-14 flex items-center gap-3 px-4 border-b border-border bg-card/50 backdrop-blur-sm flex-shrink-0 z-20">
      {isMobile && (
        <button
          className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
          onClick={() => setSidebarOpen(true)}
          aria-label="Toggle sidebar"
        >
          <Menu size={18} />
        </button>
      )}
      <div className="flex-1 min-w-0">
        <BreadcrumbNav />
      </div>
      <PomodoroMiniIndicator />
      {!isOnline && (
        <div className="flex items-center gap-1.5 text-xs text-warning bg-warning/10 px-2.5 py-1 rounded-full flex-shrink-0">
          <WifiOff size={12} />
          <span className="hidden sm:inline">{t('mainLayout.offline')}</span>
        </div>
      )}
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <button
              onClick={toggleCommandPalette}
              className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent transition-colors focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none hidden sm:block"
              aria-label="Search"
            >
              <Search size={16} />
            </button>
          </TooltipTrigger>
          <TooltipContent>{t('mainLayout.searchTooltip')}</TooltipContent>
        </Tooltip>
      </TooltipProvider>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary text-sm font-semibold hover:bg-primary/30 transition-colors flex-shrink-0 focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none" aria-label="User menu">
            {profile?.firstName?.[0] || profile?.fullName?.[0] || '?'}
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          <div className="px-2 py-1.5">
            <p className="text-sm font-medium text-foreground truncate">{profile?.fullName || t('nav.user')}</p>
            <p className="text-xs text-muted-foreground truncate">{user?.email || ''}</p>
          </div>
          <DropdownMenuSeparator />
          <DropdownMenuItem onSelect={() => navigate('/settings')}>
            <Settings className="mr-2 h-4 w-4" />
            <span>{t('nav.settings')}</span>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onSelect={() => logout()}>
            <LogOut className="mr-2 h-4 w-4" />
            <span>{t('mainLayout.logout')}</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </header>
  );
}

export default function MainLayout() {
  const {
    sidebarOpen, setSidebarOpen, searchOpen, setSearchOpen,
    commandPaletteOpen, setCommandPaletteOpen, setOnline,
  } = useUIStore();
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const isMobile = useIsMobile();

  useEffect(() => {
    const handleOnline = () => setOnline(true);
    const handleOffline = () => setOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => { window.removeEventListener('online', handleOnline); window.removeEventListener('offline', handleOffline); };
  }, [setOnline]);

  const shortcuts: ShortcutDef[] = useMemo(() => [
    { key: 'k', meta: true, label: 'Toggle command palette', action: () => setCommandPaletteOpen(true) },
    { key: 'b', ctrl: true, label: 'Toggle sidebar', action: () => useUIStore.getState().toggleSidebarCollapsed() },
    { key: 'n', ctrl: true, shift: true, label: 'New note', action: () => navigate('/notes/new') },
  ], [navigate, setCommandPaletteOpen]);

  useKeyboardShortcuts(shortcuts);

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[100] focus:px-4 focus:py-2 focus:bg-primary focus:text-primary-foreground focus:rounded-lg focus:text-sm focus:font-medium focus:shadow-lg"
      >
        Skip to main content
      </a>
      <div className="hidden lg:flex flex-shrink-0">
        <Sidebar />
      </div>

      <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
        <SheetContent side="left" className="p-0 w-72 bg-card border-r border-border">
          <Sidebar />
        </SheetContent>
      </Sheet>

      <div className="flex flex-col flex-1 min-w-0 relative">
        <Header />

        <main id="main-content" className="flex-1 overflow-y-auto">
          <Outlet />
        </main>

        <MobileBottomNav />
      </div>

      <SearchModal open={searchOpen} onClose={() => setSearchOpen(false)} />
      <CommandPalette open={commandPaletteOpen} onClose={() => setCommandPaletteOpen(false)} />
    </div>
  );
}
