import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, FileText, CheckSquare, CalendarDays,
  Timer, Sparkles, Search, Settings, Zap, Moon, Sun, Monitor,
  PanelLeftClose,
} from 'lucide-react';
import { useAuthStore } from '@/stores/authStore';
import { useUIStore } from '@/stores/uiStore';
import { cn } from '@/lib/utils';
import { useTheme } from '@/hooks/useTheme';
import { useTranslation } from 'react-i18next';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from '@/components/ui/tooltip';
import { motion } from 'framer-motion';
import { useRef, useCallback } from 'react';

function ThemeToggle({ collapsed }: { collapsed: boolean }) {
  const { t } = useTranslation();
  const { theme, setTheme } = useTheme();

  const cycleTheme = () => {
    const next = theme === 'DARK' ? 'LIGHT' : theme === 'LIGHT' ? 'SYSTEM' : 'DARK';
    setTheme(next);
  };

  const icon = theme === 'DARK' ? Moon : theme === 'LIGHT' ? Sun : Monitor;
  const label = theme === 'DARK' ? t('settings.dark') : theme === 'LIGHT' ? t('settings.light') : t('settings.system');

  const btn = (
    <button
      onClick={cycleTheme}
      aria-label={label}
      className="flex items-center gap-3 px-3 py-2 rounded-lg transition-colors w-full text-muted-foreground hover:text-foreground hover:bg-accent focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
    >
      <div className="flex items-center justify-center w-5 h-5 flex-shrink-0">{icon === Moon ? <Moon size={16} /> : icon === Sun ? <Sun size={16} /> : <Monitor size={16} />}</div>
      {!collapsed && <span className="text-xs">{label}</span>}
    </button>
  );

  if (collapsed) {
    return (
      <Tooltip>
        <TooltipTrigger asChild>{btn}</TooltipTrigger>
        <TooltipContent side="right">{label}</TooltipContent>
      </Tooltip>
    );
  }
  return btn;
}

function NavItem({
  icon: Icon, label, path, collapsed, isActive, onClick,
}: {
  icon: React.ElementType; label: string; path: string; collapsed: boolean; isActive: boolean; onClick?: () => void;
}) {
  const content = (
    <div
      aria-label={label}
      className={cn(
        'flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors cursor-pointer focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none',
        isActive
          ? 'bg-primary/10 text-primary'
          : 'text-muted-foreground hover:text-foreground hover:bg-accent',
      )}
      tabIndex={0}
      role="link"
      onClick={onClick}
      onKeyDown={(e) => { if (e.key === 'Enter' && onClick) onClick(); }}
    >
      <div className="flex items-center justify-center w-5 h-5 flex-shrink-0">
        <Icon size={16} />
      </div>
      {!collapsed && <span className="truncate">{label}</span>}
      {isActive && !collapsed && <div className="ms-auto w-1.5 h-1.5 rounded-full bg-primary flex-shrink-0" />}
    </div>
  );

  if (collapsed) {
    return (
      <Tooltip>
        <TooltipTrigger asChild>{content}</TooltipTrigger>
        <TooltipContent side="right">{label}</TooltipContent>
      </Tooltip>
    );
  }
  return content;
}

export default function Sidebar() {
  const { t, i18n } = useTranslation();
  const location = useLocation();
  const navigate = useNavigate();
  const { profile } = useAuthStore();
  const { sidebarCollapsed, setSidebarCollapsed, toggleSidebarCollapsed, sidebarWidth, setSidebarWidth, setSearchOpen } = useUIStore();
  const resizeRef = useRef<HTMLDivElement>(null);
  const isRtl = i18n.dir() === 'rtl';

  const navGroups = [
    {
      key: 'workspace',
      label: t('nav.groups.workspace'),
      items: [
        { icon: LayoutDashboard, label: t('nav.dashboard'), path: '/' },
        { icon: FileText, label: t('nav.notes'), path: '/notes' },
        { icon: CheckSquare, label: t('nav.tasks'), path: '/tasks' },
      ],
    },
    {
      key: 'tools',
      label: t('nav.groups.tools'),
      items: [
        { icon: CalendarDays, label: t('nav.calendar'), path: '/calendar' },
        { icon: Timer, label: t('nav.pomodoro'), path: '/pomodoro' },
        { icon: Sparkles, label: t('nav.aiAssistant'), path: '/ai' },
      ],
    },
    {
      key: 'system',
      label: t('nav.groups.system'),
      items: [
        { icon: Search, label: t('nav.search'), path: '/search' },
        { icon: Settings, label: t('nav.settings'), path: '/settings' },
      ],
    },
  ];

  const isActive = (path: string) => {
    if (path === '/') return location.pathname === '/';
    return location.pathname.startsWith(path);
  };

  const handleResize = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    const startX = e.clientX;
    const startWidth = sidebarWidth;
    const handleMouseMove = (ev: MouseEvent) => {
      const delta = isRtl ? startX - ev.clientX : ev.clientX - startX;
      setSidebarWidth(startWidth + delta);
    };
    const handleMouseUp = () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    };
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
    document.body.style.cursor = 'col-resize';
    document.body.style.userSelect = 'none';
  }, [sidebarWidth, setSidebarWidth, isRtl]);

  return (
    <TooltipProvider delayDuration={300}>
      <motion.aside
        className="flex flex-col h-full bg-card border-border relative overflow-hidden"
        style={{ borderInlineEndWidth: 1, borderInlineEndStyle: 'solid' }}
        animate={{ width: sidebarCollapsed ? 72 : sidebarWidth }}
        transition={{ duration: 0.2, ease: 'easeInOut' }}
      >
        <div className={cn(
          'flex items-center h-14 px-4 border-b border-border flex-shrink-0',
          sidebarCollapsed ? 'justify-center' : 'justify-between',
        )}>
          {!sidebarCollapsed && (
            <div className="flex items-center gap-2 min-w-0">
              <div className="w-7 h-7 bg-primary rounded-lg flex items-center justify-center flex-shrink-0">
                <Zap size={14} className="text-primary-foreground" />
              </div>
              <span className="font-bold text-base tracking-tight text-foreground truncate">{t('nav.productivityX')}</span>
            </div>
          )}
          {sidebarCollapsed && (
            <Zap size={18} className="text-primary flex-shrink-0" />
          )}
          <button
            onClick={toggleSidebarCollapsed}
            aria-label="Collapse sidebar"
            className={cn(
              'p-1 rounded text-muted-foreground hover:text-foreground hover:bg-accent transition-colors flex-shrink-0 focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none',
              sidebarCollapsed && 'hidden',
            )}
          >
            <PanelLeftClose size={16} />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto px-2 py-2 space-y-4 custom-scrollbar">
          {navGroups.map((group) => (
            <div key={group.key}>
              {!sidebarCollapsed && (
                <p className="px-3 py-1 text-xs font-semibold text-muted-foreground/60 uppercase tracking-wider">
                  {group.label}
                </p>
              )}
              <div className="space-y-0.5">
                {group.items.map((item) => {
                  const active = isActive(item.path);
                  if (sidebarCollapsed) {
                    return (
                      <NavItem
                        key={item.path}
                        icon={item.icon}
                        label={item.label}
                        path={item.path}
                        collapsed
                        isActive={active}
                        onClick={() => {
                          if (item.path === '/search') { setSearchOpen(true); return; }
                          navigate(item.path);
                        }}
                      />
                    );
                  }
                  return (
                    <Link
                      key={item.path}
                      to={item.path}
                      onClick={() => { if (item.path === '/search') setSearchOpen(true); }}
                      className={cn(
                        'flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none',
                        active
                          ? 'bg-primary/10 text-primary'
                          : 'text-muted-foreground hover:text-foreground hover:bg-accent',
                      )}
                    >
                      <item.icon size={16} className="flex-shrink-0" />
                      <span className="truncate">{item.label}</span>
                      {active && <div className="ms-auto w-1.5 h-1.5 rounded-full bg-primary flex-shrink-0" />}
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        <div className={cn('p-3 border-t border-border flex-shrink-0 space-y-1', sidebarCollapsed && 'px-2')}>
          <ThemeToggle collapsed={sidebarCollapsed} />

          <div className={sidebarCollapsed ? 'flex justify-center' : ''}>
            {sidebarCollapsed ? (
              <Tooltip>
                <TooltipTrigger asChild>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <button className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-primary text-sm font-semibold hover:bg-primary/30 transition-colors focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none">
                        {profile?.firstName?.[0] || profile?.fullName?.[0] || '?'}
                      </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent side="right" align="start" className="w-48">
                      <div className="px-2 py-1.5 text-sm font-medium text-foreground truncate">{profile?.fullName || t('nav.user')}</div>
                      <div className="px-2 pb-1.5 text-xs text-muted-foreground">{profile?.language || 'EN'}</div>
                      <DropdownMenuItem onSelect={() => navigate('/settings')}>
                        {t('nav.settings')}
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TooltipTrigger>
                <TooltipContent side="right">{profile?.fullName || t('nav.user')}</TooltipContent>
              </Tooltip>
            ) : (
              <Link to="/settings" className="flex items-center gap-3 px-3 py-2 rounded-lg transition-colors hover:bg-accent">
                <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary text-sm font-semibold flex-shrink-0">
                  {profile?.firstName?.[0] || profile?.fullName?.[0] || '?'}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-foreground truncate">{profile?.fullName || t('nav.user')}</p>
                  <p className="text-xs text-muted-foreground truncate">{profile?.language || 'EN'}</p>
                </div>
              </Link>
            )}
          </div>
        </div>

        <div
          ref={resizeRef}
          onMouseDown={handleResize}
          className={cn(
            'absolute top-0 bottom-0 w-1 cursor-col-resize hover:bg-primary/30 active:bg-primary/50 transition-colors z-10',
            isRtl ? 'left-0' : 'right-0',
            sidebarCollapsed && 'hidden',
          )}
        />
      </motion.aside>
    </TooltipProvider>
  );
}
