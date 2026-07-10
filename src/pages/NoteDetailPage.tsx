import { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  ArrowLeft, Pin, PinOff, Trash2, Maximize2, Minimize2,
  PanelRightOpen, PanelRightClose, FileDown, FileText,
} from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { notesApi } from '@/api/notes';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import { TooltipProvider } from '@/components/ui/tooltip';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import NoteSidebar from '@/components/notes/NoteSidebar';
import ReadingProgress from '@/components/notes/ReadingProgress';
import MarkdownEditor from '@/components/notes/markdown-editor';
import html2pdf from 'html2pdf.js';

export default function NoteDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const { t } = useTranslation();
  const isNew = id === 'new';
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle');
  const [immersive, setImmersive] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const saveTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const noteIdRef = useRef<string | null>(isNew ? null : id || null);
  const versionRef = useRef<number>(0);
  const titleRef = useRef<HTMLTextAreaElement>(null);
  const pdfRef = useRef<HTMLDivElement>(null);

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

  const exportMd = useCallback(() => {
    const blob = new Blob([content], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${title || 'untitled'}.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success(t('noteDetail.exportedMd'));
  }, [content, title, t]);

  const exportPdf = useCallback(async () => {
    if (!pdfRef.current) return;
    const opt = {
      margin: [10, 10],
      filename: `${title || 'untitled'}.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2, useCORS: true, letterRendering: true },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
    };
    try {
      await html2pdf().set(opt).from(pdfRef.current).save();
      toast.success(t('noteDetail.exportedPdf'));
    } catch {
      toast.error('PDF export failed');
    }
  }, [content, title, t]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setImmersive(false);
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

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
        <header
          className={cn(
            'flex items-center gap-2 px-4 py-2 border-b border-border bg-card/50 flex-shrink-0',
            immersive && 'bg-background/95 backdrop-blur-lg',
          )}
        >
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

          {!isNew && (
            <>
              <DropdownMenu>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <DropdownMenuTrigger asChild>
                      <button className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent transition-colors">
                        <FileDown size={14} />
                      </button>
                    </DropdownMenuTrigger>
                  </TooltipTrigger>
                  <TooltipContent>Export</TooltipContent>
                </Tooltip>
                <DropdownMenuContent align="end" className="w-48">
                  <DropdownMenuItem onClick={exportMd} className="gap-2 cursor-pointer">
                    <FileText size={14} />
                    {t('noteDetail.exportMd')}
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={exportPdf} className="gap-2 cursor-pointer">
                    <FileDown size={14} />
                    {t('noteDetail.exportPdf')}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

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

        <div className="flex flex-1 overflow-hidden">
          <div className="flex-1 overflow-y-auto">
            <div className={cn('max-w-4xl mx-auto py-4 px-4 sm:px-6', immersive && 'max-w-5xl')}>
              <textarea
                ref={titleRef}
                value={title}
                onChange={(e) => handleTitleChange(e.target.value)}
                placeholder={t('noteDetail.untitledPlaceholder')}
                className="w-full text-3xl font-bold text-foreground bg-transparent outline-none placeholder:text-muted-foreground/40 mb-4 resize-none overflow-hidden"
                rows={1}
              />

              <MarkdownEditor
                content={content}
                onChange={handleContentChange}
                placeholder={t('noteDetail.startWriting')}
              />

              <div className="flex items-center justify-end mt-2">
                <span className="text-[10px] text-muted-foreground tabular-nums">
                  {saveStatus === 'saving' && t('noteDetail.saving')}
                  {saveStatus === 'saved' && t('noteDetail.saved')}
                </span>
              </div>
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

        <div style={{ position: 'absolute', left: '-9999px', top: 0, zIndex: -1, width: '210mm' }}>
          <div
            ref={pdfRef}
            className="pdf-export"
            style={{
              padding: '20mm',
              background: '#ffffff',
              color: '#1a1a1a',
              fontFamily: 'Georgia, "Times New Roman", serif',
              fontSize: '12pt',
              lineHeight: 1.6,
              width: '190mm',
            }}
          >
            {title && (
              <div style={{ textAlign: 'center', marginBottom: '15mm' }}>
                <h1 style={{ fontSize: '24pt', fontWeight: 'bold', margin: 0, color: '#1a1a1a' }}>{title}</h1>
              </div>
            )}
            <div className="prose prose-sm max-w-none !text-[#1a1a1a]" style={{ color: '#1a1a1a' }}>
              {content}
            </div>
          </div>
        </div>
      </div>
    </TooltipProvider>
  );
}
