import { useTranslation } from 'react-i18next';
import { CalendarDays, Plus } from 'lucide-react';
import EmptyState from '@/components/common/EmptyState';

interface Props {
  type?: 'month' | 'week' | 'day' | 'filtered';
  onAddEvent?: () => void;
}

export default function CalendarEmptyState({ type = 'month', onAddEvent }: Props) {
  const { t } = useTranslation();

  const config = {
    month: { title: 'Your schedule is clear', desc: 'No events this month. Take a breather or schedule something!', cta: 'Add event' },
    week: { title: 'A quiet week ahead', desc: 'Nothing scheduled for this week.', cta: undefined },
    day: { title: 'A free day', desc: 'No events on this day. Enjoy the calm!', cta: undefined },
    filtered: { title: 'No matching events', desc: 'No events match your current filters.', cta: undefined },
  };

  const c = config[type];

  return (
    <EmptyState
      icon={CalendarDays}
      title={c.title}
      description={c.desc}
      gradient="calendar"
      secondaryIcon={c.cta ? Plus : undefined}
      actions={c.cta && onAddEvent ? [{ label: c.cta, icon: Plus, onClick: onAddEvent }] : undefined}
      size="sm"
    />
  );
}
