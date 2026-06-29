import { useState, memo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Pin, Trash2, Copy, Check, Star } from 'lucide-react';
import { motion } from 'framer-motion';
import { formatDistanceToNow } from 'date-fns';
import { getDateFnsLocale } from '@/i18n/dateLocales';
import { cn } from '@/lib/utils';
import type { Note } from '@/types';

const gradients = [
  'from-primary/10 to-violet-500/10',
  'from-emerald-500/10 to-teal-500/10',
  'from-amber-500/10 to-orange-500/10',
  'from-rose-500/10 to-pink-500/10',
  'from-cyan-500/10 to-blue-500/10',
];

interface Props {
  note: Note;
  selected?: boolean;
  onSelect?: (id: string) => void;
  onPin: () => void;
  onDelete: () => void;
}

const NoteCard = memo(function NoteCard({ note, selected, onSelect, onPin, onDelete }: Props) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [hovered, setHovered] = useState(false);
  const gradient = gradients[note.title.length % gradients.length];
  const locale = getDateFnsLocale();

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -3 }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onKeyDown={(e) => { if (e.key === 'Enter') { navigate(`/notes/${note.id}`); } }}
      tabIndex={0}
      className={cn(
        'group relative bg-card border rounded-xl cursor-pointer overflow-hidden transition-colors focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none',
        selected ? 'border-primary ring-1 ring-primary' : 'border-border hover:border-primary/30',
      )}
    >
      <div className={`h-24 bg-gradient-to-br ${gradient} flex items-start justify-end p-3`}>
        {note.pinned && (
          <Star size={14} className="text-amber-500 fill-amber-500 drop-shadow-sm" />
        )}
      </div>

      <div className="p-3" onClick={() => navigate(`/notes/${note.id}`)}>
        <p className="text-sm font-semibold text-foreground truncate mb-1">
          {note.title || t('notes.untitled')}
        </p>
        {note.plainTextContent && (
          <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed mb-2">
            {note.plainTextContent}
          </p>
        )}
        <div className="flex items-center gap-2 flex-wrap">
          {note.tags.slice(0, 3).map((tag) => (
            <span
              key={tag.id}
              className="text-[10px] px-1.5 py-0.5 rounded-full font-medium"
              style={{ backgroundColor: `${tag.color}20`, color: tag.color }}
            >
              {tag.name}
            </span>
          ))}
        </div>
      </div>

      <div className="px-3 pb-2 flex items-center justify-between">
        <span className="text-[10px] text-muted-foreground">
          {formatDistanceToNow(new Date(note.updatedAt), { addSuffix: true, locale })}
        </span>
      </div>

      {onSelect && (
        <div
          className="absolute top-2 left-2 z-20"
          onClick={(e) => { e.stopPropagation(); onSelect(note.id); }}
        >
          <div className={cn(
            'w-4 h-4 rounded border-2 transition-colors',
            selected ? 'bg-primary border-primary' : 'border-muted-foreground/40 bg-background/80',
          )}>
            {selected && <Check size={12} className="text-primary-foreground" />}
          </div>
        </div>
      )}

      <div
        className={cn(
          'absolute top-2 right-2 flex items-center gap-1 transition-opacity z-10',
          hovered ? 'opacity-100' : 'opacity-0',
        )}
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onPin}
          className="p-1.5 rounded-lg bg-background/90 border border-border hover:bg-accent transition-colors"
        >
          <Pin size={11} className={note.pinned ? 'text-amber-500' : 'text-muted-foreground'} />
        </button>
        <button
          onClick={onDelete}
          className="p-1.5 rounded-lg bg-background/90 border border-border hover:bg-accent transition-colors"
        >
          <Trash2 size={11} className="text-destructive" />
        </button>
      </div>
    </motion.div>
  );
});

export default NoteCard;

