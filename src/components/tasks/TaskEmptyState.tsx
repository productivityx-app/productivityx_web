import { useTranslation } from 'react-i18next';
import { CheckSquare, Plus, Filter } from 'lucide-react';
import EmptyState from '@/components/common/EmptyState';

interface Props {
  type?: 'empty' | 'overdue' | 'filtered';
  onAddTask?: () => void;
}

export default function TaskEmptyState({ type = 'empty', onAddTask }: Props) {
  const { t } = useTranslation();

  const config = {
    empty: {
      icon: CheckSquare,
      title: 'No tasks yet',
      description: 'Add your first task and start getting things done. Stay organized and track your progress.',
      actions: onAddTask ? [
        { label: 'Add your first task', icon: Plus, onClick: onAddTask },
      ] : undefined,
    },
    overdue: {
      icon: CheckSquare,
      title: 'All caught up!',
      description: 'No overdue tasks. You\'re on top of everything — keep up the great work!',
      actions: undefined,
    },
    filtered: {
      icon: Filter,
      title: 'No matching tasks',
      description: 'No tasks match your current filters. Try adjusting your search or filter criteria.',
      actions: undefined,
    },
  };

  const c = config[type];

  return (
    <EmptyState
      icon={c.icon}
      title={type === 'overdue' ? 'All caught up!' : type === 'empty' ? 'No tasks yet' : 'No matching tasks'}
      description={c.description}
      gradient="tasks"
      secondaryIcon={type === 'empty' ? Plus : undefined}
      actions={c.actions}
    />
  );
}
