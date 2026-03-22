import { useEffect, useRef, useState } from 'react'
import { type Editor } from '@tiptap/core'
import {
  Bold, Italic, Underline, Strikethrough, Code, Link2, Highlighter,
} from 'lucide-react'
import { cn } from '~/lib/utils'

interface FloatingToolbarProps {
  editor: Editor
}

export function FloatingToolbar({ editor }: FloatingToolbarProps) {
  const toolbarRef = useRef<HTMLDivElement>(null)
  const [position, setPosition] = useState<{ top: number; left: number } | null>(null)
  const [linkInput, setLinkInput] = useState('')
  const [showLinkInput, setShowLinkInput] = useState(false)

  useEffect(() => {
    const updatePosition = () => {
      const { from, to, empty } = editor.state.selection
      if (empty || from === to) {
        setPosition(null)
        setShowLinkInput(false)
        return
      }

      const domSelection = window.getSelection()
      if (!domSelection || domSelection.rangeCount === 0) {
        setPosition(null)
        return
      }

      const range = domSelection.getRangeAt(0)
      const rect = range.getBoundingClientRect()

      if (rect.width === 0) {
        setPosition(null)
        return
      }

      setPosition({
        top: rect.top - 48 + window.scrollY,
        left: rect.left + rect.width / 2,
      })
    }

    editor.on('selectionUpdate', updatePosition)
    editor.on('transaction', updatePosition)

    return () => {
      editor.off('selectionUpdate', updatePosition)
      editor.off('transaction', updatePosition)
    }
  }, [editor])

  if (!position) return null

  const tools = [
    {
      icon: Bold,
      label: 'Bold',
      active: editor.isActive('bold'),
      action: () => editor.chain().focus().toggleBold().run(),
    },
    {
      icon: Italic,
      label: 'Italic',
      active: editor.isActive('italic'),
      action: () => editor.chain().focus().toggleItalic().run(),
    },
    {
      icon: Underline,
      label: 'Underline',
      active: editor.isActive('underline'),
      action: () => editor.chain().focus().toggleUnderline().run(),
    },
    {
      icon: Strikethrough,
      label: 'Strikethrough',
      active: editor.isActive('strike'),
      action: () => editor.chain().focus().toggleStrike().run(),
    },
    {
      icon: Code,
      label: 'Code',
      active: editor.isActive('code'),
      action: () => editor.chain().focus().toggleCode().run(),
    },
    {
      icon: Highlighter,
      label: 'Highlight',
      active: editor.isActive('highlight'),
      action: () => editor.chain().focus().toggleHighlight().run(),
    },
    {
      icon: Link2,
      label: 'Link',
      active: editor.isActive('link'),
      action: () => {
        if (editor.isActive('link')) {
          editor.chain().focus().unsetLink().run()
        } else {
          setShowLinkInput(true)
          setLinkInput('')
        }
      },
    },
  ]

  const handleLinkSubmit = () => {
    if (linkInput) {
      const url = linkInput.startsWith('http') ? linkInput : `https://${linkInput}`
      editor.chain().focus().setLink({ href: url }).run()
    }
    setShowLinkInput(false)
    setLinkInput('')
  }

  return (
    <div
      ref={toolbarRef}
      className="fixed z-50 flex items-center gap-0.5 rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--popover))] p-1 shadow-xl"
      style={{
        top: position.top,
        left: position.left,
        transform: 'translateX(-50%)',
      }}
    >
      {showLinkInput ? (
        <form
          onSubmit={(e) => { e.preventDefault(); handleLinkSubmit() }}
          className="flex items-center gap-1 px-1"
        >
          <input
            type="text"
            value={linkInput}
            onChange={(e) => setLinkInput(e.target.value)}
            placeholder="Enter URL..."
            className="h-7 w-48 rounded-md border-0 bg-transparent px-2 text-sm focus:outline-none"
            autoFocus
            onKeyDown={(e) => { if (e.key === 'Escape') setShowLinkInput(false) }}
          />
          <button
            type="submit"
            className="rounded-md px-2 py-1 text-xs font-medium bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))]"
          >
            Add
          </button>
        </form>
      ) : (
        tools.map((tool) => (
          <button
            key={tool.label}
            onClick={tool.action}
            className={cn(
              'rounded-md p-1.5 transition-colors hover:bg-[hsl(var(--accent))]',
              tool.active && 'bg-[hsl(var(--accent))] text-[hsl(var(--primary))]',
            )}
            title={tool.label}
            type="button"
          >
            <tool.icon className="h-3.5 w-3.5" />
          </button>
        ))
      )}
    </div>
  )
}
