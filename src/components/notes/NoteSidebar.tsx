import { useTranslation } from 'react-i18next';
import { Clock, Calendar, Type, BookOpen, X } from 'lucide-react';
import { format } from 'date-fns';
import { getDateFnsLocale } from '@/i18n/dateLocales';
import TagEditor from './TagEditor';
import type { Note } from '@/types';

interface Props {
  note: Note;
  onClose: () => void;
}

export default function NoteSidebar({ note, onClose }: Props) {
  const { t } = useTranslation();
  const locale = getDateFnsLocale();

  const wordCount = note.wordCount || note.content?.split(/\s+/).filter(Boolean).length || 0;
  const readTime = Math.max(1, Math.round(wordCount / 200));
  const charCount = note.content?.length || 0;

  return (
    <div className="w-64 border-l border-border bg-card/50 h-full overflow-y-auto flex-shrink-0 p-4 space-y-5">
      <div className="flex items-center justify-between">
        <h3 className="text-xs font-semibold text-foreground uppercase tracking-wider">Properties</h3>
        <button onClick={onClose} className="p-1 rounded text-muted-foreground hover:text-foreground hover:bg-accent">
          <X size={12} />
        </button>
      </div>

      <div className="space-y-3">
        <div>
          <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider mb-1.5">Tags</p>
          <TagEditor noteId={note.id} tags={note.tags} />
        </div>

        <div className="space-y-2">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Calendar size={12} />
            <span>{t('noteDetail.created')}: {format(new Date(note.createdAt), 'MMM d, yyyy', { locale })}</span>
          </div>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Clock size={12} />
            <span>{t('noteDetail.updated')}: {format(new Date(note.updatedAt), 'MMM d, yyyy h:mm a', { locale })}</span>
          </div>
        </div>
      </div>

      <div className="border-t border-border pt-3 space-y-2">
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Type size={12} />
          <span>{wordCount} {t('noteDetail.wordsCount', { count: wordCount })}</span>
        </div>
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Type size={12} />
          <span>{charCount} characters</span>
        </div>
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <BookOpen size={12} />
          <span>{t('noteDetail.minRead', { count: readTime })}</span>
        </div>
      </div>
    </div>
  );
}
