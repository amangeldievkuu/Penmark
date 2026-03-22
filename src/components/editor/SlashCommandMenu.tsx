import { useState, useEffect, useCallback, useRef } from 'react'
import { type Editor } from '@tiptap/core'
import {
  Heading1, Heading2, Heading3, Type, List, ListOrdered, CheckSquare,
  Quote, Code2, ImageIcon, Minus, Table, AlertCircle,
} from 'lucide-react'
import { cn } from '~/lib/utils'

interface CommandItem {
  title: string
  description: string
  icon: React.ElementType
  command: (editor: Editor) => void
}

const commands: CommandItem[] = [
  {
    title: 'Heading 1',
    description: 'Large section heading',
    icon: Heading1,
    command: (editor) => editor.chain().focus().toggleHeading({ level: 1 }).run(),
  },
  {
    title: 'Heading 2',
    description: 'Medium section heading',
    icon: Heading2,
    command: (editor) => editor.chain().focus().toggleHeading({ level: 2 }).run(),
  },
  {
    title: 'Heading 3',
    description: 'Small section heading',
    icon: Heading3,
    command: (editor) => editor.chain().focus().toggleHeading({ level: 3 }).run(),
  },
  {
    title: 'Paragraph',
    description: 'Plain text block',
    icon: Type,
    command: (editor) => editor.chain().focus().setParagraph().run(),
  },
  {
    title: 'Bullet List',
    description: 'Create a bullet list',
    icon: List,
    command: (editor) => editor.chain().focus().toggleBulletList().run(),
  },
  {
    title: 'Numbered List',
    description: 'Create a numbered list',
    icon: ListOrdered,
    command: (editor) => editor.chain().focus().toggleOrderedList().run(),
  },
  {
    title: 'To-do List',
    description: 'Track tasks with checkboxes',
    icon: CheckSquare,
    command: (editor) => editor.chain().focus().toggleTaskList().run(),
  },
  {
    title: 'Blockquote',
    description: 'Capture a quote',
    icon: Quote,
    command: (editor) => editor.chain().focus().toggleBlockquote().run(),
  },
  {
    title: 'Code Block',
    description: 'Code with syntax highlighting',
    icon: Code2,
    command: (editor) => editor.chain().focus().toggleCodeBlock().run(),
  },
  {
    title: 'Image',
    description: 'Upload or embed an image',
    icon: ImageIcon,
    command: (editor) => {
      const input = document.createElement('input')
      input.type = 'file'
      input.accept = 'image/*'
      input.onchange = async () => {
        const file = input.files?.[0]
        if (!file) return
        // Trigger custom event that the editor wrapper will handle
        const event = new CustomEvent('editor-image-upload', { detail: { file } })
        document.dispatchEvent(event)
      }
      input.click()
    },
  },
  {
    title: 'Divider',
    description: 'Visual divider line',
    icon: Minus,
    command: (editor) => editor.chain().focus().setHorizontalRule().run(),
  },
  {
    title: 'Table',
    description: 'Add a table',
    icon: Table,
    command: (editor) => editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run(),
  },
]

interface SlashCommandMenuProps {
  editor: Editor
  isOpen: boolean
  position: { top: number; left: number }
  onClose: () => void
}

export function SlashCommandMenu({ editor, isOpen, position, onClose }: SlashCommandMenuProps) {
  const [query, setQuery] = useState('')
  const [selectedIndex, setSelectedIndex] = useState(0)
  const menuRef = useRef<HTMLDivElement>(null)

  const filtered = commands.filter(
    (cmd) =>
      cmd.title.toLowerCase().includes(query.toLowerCase()) ||
      cmd.description.toLowerCase().includes(query.toLowerCase()),
  )

  const executeCommand = useCallback(
    (index: number) => {
      const item = filtered[index]
      if (item) {
        // Delete just the `/` character (query text was never inserted into the editor)
        const { from } = editor.state.selection
        const charBefore = editor.state.doc.textBetween(Math.max(0, from - 1), from)
        if (charBefore === '/') {
          editor.chain().focus().deleteRange({ from: from - 1, to: from }).run()
        }
        item.command(editor)
        onClose()
      }
    },
    [editor, filtered, onClose],
  )

  useEffect(() => {
    if (!isOpen) {
      setQuery('')
      setSelectedIndex(0)
      return
    }

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowDown') {
        e.preventDefault()
        setSelectedIndex((i) => (i + 1) % filtered.length)
      } else if (e.key === 'ArrowUp') {
        e.preventDefault()
        setSelectedIndex((i) => (i - 1 + filtered.length) % filtered.length)
      } else if (e.key === 'Enter') {
        e.preventDefault()
        executeCommand(selectedIndex)
      } else if (e.key === 'Escape') {
        onClose()
      } else if (e.key === 'Backspace' && query === '') {
        onClose()
      } else if (e.key.length === 1 && !e.ctrlKey && !e.metaKey) {
        setQuery((q) => q + e.key)
        setSelectedIndex(0)
      } else if (e.key === 'Backspace') {
        setQuery((q) => q.slice(0, -1))
        setSelectedIndex(0)
      }
    }

    document.addEventListener('keydown', handleKeyDown, true)
    return () => document.removeEventListener('keydown', handleKeyDown, true)
  }, [isOpen, query, selectedIndex, filtered.length, executeCommand, onClose])

  useEffect(() => {
    setSelectedIndex(0)
  }, [query])

  if (!isOpen || filtered.length === 0) return null

  return (
    <div
      ref={menuRef}
      className="fixed z-50 w-72 rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--popover))] p-1.5 shadow-xl"
      style={{
        top: Math.min(position.top + 4, window.innerHeight - 340),
        left: Math.min(position.left, window.innerWidth - 300),
      }}
    >
      <div className="max-h-80 overflow-y-auto">
        {filtered.map((item, index) => (
          <button
            key={item.title}
            className={cn(
              'flex items-center gap-3 w-full rounded-lg px-3 py-2 text-left text-sm transition-colors',
              index === selectedIndex
                ? 'bg-[hsl(var(--accent))] text-[hsl(var(--accent-foreground))]'
                : 'hover:bg-[hsl(var(--accent))]',
            )}
            onClick={() => executeCommand(index)}
            onMouseEnter={() => setSelectedIndex(index)}
          >
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md border border-[hsl(var(--border))] bg-[hsl(var(--background))]">
              <item.icon className="h-4 w-4" />
            </div>
            <div>
              <div className="font-medium">{item.title}</div>
              <div className="text-xs text-[hsl(var(--muted-foreground))]">{item.description}</div>
            </div>
          </button>
        ))}
      </div>
    </div>
  )
}
