import { useLocation, useNavigate } from 'react-router-dom';
import { ChevronRight, Home } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { cn } from '@/lib/utils';

const segmentLabels: Record<string, string> = {
  notes: 'nav.notes',
  tasks: 'nav.tasks',
  calendar: 'nav.calendar',
  pomodoro: 'nav.pomodoro',
  ai: 'nav.aiAssistant',
  search: 'nav.search',
  settings: 'nav.settings',
  new: 'breadcrumb.new',
  trash: 'breadcrumb.trash',
  history: 'breadcrumb.history',
  events: 'breadcrumb.events',
  conversations: 'breadcrumb.conversations',
};

export default function BreadcrumbNav() {
  const { t } = useTranslation();
  const { pathname } = useLocation();
  const navigate = useNavigate();

  const segments = pathname.split('/').filter(Boolean);

  if (segments.length === 0) return null;

  const crumbs = segments.map((segment, i) => {
    const path = '/' + segments.slice(0, i + 1).join('/');
    const labelKey = segmentLabels[segment];
    const label = labelKey ? t(labelKey) : segment;
    return { label, path, isLast: i === segments.length - 1 };
  });

  return (
    <nav className="flex items-center gap-1 text-sm text-muted-foreground min-w-0">
      <button
        onClick={() => navigate('/')}
        className="p-1 rounded hover:text-foreground hover:bg-accent transition-colors flex-shrink-0 focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
      >
        <Home size={14} />
      </button>
      {crumbs.map((crumb) => (
        <div key={crumb.path} className="flex items-center gap-1 min-w-0">
          <ChevronRight size={14} className="flex-shrink-0" />
          {crumb.isLast ? (
            <span className="text-foreground font-medium truncate">{crumb.label}</span>
          ) : (
            <button
              onClick={() => navigate(crumb.path)}
              className="truncate hover:text-foreground transition-colors focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none rounded px-1"
            >
              {crumb.label}
            </button>
          )}
        </div>
      ))}
    </nav>
  );
}
