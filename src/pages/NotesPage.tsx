import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Plus, Search, LayoutGrid, AlignLeft, Columns3, Pin, Trash2,
  Loader2, Filter, ArrowUpDown, Check, X, FileText,
} from 'lucide-react';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';
import { stagger, transitions } from '@/lib/animations';
import { notesApi } from '@/api/notes';
import { tagsApi } from '@/api/tags';
import { cn } from '@/lib/utils';
import { Skeleton } from '@/components/ui/skeleton';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useTranslation } from 'react-i18next';
import NoteCard from '@/components/notes/NoteCard';
import NoteListItem from '@/components/notes/NoteListItem';
import NoteBoardCard from '@/components/notes/NoteBoardCard';
import NoteEmptyState from '@/components/notes/NoteEmptyState';
import type { Note, Tag } from '@/types';

type ViewMode = 'grid' | 'list' | 'board';
type FilterMode = 'ALL' | 'PINNED' | 'RECENT' | 'UNTAGGED';

const filters: { key: FilterMode; labelKey: string }[] = [
  { key: 'ALL', labelKey: 'notes.all' },
  { key: 'PINNED', labelKey: 'notes.pinned' },
  { key: 'RECENT', labelKey: 'notes.recent' },
  { key: 'UNTAGGED', labelKey: 'notes.untagged' },
];

function groupByTag(notes: Note[], tags: Tag[]): { tag: Tag; notes: Note[] }[] {
  return tags
    .map((tag) => ({ tag, notes: notes.filter((n) => n.tags.some((t) => t.id === tag.id)) }))
    .filter((g) => g.notes.length > 0);
}

export default function NotesPage() {
  useEffect(() => { document.title = 'Notes — ProductivityX'; }, []);
  const navigate = useNavigate();
  const qc = useQueryClient();
  const { t } = useTranslation();
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [filterMode, setFilterMode] = useState<FilterMode>('ALL');
  const [sort, setSort] = useState('UPDATED');
  const [sortAsc, setSortAsc] = useState(false);
  const [tagFilter, setTagFilter] = useState('');
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [selectMode, setSelectMode] = useState(false);

  useEffect(() => {
    const timeout = setTimeout(() => setDebouncedSearch(search), 300);
    return () => clearTimeout(timeout);
  }, [search]);

  const { data, isLoading } = useQuery({
    queryKey: ['notes', debouncedSearch, sort, tagFilter],
    queryFn: () => notesApi.list({ search: debouncedSearch || undefined, sort, tagId: tagFilter || undefined, size: 50 }),
  });
  const { data: tagsData } = useQuery({ queryKey: ['tags'], queryFn: tagsApi.list });

  const pinMutation = useMutation({
    mutationFn: ({ id, pinned }: { id: string; pinned: boolean }) =>
      pinned ? notesApi.unpin(id) : notesApi.pin(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['notes'] }),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => notesApi.softDelete(id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['notes'] }); toast.success(t('notes.movedToTrash')); },
  });

  const bulkDelete = useMutation({
    mutationFn: (ids: string[]) => Promise.all(ids.map((id) => notesApi.softDelete(id))),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['notes'] });
      toast.success(`Moved ${selected.size} notes to trash`);
      setSelected(new Set());
      setSelectMode(false);
    },
  });

  const allNotes: Note[] = data?.content || [];
  let notes = [...allNotes].sort((a, b) => (b.pinned ? 1 : 0) - (a.pinned ? 1 : 0));

  if (filterMode === 'PINNED') notes = notes.filter((n) => n.pinned);
  else if (filterMode === 'RECENT') notes = notes.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()).slice(0, 10);
  else if (filterMode === 'UNTAGGED') notes = notes.filter((n) => n.tags.length === 0);

  const tags: Tag[] = tagsData || [];

  const toggleSelect = (id: string) => {
    const next = new Set(selected);
    if (next.has(id)) next.delete(id); else next.add(id);
    setSelected(next);
  };

  const templates = [
    { name: t('notes.templateBlank'), path: '/notes/new' },
    { name: t('notes.templateMeeting'), path: '/notes/new?template=meeting' },
    { name: t('notes.templateJournal'), path: '/notes/new?template=journal' },
    { name: t('notes.templateProject'), path: '/notes/new?template=project' },
  ];

  return (
    <div className="h-full flex flex-col">
      <div className="sticky top-0 z-20 bg-background/80 backdrop-blur-lg border-b border-border">
        <div className="px-4 sm:px-6 py-3">
          <div className="flex items-center justify-between mb-3">
            <h1 className="text-lg font-bold text-foreground">{t('notes.title')}</h1>
            <div className="flex items-center gap-2">
              <button
                onClick={() => { setSelectMode(!selectMode); if (selectMode) setSelected(new Set()); }}
                className={cn(
                  'text-xs px-2.5 py-1.5 rounded-lg transition-colors',
                  selectMode ? 'bg-primary/10 text-primary' : 'text-muted-foreground hover:text-foreground hover:bg-accent',
                )}
              >
                {selectMode ? t('common.done') : t('notes.select')}
              </button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-xl text-sm font-medium hover:bg-primary/90 transition-all shadow-lg shadow-primary/20 focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none">
                    <Plus size={16} /> {t('notes.newNoteButton')}
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  {templates.map((tmpl) => (
                    <DropdownMenuItem key={tmpl.name} onSelect={() => navigate(tmpl.path)}>
                      {tmpl.name}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <div className="flex items-center gap-2 flex-1 min-w-[200px] bg-card border border-border rounded-xl px-3 py-2">
              <Search size={14} className="text-muted-foreground flex-shrink-0" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder={t('notes.searchPlaceholder')}
                className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground outline-none"
              />
              {search && (
                <button onClick={() => setSearch('')} className="text-muted-foreground hover:text-foreground">
                  <X size={14} />
                </button>
              )}
            </div>

            <div className="flex items-center gap-1 bg-card border border-border rounded-xl p-0.5">
              {([['grid', LayoutGrid], ['list', AlignLeft], ['board', Columns3]] as const).map(([mode, Icon]) => (
                <button
                  key={mode}
                  onClick={() => setViewMode(mode)}
                  className={cn(
                    'p-1.5 rounded-lg transition-colors',
                    viewMode === mode ? 'bg-primary text-primary-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground',
                  )}
                >
                  <Icon size={14} />
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="px-4 sm:px-6 pb-2 flex items-center gap-2 overflow-x-auto scrollbar-none">
          {filters.map(({ key, labelKey }) => (
            <button
              key={key}
              onClick={() => setFilterMode(key)}
              className={cn(
                'text-xs px-3 py-1 rounded-full transition-colors whitespace-nowrap',
                filterMode === key
                  ? 'bg-primary/10 text-primary font-medium'
                  : 'text-muted-foreground hover:text-foreground hover:bg-accent',
              )}
            >
              {t(labelKey)}
            </button>
          ))}
          <div className="w-px h-4 bg-border mx-1" />
          <Select value={tagFilter} onValueChange={setTagFilter}>
            <SelectTrigger className="h-7 text-xs bg-card border-border rounded-full px-3 gap-1 w-auto min-w-[80px]">
              <Filter size={10} />
              <SelectValue placeholder={t('notes.allTags')} />
            </SelectTrigger>
            <SelectContent className="bg-card border-border">
              <SelectItem value="">{t('notes.allTags')}</SelectItem>
              {tags.map((tag) => (
                <SelectItem key={tag.id} value={tag.id}>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: tag.color }} />
                    {tag.name}
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={sort} onValueChange={setSort}>
            <SelectTrigger className="h-7 text-xs bg-card border-border rounded-full px-3 gap-1 w-auto min-w-[80px]">
              <ArrowUpDown size={10} />
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-card border-border">
              <SelectItem value="UPDATED">{t('notes.sortUpdated')}</SelectItem>
              <SelectItem value="CREATED">{t('notes.sortCreated')}</SelectItem>
              <SelectItem value="TITLE">{t('notes.sortTitle')}</SelectItem>
            </SelectContent>
          </Select>
          <button
            onClick={() => setSortAsc(!sortAsc)}
            className={cn('p-1 rounded text-muted-foreground hover:text-foreground hover:bg-accent transition-colors', sortAsc && 'text-primary')}
          >
            <ArrowUpDown size={12} />
          </button>
          <span className="text-xs text-muted-foreground ml-auto tabular-nums whitespace-nowrap">
            {notes.length} {t('notes.results', { count: notes.length })}
          </span>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 sm:p-6">
        {selectMode && selected.size > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-2 mb-4 p-3 bg-primary/5 border border-primary/20 rounded-xl"
          >
            <span className="text-sm text-foreground font-medium">{selected.size} selected</span>
            <button
              onClick={() => bulkDelete.mutate(Array.from(selected))}
              className="ml-auto flex items-center gap-1.5 text-xs px-3 py-1.5 bg-destructive text-destructive-foreground rounded-lg hover:bg-destructive/90"
            >
              <Trash2 size={12} /> Delete
            </button>
            <button
              onClick={() => { setSelected(new Set()); setSelectMode(false); }}
              className="text-xs px-3 py-1.5 text-muted-foreground hover:text-foreground"
            >
              Cancel
            </button>
          </motion.div>
        )}

        {isLoading ? (
          <div className={cn('grid gap-4', viewMode === 'grid' ? 'grid-cols-2 sm:grid-cols-3 xl:grid-cols-4' : viewMode === 'list' ? 'grid-cols-1' : 'grid-cols-1')}>
            {[...Array(8)].map((_, i) => <Skeleton key={i} className="h-40 rounded-xl" />)}
          </div>
        ) : notes.length === 0 ? (
          <NoteEmptyState
            onCreate={() => navigate('/notes/new')}
            onTemplate={() => navigate('/notes/new?template=meeting')}
          />
        ) : viewMode === 'board' ? (
          <div className="flex gap-4 overflow-x-auto pb-4 h-full">
            {groupByTag(notes, tags).map((group) => (
              <NoteBoardCard key={group.tag.id} tag={group.tag} notes={group.notes} />
            ))}
            {groupByTag(notes, tags).length === 0 && (
              <div className="flex items-center justify-center w-full text-sm text-muted-foreground">
                {t('notes.noTagsGroup')}
              </div>
            )}
          </div>
        ) : (
          <AnimatePresence mode="wait">
            <motion.div
              key={viewMode}
              variants={stagger.container}
              initial="initial"
              animate="animate"
              className={cn(
                'gap-3',
                viewMode === 'grid'
                  ? 'grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4'
                  : 'grid grid-cols-1',
              )}
            >
              {notes.map((note) => (
                <motion.div key={note.id} variants={stagger.item}>
                  {viewMode === 'list' ? (
                    <NoteListItem
                      note={note}
                      selected={selected.has(note.id)}
                      onSelect={selectMode ? toggleSelect : undefined}
                      onPin={() => pinMutation.mutate({ id: note.id, pinned: note.pinned })}
                      onDelete={() => deleteMutation.mutate(note.id)}
                    />
                  ) : (
                    <NoteCard
                      note={note}
                      selected={selected.has(note.id)}
                      onSelect={selectMode ? toggleSelect : undefined}
                      onPin={() => pinMutation.mutate({ id: note.id, pinned: note.pinned })}
                      onDelete={() => deleteMutation.mutate(note.id)}
                    />
                  )}
                </motion.div>
              ))}
            </motion.div>
          </AnimatePresence>
        )}
      </div>
    </div>
  );
}
