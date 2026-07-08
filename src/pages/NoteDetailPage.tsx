import { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  ArrowLeft, ArrowRight, Pin, PinOff, Trash2, Maximize2, Minimize2,
  PanelRightOpen, PanelRightClose, Sparkles,
} from 'lucide-react';
import { toast } from 'sonner';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { cn } from '@/lib/utils';
import { notesApi } from '@/api/notes';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import { TooltipProvider } from '@/components/ui/tooltip';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import NoteToolbar from '@/components/notes/NoteToolbar';
import NoteSidebar from '@/components/notes/NoteSidebar';
import ReadingProgress from '@/components/notes/ReadingProgress';

export default function NoteDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const { t } = useTranslation();
  const isNew = id === 'new';
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [preview, setPreview] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle');
  const [immersive, setImmersive] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const saveTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const noteIdRef = useRef<string | null>(isNew ? null : id || null);
  const versionRef = useRef<number>(0);
  const titleRef = useRef<HTMLTextAreaElement>(null);

  const { data: note } = useQuery({
    queryKey: ['note', id],
    queryFn: () => notesApi.get(id as string),
    enabled: !isNew && !!id,
  });

  useEffect(() => {
    if (note) { setTitle(note.title || ''); setContent(note.content || ''); versionRef.current = note.version || 0; }
  }, [note]);

  const save = useCallback(async (titleStr: string, c: string) => {
    setSaveStatus('saving');
    try {
      if (!noteIdRef.current) {
        noteIdRef.current = '__CREATING__';
        const newNote = await notesApi.create({ title: titleStr, content: c });
        noteIdRef.current = newNote.id;
        versionRef.current = newNote.version || 0;
        navigate(`/notes/${newNote.id}`, { replace: true });
        qc.invalidateQueries({ queryKey: ['notes'] });
      } else if (noteIdRef.current === '__CREATING__') {
        return;
      } else {
        const updated = await notesApi.update(noteIdRef.current, { title: titleStr, content: c, knownVersion: versionRef.current });
        versionRef.current = updated.version || versionRef.current;
        qc.invalidateQueries({ queryKey: ['notes'] });
      }
      setSaveStatus('saved');
      setTimeout(() => setSaveStatus('idle'), 2000);
    } catch (err: unknown) {
      const status = (err as { response?: { status?: number } })?.response?.status;
      if (status === 409) toast.error(t('noteDetail.conflictDetected'), { duration: 5000 });
      noteIdRef.current = null;
      setSaveStatus('idle');
    }
  }, [navigate, qc, t]);

  const scheduleSave = useCallback((t: string, c: string) => {
    clearTimeout(saveTimer.current);
    setSaveStatus('saving');
    saveTimer.current = setTimeout(() => save(t, c), 500);
  }, [save]);

  const handleTitleChange = (v: string) => { setTitle(v); scheduleSave(v, content); };
  const handleContentChange = (v: string) => { setContent(v); scheduleSave(title, v); };

  const pinMutation = useMutation({
    mutationFn: () => note?.pinned ? notesApi.unpin(note.id) : notesApi.pin(note!.id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['note', id] }),
  });

  const deleteMutation = useMutation({
    mutationFn: () => notesApi.softDelete(id!),
    onSuccess: () => { toast.success(t('noteDetail.movedToTrash')); navigate('/notes'); qc.invalidateQueries({ queryKey: ['notes'] }); },
  });

  const insertMarkdown = useCallback((before: string, after = '') => {
    const ta = document.getElementById('note-content') as HTMLTextAreaElement;
    if (!ta) return;
    const start = ta.selectionStart, end = ta.selectionEnd;
    const selected = content.slice(start, end);
    const newContent = content.slice(0, start) + before + selected + after + content.slice(end);
    handleContentChange(newContent);
    setTimeout(() => { ta.focus(); ta.setSelectionRange(start + before.length, start + before.length + selected.length); }, 0);
  }, [content, handleContentChange]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setImmersive(false);
      if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') setPreview(!preview);
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [preview]);

  const wordCount = content.split(/\s+/).filter(Boolean).length;
  const readTime = Math.max(1, Math.round(wordCount / 200));

  useEffect(() => {
    if (titleRef.current) {
      titleRef.current.style.height = 'auto';
      titleRef.current.style.height = Math.min(titleRef.current.scrollHeight, 120) + 'px';
    }
  }, [title]);

  return (
    <TooltipProvider>
      <ReadingProgress />
      <div className={cn(
        'flex flex-col h-full',
        immersive && 'fixed inset-0 z-50 bg-background',
      )}>
        <header className={cn(
          'flex items-center gap-2 px-4 py-2 border-b border-border bg-card/50 flex-shrink-0',
          immersive && 'bg-background/95 backdrop-blur-lg',
        )}>
          <Tooltip>
            <TooltipTrigger asChild>
              <button onClick={() => navigate('/notes')} className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent transition-colors">
                <ArrowLeft size={16} />
              </button>
            </TooltipTrigger>
            <TooltipContent>{t('common.back')}</TooltipContent>
          </Tooltip>

          {note?.title && (
            <span className="text-xs text-muted-foreground hidden sm:block truncate max-w-[120px]">
              {note.title}
            </span>
          )}

          <div className="flex-1" />

          {note && (
            <>
              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    onClick={() => pinMutation.mutate()}
                    className={cn('p-1.5 rounded-lg hover:bg-accent transition-colors', note?.pinned ? 'text-amber-500' : 'text-muted-foreground hover:text-foreground')}
                  >
                    {note?.pinned ? <PinOff size={14} /> : <Pin size={14} />}
                  </button>
                </TooltipTrigger>
                <TooltipContent>{note?.pinned ? t('noteDetail.unpin') : t('noteDetail.pin')}</TooltipContent>
              </Tooltip>

              <Tooltip>
                <TooltipTrigger asChild>
                  <button onClick={() => setSidebarOpen(!sidebarOpen)} className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent transition-colors">
                    {sidebarOpen ? <PanelRightClose size={14} /> : <PanelRightOpen size={14} />}
                  </button>
                </TooltipTrigger>
                <TooltipContent>{t('noteDetail.properties')}</TooltipContent>
              </Tooltip>
            </>
          )}

          <Tooltip>
            <TooltipTrigger asChild>
              <button
                onClick={() => setImmersive(!immersive)}
                className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
              >
                {immersive ? <Minimize2 size={14} /> : <Maximize2 size={14} />}
              </button>
            </TooltipTrigger>
            <TooltipContent>{immersive ? t('noteDetail.exitImmersive') : t('noteDetail.immersive')}</TooltipContent>
          </Tooltip>

          {!isNew && (
            <Tooltip>
              <TooltipTrigger asChild>
                <button onClick={() => deleteMutation.mutate()} className="p-1.5 rounded-lg text-muted-foreground hover:text-destructive hover:bg-accent transition-colors">
                  <Trash2 size={14} />
                </button>
              </TooltipTrigger>
              <TooltipContent>{t('noteDetail.delete')}</TooltipContent>
            </Tooltip>
          )}
        </header>

        <NoteToolbar
          preview={preview}
          onTogglePreview={() => setPreview(!preview)}
          onInsert={insertMarkdown}
          saveStatus={saveStatus}
        />

        <div className="flex flex-1 overflow-hidden">
          <div className="flex-1 overflow-y-auto">
            <div className={cn('max-w-3xl mx-auto py-6 px-4 sm:px-8', immersive && 'max-w-4xl')}>
              <textarea
                ref={titleRef}
                value={title}
                onChange={(e) => handleTitleChange(e.target.value)}
                placeholder={t('noteDetail.untitledPlaceholder')}
                className="w-full text-3xl font-bold text-foreground bg-transparent outline-none placeholder:text-muted-foreground/40 mb-6 resize-none overflow-hidden"
                rows={1}
              />
              {preview ? (
                <div className="prose prose-sm dark:prose-invert max-w-none">
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>
                    {content || t('noteDetail.nothingToPreview')}
                  </ReactMarkdown>
                </div>
              ) : (
                <textarea
                  id="note-content"
                  value={content}
                  onChange={(e) => handleContentChange(e.target.value)}
                  placeholder={t('noteDetail.startWriting')}
                  className="w-full min-h-[50vh] bg-transparent text-sm text-foreground placeholder:text-muted-foreground/40 outline-none resize-none leading-relaxed"
                />
              )}
            </div>
          </div>

          <AnimatePresence>
            {sidebarOpen && note && !isNew && (
              <motion.div
                initial={{ width: 0, opacity: 0 }}
                animate={{ width: 256, opacity: 1 }}
                exit={{ width: 0, opacity: 0 }}
                transition={{ duration: 0.2, ease: 'easeInOut' }}
                className="overflow-hidden flex-shrink-0 hidden lg:block"
              >
                <NoteSidebar note={note} onClose={() => setSidebarOpen(false)} />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </TooltipProvider>
  );
}
