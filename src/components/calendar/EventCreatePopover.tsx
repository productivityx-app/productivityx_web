import { useState, useRef, useEffect } from 'react';
import { Plus, Loader2 } from 'lucide-react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { eventsApi } from '@/api/events';
import { useTranslation } from 'react-i18next';

interface Props {
  date: Date;
  startTime?: string;
  endTime?: string;
  onCreated?: () => void;
}

export default function EventCreatePopover({ date, startTime = '09:00', endTime = '10:00', onCreated }: Props) {
  const { t } = useTranslation();
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => { if (open && inputRef.current) inputRef.current.focus(); }, [open]);

  const mutation = useMutation({
    mutationFn: () => eventsApi.create({
      title: title.trim(),
      color: '#6366F1',
      allDay: false,
      startAt: new Date(`${format(date, 'yyyy-MM-dd')}T${startTime}:00`).toISOString(),
      endAt: new Date(`${format(date, 'yyyy-MM-dd')}T${endTime}:00`).toISOString(),
    }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['events'] }); toast.success(t('calendar.createSuccess')); setTitle(''); setOpen(false); onCreated?.(); },
  });

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-accent/30 rounded-lg"
      >
        <Plus size={14} className="text-muted-foreground" />
      </button>
    );
  }

  return (
    <div className="absolute inset-x-0 top-0 z-10 p-1">
      <div className="flex items-center gap-1 bg-background border border-border rounded-lg shadow-sm">
        <input
          ref={inputRef}
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter' && title.trim()) mutation.mutate(); if (e.key === 'Escape') setOpen(false); }}
          onBlur={() => { if (!title.trim()) setOpen(false); }}
          placeholder={t('calendar.titlePlaceholder')}
          className="flex-1 bg-transparent px-2 py-1 text-xs text-foreground placeholder:text-muted-foreground/40 outline-none"
        />
        <button
          onClick={() => mutation.mutate()}
          disabled={!title.trim() || mutation.isPending}
          className="p-1 rounded text-muted-foreground hover:text-primary disabled:opacity-40"
        >
          {mutation.isPending ? <Loader2 size={10} className="animate-spin" /> : <Plus size={10} />}
        </button>
      </div>
    </div>
  );
}
