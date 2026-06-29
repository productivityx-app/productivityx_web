import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Trash2, Pencil } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import { tagsApi } from '../../api/tags';
import ColorPicker from './ColorPicker';
import { Input } from '@/components/ui/input';
import Modal from '@/components/design-system/Modal';
import AnimatedButton from '@/components/design-system/AnimatedButton';

export default function TagManager() {
  const { t } = useTranslation();
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState('');
  const [color, setColor] = useState('#6366F1');
  const [editingId, setEditingId] = useState<string | null>(null);

  const { data: tags = [] } = useQuery({ queryKey: ['tags'], queryFn: tagsApi.list });

  const createMutation = useMutation({
    mutationFn: () => tagsApi.create({ name, color }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['tags'] });
      setName(''); setColor('#6366F1'); toast.success(t('tagManager.tagCreated'));
    },
    onError: () => toast.error(t('tagManager.failedToCreateTag')),
  });

  const updateMutation = useMutation({
    mutationFn: () => tagsApi.update(editingId!, { name, color }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['tags'] });
      setEditingId(null); setName(''); setColor('#6366F1');
      toast.success(t('tagManager.tagUpdated'));
    },
    onError: () => toast.error(t('tagManager.failedToUpdateTag')),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => tagsApi.delete(id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['tags'] }); toast.success(t('tagManager.tagDeleted')); },
  });

  const handleEdit = (tag: { id: string; name: string; color: string }) => {
    setEditingId(tag.id);
    setName(tag.name);
    setColor(tag.color);
  };

  const handleSave = () => {
    if (editingId) updateMutation.mutate();
    else createMutation.mutate();
  };

  return (
    <>
      <AnimatedButton onClick={() => setOpen(true)} variant="outline" size="sm">
        {t('tagManager.manageTags')}
      </AnimatedButton>

      <Modal open={open} onClose={() => setOpen(false)} title={t('tagManager.manageTagsTitle')} size="sm">
        <div className="space-y-4">
          <div className="space-y-2">
            <Input value={name} onChange={(e) => setName(e.target.value)} placeholder={t('tagManager.tagNamePlaceholder')} className="bg-background border-border" />
            <ColorPicker value={color} onChange={setColor} />
            <AnimatedButton onClick={handleSave} loading={createMutation.isPending || updateMutation.isPending} disabled={!name} className="w-full">
              {editingId ? t('tagManager.updateTag') : t('tagManager.createTag')}
            </AnimatedButton>
          </div>
          <div className="space-y-1 max-h-48 overflow-y-auto">
            {tags.map((tag) => (
              <div key={tag.id} className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-accent group">
                <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: tag.color }} />
                <span className="text-sm text-foreground flex-1">{tag.name}</span>
                <button onClick={() => handleEdit(tag)} className="p-1 rounded text-muted-foreground hover:text-foreground opacity-0 group-hover:opacity-100">
                  <Pencil size={12} />
                </button>
                <button onClick={() => deleteMutation.mutate(tag.id)} className="p-1 rounded text-muted-foreground hover:text-destructive opacity-0 group-hover:opacity-100">
                  <Trash2 size={12} />
                </button>
              </div>
            ))}
          </div>
        </div>
      </Modal>
    </>
  );
}
