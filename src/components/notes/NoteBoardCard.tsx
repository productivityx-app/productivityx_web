import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { FileText, Star } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { getDateFnsLocale } from '@/i18n/dateLocales';
import { cn } from '@/lib/utils';
import type { Note, Tag } from '@/types';

interface Props {
  tag: Tag;
  notes: Note[];
}

export default function NoteBoardCard({ tag, notes }: Props) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const locale = getDateFnsLocale();

  return (
    <div className="bg-card/50 border border-border rounded-xl p-3 min-w-[220px] flex-shrink-0">
      <div className="flex items-center gap-2 mb-3 px-1">
        <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: tag.color }} />
        <span className="text-xs font-semibold text-foreground">{tag.name}</span>
        <span className="text-[10px] text-muted-foreground ml-auto tabular-nums">{notes.length}</span>
      </div>
      <div className="space-y-1.5">
        {notes.map((note) => (
          <button
            key={note.id}
            onClick={() => navigate(`/notes/${note.id}`)}
            className="w-full text-left bg-card border border-border rounded-lg p-2.5 hover:border-primary/30 hover:bg-accent/50 transition-all group focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
          >
            <div className="flex items-start gap-1.5">
              <FileText size={12} className="text-muted-foreground mt-0.5 flex-shrink-0" />
              <div className="min-w-0 flex-1">
                <p className="text-xs font-medium text-foreground truncate group-hover:text-primary transition-colors">
                  {note.title || t('notes.untitled')}
                </p>
                {note.plainTextContent && (
                  <p className="text-[10px] text-muted-foreground line-clamp-1 mt-0.5">{note.plainTextContent}</p>
                )}
              </div>
              {note.pinned && <Star size={10} className="text-amber-500 fill-amber-500 flex-shrink-0 mt-0.5" />}
            </div>
            <p className="text-[9px] text-muted-foreground mt-1">
              {formatDistanceToNow(new Date(note.updatedAt), { addSuffix: true, locale })}
            </p>
          </button>
        ))}
      </div>
    </div>
  );
}
