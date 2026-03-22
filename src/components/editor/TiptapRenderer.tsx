import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Heading from '@tiptap/extension-heading'
import Underline from '@tiptap/extension-underline'
import Link from '@tiptap/extension-link'
import Image from '@tiptap/extension-image'
import Highlight from '@tiptap/extension-highlight'
import TaskList from '@tiptap/extension-task-list'
import TaskItem from '@tiptap/extension-task-item'
import Table from '@tiptap/extension-table'
import TableRow from '@tiptap/extension-table-row'
import TableCell from '@tiptap/extension-table-cell'
import TableHeader from '@tiptap/extension-table-header'
import CodeBlockLowlight from '@tiptap/extension-code-block-lowlight'
import TextStyle from '@tiptap/extension-text-style'
import Color from '@tiptap/extension-color'
import { common, createLowlight } from 'lowlight'

const lowlight = createLowlight(common)

interface TiptapRendererProps {
  content: Record<string, unknown>
}

export function TiptapRenderer({ content }: TiptapRendererProps) {
  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({ codeBlock: false, heading: false }),
      Heading.configure({ levels: [1, 2, 3, 4, 5, 6] }).extend({
        renderHTML({ node, HTMLAttributes }) {
          const text = node.textContent
          const id = text.toLowerCase().replace(/[^\w]+/g, '-')
          return [`h${node.attrs.level}`, { ...HTMLAttributes, id, style: 'scroll-margin-top: 5rem' }, 0]
        },
      }),
      Underline,
      Link.configure({
        openOnClick: true,
        HTMLAttributes: {
          class: 'text-[hsl(var(--primary))] underline underline-offset-4',
          target: '_blank',
          rel: 'noopener noreferrer',
        },
      }),
      Image.configure({
        HTMLAttributes: { class: 'rounded-lg max-w-full' },
      }),
      Highlight,
      TaskList,
      TaskItem,
      Table,
      TableRow,
      TableCell,
      TableHeader,
      CodeBlockLowlight.configure({ lowlight }),
      TextStyle,
      Color,
    ],
    content,
    editable: false,
  })

  if (!editor) return null

  return (
    <div className="tiptap-renderer">
      <EditorContent editor={editor} />
    </div>
  )
}
