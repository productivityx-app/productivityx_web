import type { Editor } from '@tiptap/core'
import {
  Bold, Italic, Underline, Strikethrough, Code, Quote, List, ListOrdered,
  CheckSquare, Minus, Heading1, Heading2, Heading3, Image as ImageIcon,
  Table2, Link, Highlighter as HighlightIcon, Undo, Redo,
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface Props {
  editor: Editor | null
}

type ToolButton = {
  icon: typeof Bold
  action: () => void
  isActive?: () => boolean
  title: string
}

export default function EditorToolbar({ editor }: Props) {
  if (!editor) return null

  const addLink = () => {
    const prev = editor.getAttributes('link').href
    const url = window.prompt('URL', prev || 'https://')
    if (url === null) return
    if (url === '') {
      editor.chain().focus().extendMarkRange('link').unsetLink().run()
      return
    }
    editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run()
  }

  const addImage = () => {
    const url = window.prompt('Image URL')
    if (url) editor.chain().focus().setImage({ src: url }).run()
  }

  const addTable = () => {
    editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run()
  }

  const groups: ToolButton[][] = [
    [
      { icon: Bold, action: () => editor.chain().focus().toggleBold().run(), isActive: () => editor.isActive('bold'), title: 'Bold' },
      { icon: Italic, action: () => editor.chain().focus().toggleItalic().run(), isActive: () => editor.isActive('italic'), title: 'Italic' },
      { icon: Underline, action: () => editor.chain().focus().toggleUnderline().run(), isActive: () => editor.isActive('underline'), title: 'Underline' },
      { icon: Strikethrough, action: () => editor.chain().focus().toggleStrike().run(), isActive: () => editor.isActive('strike'), title: 'Strikethrough' },
      { icon: Code, action: () => editor.chain().focus().toggleCode().run(), isActive: () => editor.isActive('code'), title: 'Code' },
      { icon: HighlightIcon, action: () => editor.chain().focus().toggleHighlight().run(), isActive: () => editor.isActive('highlight'), title: 'Highlight' },
    ],
    [
      { icon: Heading1, action: () => editor.chain().focus().toggleHeading({ level: 1 }).run(), isActive: () => editor.isActive('heading', { level: 1 }), title: 'Heading 1' },
      { icon: Heading2, action: () => editor.chain().focus().toggleHeading({ level: 2 }).run(), isActive: () => editor.isActive('heading', { level: 2 }), title: 'Heading 2' },
      { icon: Heading3, action: () => editor.chain().focus().toggleHeading({ level: 3 }).run(), isActive: () => editor.isActive('heading', { level: 3 }), title: 'Heading 3' },
    ],
    [
      { icon: Quote, action: () => editor.chain().focus().toggleBlockquote().run(), isActive: () => editor.isActive('blockquote'), title: 'Blockquote' },
      { icon: List, action: () => editor.chain().focus().toggleBulletList().run(), isActive: () => editor.isActive('bulletList'), title: 'Bullet list' },
      { icon: ListOrdered, action: () => editor.chain().focus().toggleOrderedList().run(), isActive: () => editor.isActive('orderedList'), title: 'Numbered list' },
      { icon: CheckSquare, action: () => editor.chain().focus().toggleTaskList().run(), isActive: () => editor.isActive('taskList'), title: 'Task list' },
      { icon: Minus, action: () => editor.chain().focus().setHorizontalRule().run(), isActive: undefined, title: 'Divider' },
    ],
    [
      { icon: Link, action: addLink, isActive: () => editor.isActive('link'), title: 'Link' },
      { icon: ImageIcon, action: addImage, isActive: undefined, title: 'Image' },
      { icon: Table2, action: addTable, isActive: () => editor.isActive('table'), title: 'Table' },
    ],
    [
      { icon: Undo, action: () => editor.chain().focus().undo().run(), isActive: undefined, title: 'Undo' },
      { icon: Redo, action: () => editor.chain().focus().redo().run(), isActive: undefined, title: 'Redo' },
    ],
  ]

  return (
    <div className="flex items-center gap-0.5 px-3 py-1.5 border-b border-border bg-card/50 flex-shrink-0 overflow-x-auto scrollbar-none">
      {groups.map((group, gi) => (
        <div key={gi} className="flex items-center gap-0.5">
          {gi > 0 && <div className="w-px h-5 bg-border mx-1 flex-shrink-0" />}
          {group.map(({ icon: Icon, action, isActive, title }) => (
            <button
              key={title}
              type="button"
              onClick={action}
              title={title}
              className={cn(
                'p-1.5 rounded-lg transition-colors flex-shrink-0',
                isActive?.()
                  ? 'text-primary bg-primary/10'
                  : 'text-muted-foreground hover:text-foreground hover:bg-accent',
              )}
            >
              <Icon size={14} />
            </button>
          ))}
        </div>
      ))}
    </div>
  )
}
