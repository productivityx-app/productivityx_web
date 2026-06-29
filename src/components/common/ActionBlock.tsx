import { useTranslation } from 'react-i18next';
import { CheckSquare, FileText, CalendarDays, Plus } from 'lucide-react';
import { toast } from 'sonner';

interface ActionData {
  type: 'CREATE_TASK' | 'CREATE_NOTE' | 'ADD_EVENT';
  title: string;
  content?: string;
  priority?: string;
  dueDate?: string;
  start?: string;
  duration?: string;
}

export default function ActionBlock({ data }: { data: ActionData }) {
  const { t } = useTranslation();
  const handleAction = async () => {
    try {
      if (data.type === 'CREATE_TASK') {
        const { tasksApi } = await import('../../api/tasks');
        await tasksApi.create({ title: data.title, priority: data.priority as any, dueDate: data.dueDate });
        toast.success(t('actionBlock.taskCreated'));
      } else if (data.type === 'CREATE_NOTE') {
        const { notesApi } = await import('../../api/notes');
        await notesApi.create({ title: data.title, content: data.content });
        toast.success(t('actionBlock.noteCreated'));
      } else if (data.type === 'ADD_EVENT') {
        const { eventsApi } = await import('../../api/events');
        const now = new Date();
        await eventsApi.create({
          title: data.title,
          startAt: data.start || now.toISOString(),
          endAt: new Date(now.getTime() + 3600000).toISOString(),
        });
        toast.success(t('actionBlock.eventAdded'));
      }
    } catch {
      toast.error(t('actionBlock.failedToCreate'));
    }
  };

  const config = {
    CREATE_TASK: { icon: CheckSquare, label: t('actionBlock.addTask'), color: 'text-green-400' },
    CREATE_NOTE: { icon: FileText, label: t('actionBlock.addNote'), color: 'text-blue-400' },
    ADD_EVENT: { icon: CalendarDays, label: t('actionBlock.addEvent'), color: 'text-purple-400' },
  };

  const cfg = config[data.type];

  return (
    <div className="flex items-center gap-3 p-3 bg-card border border-border rounded-xl mt-2">
      <cfg.icon size={16} className={cfg.color} />
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-foreground truncate">{data.title}</p>
      </div>
      <button
        onClick={handleAction}
        className="flex items-center gap-1 px-3 py-1.5 bg-primary text-primary-foreground rounded-lg text-xs font-medium hover:bg-primary/90 transition-colors"
      >
        <Plus size={12} />
        {cfg.label}
      </button>
    </div>
  );
}
