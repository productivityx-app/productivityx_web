import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  CommandDialog,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandItem,
} from '@/components/ui/command';
import {
  LayoutDashboard,
  FileText,
  CheckSquare,
  CalendarDays,
  Timer,
  Sparkles,
  Search,
  Settings,
  Plus,
  Clock,
} from 'lucide-react';

interface Props {
  open: boolean;
  onClose: () => void;
}

export default function CommandPalette({ open, onClose }: Props) {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const handleSelect = (path: string) => {
    navigate(path);
    onClose();
  };

  return (
    <CommandDialog open={open} onOpenChange={onClose}>
      <CommandInput placeholder={t('commandPalette.placeholder')} />
      <CommandList>
        <CommandEmpty>{t('commandPalette.noResults')}</CommandEmpty>
        <CommandGroup heading={t('commandPalette.navigation')}>
          <CommandItem onSelect={() => handleSelect('/')}>
            <LayoutDashboard className="mr-2 h-4 w-4" />
            <span>{t('nav.dashboard')}</span>
          </CommandItem>
          <CommandItem onSelect={() => handleSelect('/notes')}>
            <FileText className="mr-2 h-4 w-4" />
            <span>{t('nav.notes')}</span>
          </CommandItem>
          <CommandItem onSelect={() => handleSelect('/tasks')}>
            <CheckSquare className="mr-2 h-4 w-4" />
            <span>{t('nav.tasks')}</span>
          </CommandItem>
          <CommandItem onSelect={() => handleSelect('/calendar')}>
            <CalendarDays className="mr-2 h-4 w-4" />
            <span>{t('nav.calendar')}</span>
          </CommandItem>
          <CommandItem onSelect={() => handleSelect('/pomodoro')}>
            <Timer className="mr-2 h-4 w-4" />
            <span>{t('nav.pomodoro')}</span>
          </CommandItem>
          <CommandItem onSelect={() => handleSelect('/ai')}>
            <Sparkles className="mr-2 h-4 w-4" />
            <span>{t('nav.aiAssistant')}</span>
          </CommandItem>
          <CommandItem onSelect={() => handleSelect('/search')}>
            <Search className="mr-2 h-4 w-4" />
            <span>{t('nav.search')}</span>
          </CommandItem>
          <CommandItem onSelect={() => handleSelect('/settings')}>
            <Settings className="mr-2 h-4 w-4" />
            <span>{t('nav.settings')}</span>
          </CommandItem>
        </CommandGroup>
        <CommandGroup heading={t('commandPalette.quickActions')}>
          <CommandItem onSelect={() => handleSelect('/notes/new')}>
            <Plus className="mr-2 h-4 w-4" />
            <span>{t('commandPalette.newNote')}</span>
          </CommandItem>
          <CommandItem onSelect={() => handleSelect('/tasks/new')}>
            <Plus className="mr-2 h-4 w-4" />
            <span>{t('commandPalette.newTask')}</span>
          </CommandItem>
          <CommandItem onSelect={() => handleSelect('/pomodoro/history')}>
            <Clock className="mr-2 h-4 w-4" />
            <span>{t('commandPalette.pomodoroHistory')}</span>
          </CommandItem>
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  );
}
