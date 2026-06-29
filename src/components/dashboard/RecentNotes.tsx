import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { FileText, Pin, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';
import { formatDistanceToNow } from 'date-fns';
import { getDateFnsLocale } from '@/i18n/dateLocales';
import EmptyState from './EmptyState';
import type { Note } from '@/types';

interface Props {
  notes: Note[];
}

export default function RecentNotes({ notes }: Props) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const pinnedFirst = [...notes].sort((a, b) => (b.pinned ? 1 : 0) - (a.pinned ? 1 : 0));

  if (notes.length === 0) {
    return (
      <div className="bg-card border border-border rounded-xl">
        <EmptyState
          icon={FileText}
          title={t('dashboard.noNotesYet')}
          description={t('dashboard.createFirstNote')}
          action={{ label: t('dashboard.createFirstNote'), onClick: () => navigate('/notes/new') }}
        />
      </div>
    );
  }

  return (
    <div className="bg-card border border-border rounded-xl p-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-xs font-semibold text-foreground uppercase tracking-wider">{t('dashboard.recentNotes')}</h3>
        <button
          onClick={() => navigate('/notes')}
          className="group/btn flex items-center gap-1 text-xs text-muted-foreground hover:text-primary transition-colors focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none rounded px-1"
        >
          {t('dashboard.viewAll')}
          <ArrowRight size={12} className="transition-transform group-hover/btn:translate-x-0.5" />
        </button>
      </div>
      <div className="space-y-1.5">
        {pinnedFirst.slice(0, 5).map((note, i) => (
          <motion.button
            key={note.id}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 + i * 0.04, ease: 'easeOut' }}
            whileHover={{ x: 2 }}
            onClick={() => navigate(`/notes/${note.id}`)}
            className="w-full text-left group/card rounded-lg p-2.5 hover:bg-accent/50 transition-colors focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
          >
            <div className="flex items-start justify-between gap-2">
              <p className="text-sm font-medium text-foreground truncate group-hover/card:text-primary transition-colors">
                {note.title || t('dashboard.untitled')}
              </p>
              {note.pinned && <Pin size={11} className="text-primary flex-shrink-0 mt-0.5" />}
            </div>
            {note.plainTextContent && (
              <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2 leading-relaxed">
                {note.plainTextContent}
              </p>
            )}
            <div className="flex items-center gap-2 mt-1.5">
              {note.tags && note.tags.length > 0 && (
                <div className="flex gap-1 overflow-hidden">
                  {note.tags.slice(0, 3).map((tag) => (
                    <span key={tag.id} style={{ backgroundColor: `${tag.color}20`, color: tag.color }} className="text-[10px] px-1.5 py-0.5 rounded-full font-medium">
                      {tag.name}
                    </span>
                  ))}
                </div>
              )}
              <span className="text-[10px] text-muted-foreground ml-auto flex-shrink-0">
                {formatDistanceToNow(new Date(note.updatedAt), { addSuffix: true, locale: getDateFnsLocale() })}
              </span>
            </div>
          </motion.button>
        ))}
      </div>
    </div>
  );
}
