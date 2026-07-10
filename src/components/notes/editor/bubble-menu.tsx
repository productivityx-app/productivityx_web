import { useEffect, useRef, useState, useCallback } from 'react'
import { createPortal } from 'react-dom'
import type { Editor } from '@tiptap/core'
import {
  Bold, Italic, Underline, Strikethrough, Code, Link, Highlighter as HighlightIcon,
} from 'lucide-react'
import { computePosition, autoUpdate, offset, shift, flip } from '@floating-ui/dom'
import { cn } from '@/lib/utils'

interface Props {
  editor: Editor | null
}

export default function BubbleMenu({ editor }: Props) {
  const [show, setShow] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)
  const cleanupRef = useRef<(() => void) | null>(null)

  const addLink = useCallback(() => {
    if (!editor) return
    const prev = editor.getAttributes('link').href
    const url = window.prompt('URL', prev || 'https://')
    if (url === null) return
    if (url === '') {
      editor.chain().focus().extendMarkRange('link').unsetLink().run()
      return
    }
    editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run()
  }, [editor])

  useEffect(() => {
    if (!editor || !menuRef.current) return

    const updatePosition = () => {
      const { selection } = editor.state
      const { from, to, empty } = selection
      if (empty || !editor.view.dom) {
        setShow(false)
        return
      }

      const start = editor.view.coordsAtPos(from)
      const end = editor.view.coordsAtPos(to)
      const range = {
        getBoundingClientRect: () => ({
          x: start.left,
          y: start.top,
          width: end.right - start.left,
          height: Math.abs(end.bottom - start.top),
          top: start.top,
          bottom: end.bottom,
          left: start.left,
          right: end.right,
        }),
      }

      const menuEl = menuRef.current
      if (!menuEl) return

      computePosition(range, menuEl, {
        placement: 'top',
        middleware: [offset(8), flip(), shift()],
      }).then(({ x, y }) => {
        menuEl.style.left = `${x}px`
        menuEl.style.top = `${y}px`
      })

      setShow(true)
    }

    const handleSelectionUpdate = () => {
      requestAnimationFrame(updatePosition)
    }

    editor.on('selectionUpdate', handleSelectionUpdate)
    editor.on('blur', () => setShow(false))

    return () => {
      editor.off('selectionUpdate', handleSelectionUpdate)
      editor.off('blur', () => setShow(false))
      if (cleanupRef.current) {
        cleanupRef.current()
        cleanupRef.current = null
      }
    }
  }, [editor])

  if (!editor) return null

  const buttons = [
    {
      icon: Bold,
      action: () => editor.chain().focus().toggleBold().run(),
      isActive: editor.isActive('bold'),
      title: 'Bold',
    },
    {
      icon: Italic,
      action: () => editor.chain().focus().toggleItalic().run(),
      isActive: editor.isActive('italic'),
      title: 'Italic',
    },
    {
      icon: Underline,
      action: () => editor.chain().focus().toggleUnderline().run(),
      isActive: editor.isActive('underline'),
      title: 'Underline',
    },
    {
      icon: Strikethrough,
      action: () => editor.chain().focus().toggleStrike().run(),
      isActive: editor.isActive('strike'),
      title: 'Strikethrough',
    },
    {
      icon: Code,
      action: () => editor.chain().focus().toggleCode().run(),
      isActive: editor.isActive('code'),
      title: 'Code',
    },
    {
      icon: HighlightIcon,
      action: () => editor.chain().focus().toggleHighlight().run(),
      isActive: editor.isActive('highlight'),
      title: 'Highlight',
    },
    {
      icon: Link,
      action: addLink,
      isActive: editor.isActive('link'),
      title: 'Link',
    },
  ]

  return createPortal(
    <div
      ref={menuRef}
      className={cn(
        'flex items-center gap-0.5 px-1.5 py-1 rounded-xl border border-border bg-popover shadow-lg backdrop-blur-xl z-50',
        show ? 'pointer-events-auto' : 'pointer-events-none opacity-0',
      )}
      style={{ position: 'fixed', left: '-9999px', top: '-9999px' }}
    >
      {buttons.map(({ icon: Icon, action, isActive, title }) => (
        <button
          key={title}
          type="button"
          onMouseDown={(e) => { e.preventDefault(); action() }}
          title={title}
          className={cn(
            'p-1.5 rounded-lg transition-colors',
            isActive
              ? 'text-primary bg-primary/10'
              : 'text-muted-foreground hover:text-foreground hover:bg-accent',
          )}
        >
          <Icon size={14} />
        </button>
      ))}
    </div>,
    document.body,
  )
}
