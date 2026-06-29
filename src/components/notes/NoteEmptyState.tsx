import { FileText, Plus, File } from 'lucide-react';
import EmptyState from '@/components/common/EmptyState';

interface Props {
  onCreate: () => void;
  onTemplate?: () => void;
}

export default function NoteEmptyState({ onCreate, onTemplate }: Props) {
  return (
    <EmptyState
      icon={FileText}
      secondaryIcon={Plus}
      title="Your knowledge base is empty"
      description="Create your first note to capture thoughts, ideas, and inspiration. Or pick a template to get started quickly."
      gradient="notes"
      size="lg"
      actions={[
        { label: 'Create your first note', icon: Plus, onClick: onCreate },
        ...(onTemplate ? [{ label: 'Try a template', icon: File, onClick: onTemplate, variant: 'secondary' as const }] : []),
      ]}
    />
  );
}
