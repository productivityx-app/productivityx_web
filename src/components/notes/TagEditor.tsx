import { useState, useRef, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { X, Plus, Check } from 'lucide-react';
import { tagsApi } from '@/api/tags';
import { notesApi } from '@/api/notes';
import type { Tag } from '@/types';

interface Props {
  noteId: string;
  tags: Tag[];
}

export default function TagEditor({ noteId, tags }: Props) {
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  const { data: allTags } = useQuery({ queryKey: ['tags'], queryFn: tagsApi.list });
  const available = (allTags || []).filter((t) => !tags.some((ot) => ot.id === t.id));

  const addTag = useMutation({
    mutationFn: (tagId: string) => notesApi.addTag(noteId, tagId),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['note', noteId] }),
  });

  const removeTag = useMutation({
    mutationFn: (tagId: string) => notesApi.removeTag(noteId, tagId),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['note', noteId] }),
  });

  const createTag = useMutation({
    mutationFn: (data: { name: string; color: string }) => tagsApi.create(data),
    onSuccess: (newTag) => {
      addTag.mutate(newTag.id);
      qc.invalidateQueries({ queryKey: ['tags'] });
    },
  });

  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 50);
  }, [open]);

  const filtered = available.filter((t) => t.name.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-1.5 flex-wrap">
        {tags.map((tag) => (
          <span
            key={tag.id}
            className="inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-full font-medium group/tag"
            style={{ backgroundColor: `${tag.color}20`, color: tag.color }}
          >
            {tag.name}
            <button
              onClick={() => removeTag.mutate(tag.id)}
              className="opacity-0 group-hover/tag:opacity-100 transition-opacity hover:opacity-100"
            >
              <X size={10} />
            </button>
          </span>
        ))}
        <button
          onClick={() => setOpen(!open)}
          className="inline-flex items-center gap-0.5 text-[11px] px-2 py-0.5 rounded-full text-muted-foreground hover:text-foreground hover:bg-accent transition-colors border border-dashed border-border"
        >
          <Plus size={10} /> Tag
        </button>
      </div>

      {open && (
        <div className="bg-popover border border-border rounded-lg p-2 shadow-lg">
          <input
            ref={inputRef}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search or create tag..."
            className="w-full bg-transparent text-xs text-foreground placeholder:text-muted-foreground outline-none border-b border-border pb-2 mb-2"
            onKeyDown={(e) => {
              if (e.key === 'Enter' && search.trim() && filtered.length === 0) {
                const colors = ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#06b6d4'];
                const color = colors[Math.floor(Math.random() * colors.length)];
                createTag.mutate({ name: search.trim(), color });
                setSearch('');
                setOpen(false);
              }
            }}
          />
          <div className="space-y-0.5 max-h-32 overflow-y-auto">
            {filtered.map((tag) => (
              <button
                key={tag.id}
                onClick={() => { addTag.mutate(tag.id); setSearch(''); }}
                className="w-full flex items-center gap-2 px-2 py-1.5 rounded text-xs hover:bg-accent transition-colors text-left"
              >
                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: tag.color }} />
                {tag.name}
              </button>
            ))}
            {search.trim() && filtered.length === 0 && (
              <p className="text-xs text-muted-foreground px-2 py-1">Press Enter to create "{search}"</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
