import { useEffect, useRef, useCallback } from 'react'
import { useEditor, EditorContent } from '@tiptap/react'
import { getExtensions } from './editor/extensions'
import BubbleMenu from './editor/bubble-menu'
import EditorToolbar from './editor/toolbar'
import { cn } from '@/lib/utils'
import type { Editor } from '@tiptap/core'

interface Props {
  content: string
  onChange: (markdown: string) => void
  placeholder?: string
  className?: string
}

export default function MarkdownEditor({ content, onChange, placeholder, className }: Props) {
  const isInternalUpdate = useRef(false)
  const prevContentRef = useRef(content)

  const editor = useEditor({
    extensions: getExtensions(placeholder),
    content,
    contentType: 'markdown',
    onUpdate: ({ editor }) => {
      isInternalUpdate.current = true
      const md = editor.getMarkdown()
      onChange(md)
    },
  })

  const syncContent = useCallback((editor: Editor, newContent: string) => {
    if (isInternalUpdate.current) {
      isInternalUpdate.current = false
      return
    }
    const currentMd = editor.getMarkdown()
    if (newContent !== currentMd) {
      editor.commands.setContent(newContent, { contentType: 'markdown' })
    }
  }, [])

  useEffect(() => {
    if (editor && content !== prevContentRef.current) {
      prevContentRef.current = content
      syncContent(editor, content)
    }
  }, [content, editor, syncContent])

  useEffect(() => {
    return () => {
      editor?.destroy()
    }
  }, [editor])

  if (!editor) return null

  return (
    <div className={cn('rounded-lg overflow-hidden border border-border bg-card', className)}>
      <EditorToolbar editor={editor} />
      <BubbleMenu editor={editor} />
      <div className="px-4 py-3">
        <EditorContent editor={editor} className="outline-none" />
      </div>
    </div>
  )
}
