import { useMemo, useState } from 'react';
import { Search, CheckCircle2, XCircle, Clock } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { cn } from '@/lib/utils';
import { PomodoroSession } from '@/types';

interface Props {
  sessions: PomodoroSession[];
}

const TYPE_LABELS: Record<string, string> = {
  FOCUS: 'pomodoro.focus',
  SHORT_BREAK: 'pomodoro.shortBreak',
  LONG_BREAK: 'pomodoro.longBreak',
};

const TYPE_COLORS: Record<string, string> = {
  FOCUS: 'bg-red-500/10 text-red-500 border-red-500/20',
  SHORT_BREAK: 'bg-green-500/10 text-green-500 border-green-500/20',
  LONG_BREAK: 'bg-blue-500/10 text-blue-500 border-blue-500/20',
};

export default function SessionLog({ sessions }: Props) {
  const { t } = useTranslation();
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<'all' | 'completed' | 'interrupted'>('all');

  const filtered = useMemo(() => {
    return sessions.filter((s) => {
      if (filter === 'completed' && !s.completed) return false;
      if (filter === 'interrupted' && s.completed) return false;
      if (search) {
        const q = search.toLowerCase();
        const typeLabel = t(TYPE_LABELS[s.type] || '').toLowerCase();
        if (!typeLabel.includes(q) && !s.id.toLowerCase().includes(q)) return false;
      }
      return true;
    });
  }, [sessions, filter, search, t]);

  function formatDuration(seconds: number) {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    if (s === 0) return `${m}m`;
    if (m === 0) return `${s}s`;
    return `${m}m ${s}s`;
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={t('pomodoro.searchSessions')}
            className="w-full pl-9 pr-3 py-2 rounded-lg bg-accent/50 border border-border text-sm text-foreground placeholder:text-muted-foreground/40 focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all"
          />
        </div>
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value as typeof filter)}
          className="px-3 py-2 rounded-lg bg-accent/50 border border-border text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all"
        >
          <option value="all">{t('common.all')}</option>
          <option value="completed">{t('pomodoro.completed')}</option>
          <option value="interrupted">{t('pomodoro.interrupted')}</option>
        </select>
      </div>

      <div className="space-y-1 max-h-[400px] overflow-y-auto pr-1 custom-scrollbar">
        <AnimatePresence mode="popLayout">
          {filtered.length === 0 ? (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-sm text-muted-foreground/50 text-center py-8"
            >
              {t('pomodoro.noSessions')}
            </motion.p>
          ) : (
            filtered.map((session) => (
              <motion.div
                key={session.id}
                layout
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -5 }}
                className="flex items-center gap-3 px-3 py-2.5 rounded-lg border border-border/50 bg-card/50 hover:bg-accent/30 transition-colors"
              >
                <div className={`p-1 rounded-full ${session.completed ? 'text-green-500' : 'text-muted-foreground'}`}>
                  {session.completed ? <CheckCircle2 size={14} /> : <XCircle size={14} />}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className={cn('px-1.5 py-0.5 rounded text-[10px] font-medium border', TYPE_COLORS[session.type] || '')}>
                      {t(TYPE_LABELS[session.type] || '')}
                    </span>
                    {session.taskId && (
                      <span className="text-xs text-muted-foreground truncate">#{session.taskId.slice(0, 8)}</span>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2 text-xs text-muted-foreground shrink-0">
                  <Clock size={11} />
                  <span>{formatDuration(session.plannedDurationSeconds)}</span>
                </div>
                <div className="text-[10px] text-muted-foreground/50 shrink-0 w-16 text-right">
                  {new Date(session.startedAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                </div>
              </motion.div>
            ))
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
