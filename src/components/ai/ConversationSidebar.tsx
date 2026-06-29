import { useMemo, useState } from 'react';
import { Plus, Search, Trash2, Archive, Pencil, Sparkles, Loader2, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { format, isToday, isYesterday, differenceInDays } from 'date-fns';
import { cn } from '@/lib/utils';
import { Conversation } from '@/types';
import { Skeleton } from '@/components/ui/skeleton';

interface Props {
  conversations: Conversation[];
  activeId?: string;
  isLoading: boolean;
  isError: boolean;
  onRetry: () => void;
  onSelect: (id: string) => void;
  onNewChat: () => void;
  onDelete: (id: string) => void;
  onArchive?: (id: string) => void;
  onRename?: (id: string, title: string) => void;
  isCreating?: boolean;
}

function groupConversations(convs: Conversation[]) {
  const groups: { labelKey: string; items: Conversation[] }[] = [];
  const today: Conversation[] = [];
  const yesterday: Conversation[] = [];
  const thisWeek: Conversation[] = [];
  const older: Conversation[] = [];

  const now = new Date();
  for (const conv of convs) {
    const d = new Date(conv.updatedAt);
    if (isToday(d)) today.push(conv);
    else if (isYesterday(d)) yesterday.push(conv);
    else if (differenceInDays(now, d) <= 7) thisWeek.push(conv);
    else older.push(conv);
  }

  if (today.length > 0) groups.push({ labelKey: 'ai.today', items: today });
  if (yesterday.length > 0) groups.push({ labelKey: 'ai.yesterday', items: yesterday });
  if (thisWeek.length > 0) groups.push({ labelKey: 'ai.prev7Days', items: thisWeek });
  if (older.length > 0) groups.push({ labelKey: 'ai.older', items: older });

  return groups;
}

function ConversationItem({
  conv,
  isActive,
  onSelect,
  onDelete,
  onArchive,
  onRename,
}: {
  conv: Conversation;
  isActive: boolean;
  onSelect: () => void;
  onDelete: () => void;
  onArchive?: () => void;
  onRename?: (title: string) => void;
}) {
  const [showActions, setShowActions] = useState(false);
  const [editing, setEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(conv.title || '');

  const firstMessage = conv.messages && conv.messages.length > 0
    ? conv.messages[0].content.slice(0, 60)
    : null;

  const timeLabel = format(new Date(conv.updatedAt), 'h:mm a');

  const handleRename = () => {
    if (editTitle.trim() && onRename) {
      onRename(editTitle.trim());
    }
    setEditing(false);
  };

  return (
    <div
      className={cn(
        'group relative pl-1 pr-2 py-2.5 cursor-pointer transition-colors',
        isActive ? 'bg-primary/[0.04]' : 'hover:bg-accent/30',
      )}
      onClick={onSelect}
      onMouseEnter={() => setShowActions(true)}
      onMouseLeave={() => setShowActions(false)}
    >
      {isActive && (
        <div className="absolute left-0 top-1 bottom-1 w-0.5 rounded-r-full bg-primary" />
      )}
      <div className="flex items-start gap-2.5 pl-3">
        <Sparkles size={12} className="mt-1 text-muted-foreground/40 flex-shrink-0" />
        <div className="flex-1 min-w-0">
          {editing ? (
            <input
              value={editTitle}
              onChange={(e) => setEditTitle(e.target.value)}
              onBlur={handleRename}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleRename();
                if (e.key === 'Escape') setEditing(false);
              }}
              onClick={(e) => e.stopPropagation()}
              autoFocus
              className="w-full text-xs font-medium bg-accent/50 rounded px-1 py-0.5 text-foreground outline-none ring-1 ring-primary/30"
            />
          ) : (
            <p className={cn('text-xs font-medium truncate', isActive ? 'text-foreground' : 'text-muted-foreground')}>
              {conv.title || 'New conversation'}
            </p>
          )}
          {firstMessage && !editing && (
            <p className="text-[10px] text-muted-foreground/40 truncate mt-0.5">{firstMessage}...</p>
          )}
          <p className="text-[9px] text-muted-foreground/30 mt-0.5">{timeLabel}</p>
        </div>
        <AnimatePresence>
          {showActions && !editing && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex items-center gap-0.5 flex-shrink-0"
              onClick={(e) => e.stopPropagation()}
            >
              {onRename && (
                <button
                  onClick={() => { setEditTitle(conv.title || ''); setEditing(true); }}
                  className="p-0.5 rounded text-muted-foreground/40 hover:text-foreground hover:bg-accent"
                >
                  <Pencil size={10} />
                </button>
              )}
              {onArchive && (
                <button
                  onClick={onArchive}
                  className="p-0.5 rounded text-muted-foreground/40 hover:text-foreground hover:bg-accent"
                >
                  <Archive size={10} />
                </button>
              )}
              <button
                onClick={onDelete}
                className="p-0.5 rounded text-muted-foreground/40 hover:text-red-500 hover:bg-red-500/10"
              >
                <Trash2 size={10} />
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

export default function ConversationSidebar({
  conversations, activeId, isLoading, isError, onRetry,
  onSelect, onNewChat, onDelete, onArchive, onRename, isCreating,
}: Props) {
  const { t } = useTranslation();
  const [search, setSearch] = useState('');

  const filtered = useMemo(() => {
    if (!search.trim()) return conversations;
    const q = search.toLowerCase();
    return conversations.filter((c) => {
      if (c.title?.toLowerCase().includes(q)) return true;
      if (c.messages?.some((m) => m.content.toLowerCase().includes(q))) return true;
      return false;
    });
  }, [conversations, search]);

  const grouped = useMemo(() => groupConversations(filtered), [filtered]);

  return (
    <div className="w-72 flex-shrink-0 border-r border-border bg-card flex flex-col h-full">
      <div className="p-3 border-b border-border">
        <button
          onClick={onNewChat}
          disabled={isCreating}
          className="w-full flex items-center justify-center gap-2 px-3 py-2.5 bg-primary text-primary-foreground rounded-xl text-sm font-medium hover:bg-primary/90 transition-all disabled:opacity-50 shadow-sm"
        >
          {isCreating ? <Loader2 size={14} className="animate-spin" /> : <Plus size={14} />}
          {t('ai.newChat')}
        </button>
      </div>

      <div className="px-3 pt-2 pb-1">
        <div className="relative">
          <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground/40" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={t('ai.searchConversations')}
            className="w-full pl-8 pr-3 py-1.5 rounded-lg bg-accent/30 border border-border/50 text-xs text-foreground placeholder:text-muted-foreground/30 focus:outline-none focus:ring-1 focus:ring-primary/20 transition-all"
          />
          {search && (
            <button
              onClick={() => setSearch('')}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground/30 hover:text-foreground"
            >
              <X size={12} />
            </button>
          )}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar">
        {isLoading ? (
          <div className="p-3 space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex items-center gap-2">
                <Skeleton className="w-8 h-8 rounded-lg" />
                <div className="flex-1 space-y-1">
                  <Skeleton className="h-3 w-3/4 rounded" />
                  <Skeleton className="h-2 w-1/2 rounded" />
                </div>
              </div>
            ))}
          </div>
        ) : isError ? (
          <div className="flex flex-col items-center justify-center py-8 px-4 text-center">
            <p className="text-xs text-muted-foreground mb-2">{t('errorState.somethingWentWrong')}</p>
            <button onClick={onRetry} className="text-xs text-primary hover:underline">{t('errorState.tryAgain')}</button>
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
            <Sparkles size={20} className="text-muted-foreground/20 mb-2" />
            <p className="text-xs text-muted-foreground/50">
              {search ? t('ai.noSearchResults') : t('ai.noConversationsYet')}
            </p>
            {!search && (
              <button onClick={onNewChat} className="mt-2 text-xs text-primary hover:underline">
                {t('ai.startFirstChat')}
              </button>
            )}
          </div>
        ) : (
          <div className="pb-2">
            {grouped.map((group) => (
              <div key={group.labelKey}>
                <div className="px-4 py-1.5">
                  <span className="text-[10px] font-semibold text-muted-foreground/50 uppercase tracking-wider">
                    {t(group.labelKey)}
                  </span>
                </div>
                {group.items.map((conv) => (
                  <ConversationItem
                    key={conv.id}
                    conv={conv}
                    isActive={conv.id === activeId}
                    onSelect={() => onSelect(conv.id)}
                    onDelete={() => onDelete(conv.id)}
                    onArchive={onArchive ? () => onArchive(conv.id) : undefined}
                    onRename={onRename ? (title) => onRename(conv.id, title) : undefined}
                  />
                ))}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
