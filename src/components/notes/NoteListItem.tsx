import { useState, memo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { FileText, Pin, Trash2, Star, Check } from 'lucide-react';
import { motion } from 'framer-motion';
import { formatDistanceToNow } from 'date-fns';
import { getDateFnsLocale } from '@/i18n/dateLocales';
import { cn } from '@/lib/utils';
import type { Note } from '@/types';

interface Props {
  note: Note;
  selected?: boolean;
  onSelect?: (id: string) => void;
  onPin: () => void;
  onDelete: () => void;
}

const NoteListItem = memo(function NoteListItem({ note, selected, onSelect, onPin, onDelete }: Props) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [hovered, setHovered] = useState(false);
  const locale = getDateFnsLocale();

  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={() => navigate(`/notes/${note.id}`)}
      className={cn(
        'group flex items-center gap-3 px-4 py-3 rounded-xl cursor-pointer transition-all',
        selected ? 'bg-primary/5 border border-primary/30' : 'hover:bg-accent/50 border border-transparent',
      )}
    >
      {onSelect && (
        <div
          onClick={(e) => { e.stopPropagation(); onSelect(note.id); }}
          className={cn(
            'w-4 h-4 rounded border-2 flex items-center justify-center flex-shrink-0 transition-colors',
            selected ? 'bg-primary border-primary' : 'border-muted-foreground/30 hover:border-muted-foreground/60',
          )}
        >
          {selected && <Check size={12} className="text-primary-foreground" />}
        </div>
      )}

      <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary/10 to-violet-500/10 flex items-center justify-center flex-shrink-0">
        <FileText size={14} className="text-primary/60" />
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <p className="text-sm font-semibold text-foreground truncate group-hover:text-primary transition-colors">
            {note.title || t('notes.untitled')}
          </p>
          {note.pinned && <Star size={11} className="text-amber-500 fill-amber-500 flex-shrink-0" />}
        </div>
        {note.plainTextContent && (
          <p className="text-xs text-muted-foreground truncate mt-0.5">{note.plainTextContent}</p>
        )}
      </div>

      <div className="hidden sm:flex items-center gap-2 flex-shrink-0">
        {note.tags.slice(0, 2).map((tag) => (
          <span
            key={tag.id}
            className="text-[10px] px-1.5 py-0.5 rounded-full font-medium"
            style={{ backgroundColor: `${tag.color}20`, color: tag.color }}
          >
            {tag.name}
          </span>
        ))}
      </div>

      <span className="text-[10px] text-muted-foreground flex-shrink-0 hidden sm:block tabular-nums">
        {note.wordCount > 0 && `${note.wordCount} words · `}
        {formatDistanceToNow(new Date(note.updatedAt), { addSuffix: true, locale })}
      </span>

      <div
        className={cn(
          'flex items-center gap-1 transition-opacity flex-shrink-0',
          hovered ? 'opacity-100' : 'opacity-0',
        )}
        onClick={(e) => e.stopPropagation()}
      >
        <button onClick={onPin} className="p-1 rounded hover:bg-accent transition-colors">
          <Pin size={11} className={note.pinned ? 'text-amber-500' : 'text-muted-foreground'} />
        </button>
        <button onClick={onDelete} className="p-1 rounded hover:bg-accent transition-colors">
          <Trash2 size={11} className="text-destructive/70 hover:text-destructive" />
        </button>
      </div>
    </motion.div>
  );
});

export default NoteListItem;

