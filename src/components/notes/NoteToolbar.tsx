import {
  Bold, Italic, Strikethrough, Code, Link, Quote,
  List, ListOrdered, CheckSquare, Minus, Sparkles, Eye, Edit3,
  Heading1, Heading2, Heading3,
} from 'lucide-react';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';

interface Props {
  preview: boolean;
  onTogglePreview: () => void;
  onInsert: (before: string, after?: string) => void;
  saveStatus: 'idle' | 'saving' | 'saved';
}

const tools = [
  { icon: Bold, label: 'Bold', before: '**', after: '**' },
  { icon: Italic, label: 'Italic', before: '_', after: '_' },
  { icon: Strikethrough, label: 'Strikethrough', before: '~~', after: '~~' },
  { icon: Code, label: 'Code', before: '`', after: '`' },
  { icon: Link, label: 'Link', before: '[', after: '](url)' },
  { icon: Quote, label: 'Blockquote', before: '> ' },
  { icon: List, label: 'Bullet list', before: '- ' },
  { icon: ListOrdered, label: 'Numbered list', before: '1. ' },
  { icon: CheckSquare, label: 'Checkbox', before: '- [ ] ' },
  { icon: Minus, label: 'Divider', before: '\n---\n' },
];

const headings = [
  { icon: Heading1, label: 'Heading 1', before: '# ' },
  { icon: Heading2, label: 'Heading 2', before: '## ' },
  { icon: Heading3, label: 'Heading 3', before: '### ' },
];

export default function NoteToolbar({ preview, onTogglePreview, onInsert, saveStatus }: Props) {
  return (
    <div className="flex items-center gap-1 px-4 py-1.5 border-b border-border bg-card/50 flex-shrink-0 overflow-x-auto scrollbar-none">
      <Tooltip>
        <TooltipTrigger asChild>
          <button
            onClick={onTogglePreview}
            className={cn(
              'p-1.5 rounded transition-colors',
              preview ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground hover:bg-accent',
            )}
          >
            {preview ? <Edit3 size={13} /> : <Eye size={13} />}
          </button>
        </TooltipTrigger>
        <TooltipContent>{preview ? 'Edit' : 'Preview'}</TooltipContent>
      </Tooltip>

      <div className="w-px h-4 bg-border mx-0.5" />

      {tools.map(({ icon: Icon, label, before, after = '' }) => (
        <Tooltip key={label}>
          <TooltipTrigger asChild>
            <button
              onClick={() => onInsert(before, after)}
              className="p-1.5 rounded text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
            >
              <Icon size={13} />
            </button>
          </TooltipTrigger>
          <TooltipContent>{label}</TooltipContent>
        </Tooltip>
      ))}

      <div className="w-px h-4 bg-border mx-0.5" />

      {headings.map(({ icon: Icon, label, before }) => (
        <Tooltip key={label}>
          <TooltipTrigger asChild>
            <button
              onClick={() => onInsert(before)}
              className="p-1.5 rounded text-muted-foreground hover:text-foreground hover:bg-accent transition-colors font-mono text-xs"
            >
              <Icon size={13} />
            </button>
          </TooltipTrigger>
          <TooltipContent>{label}</TooltipContent>
        </Tooltip>
      ))}

      <div className="flex-1" />

      <span className="text-[10px] text-muted-foreground tabular-nums">
        {saveStatus === 'saving' && 'Saving...'}
        {saveStatus === 'saved' && 'Saved'}
      </span>
    </div>
  );
}
