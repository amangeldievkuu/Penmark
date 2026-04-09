import { useEditor, EditorContent } from '@tiptap/react'
import { useState, useEffect, useCallback, useRef } from 'react'
import StarterKit from '@tiptap/starter-kit'
import Placeholder from '@tiptap/extension-placeholder'
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
import { common, createLowlight } from 'lowlight'
import { SlashCommandMenu } from './SlashCommandMenu'
import { FloatingToolbar } from './FloatingToolbar'
import { uploadImage } from '~/lib/storage'
import { sanitizeRichTextContent } from '~/lib/utils'
import { isLatinTransliterationInput, transliterateLatinToKyrgyz } from '~/lib/kyrgyz-transliteration'

const lowlight = createLowlight(common)

type TransliterationBuffer = {
  from: number
  raw: string
  rendered: string
}

interface TiptapEditorProps {
  content: Record<string, unknown>
  onChange: (content: Record<string, unknown>) => void
  onImageUpload?: (file: File) => Promise<string>
  editable?: boolean
  kyrgyzTransliteration?: boolean
}

export function TiptapEditor({
  content,
  onChange,
  onImageUpload,
  editable = true,
  kyrgyzTransliteration = false,
}: TiptapEditorProps) {
  const [slashOpen, setSlashOpen] = useState(false)
  const [slashPosition, setSlashPosition] = useState({ top: 0, left: 0 })
  const slashPosRef = useRef<number | null>(null)
  const slashOpenRef = useRef(false)
  const transliterationBufferRef = useRef<TransliterationBuffer | null>(null)

  // Keep ref in sync so the stale handleKeyDown closure reads current value
  useEffect(() => {
    slashOpenRef.current = slashOpen
  }, [slashOpen])

  useEffect(() => {
    transliterationBufferRef.current = null
  }, [kyrgyzTransliteration])

  const sanitizedContent = sanitizeRichTextContent(content)

  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({
        codeBlock: false,
        dropcursor: {
          color: 'hsl(239 84% 67%)',
          width: 2,
        },
      }),
      Placeholder.configure({
        placeholder: "Type '/' for commands...",
      }),
      Underline,
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: 'text-[hsl(var(--primary))] underline underline-offset-4 hover:text-[hsl(var(--primary))]/80',
        },
      }),
      Image.configure({
        HTMLAttributes: {
          class: 'rounded-lg max-w-full',
        },
      }),
      Highlight.configure({
        multicolor: true,
      }),
      TaskList,
      TaskItem.configure({
        nested: true,
      }),
      Table.configure({
        resizable: true,
      }),
      TableRow,
      TableCell,
      TableHeader,
      CodeBlockLowlight.configure({
        lowlight,
      }),
    ],
    content: Object.keys(sanitizedContent).length > 0 ? sanitizedContent : undefined,
    editable,
    onUpdate: ({ editor: e }) => {
      onChange(e.getJSON() as Record<string, unknown>)
    },
    editorProps: {
      attributes: {
        class: 'tiptap prose-container focus:outline-none',
      },
      handleTextInput: (view, from, to, text) => {
        if (!kyrgyzTransliteration) {
          transliterationBufferRef.current = null
          return false
        }

        if (!isLatinTransliterationInput(text)) {
          transliterationBufferRef.current = null
          return false
        }

        const previousBuffer = transliterationBufferRef.current
        const canExtendBuffer = Boolean(
          previousBuffer &&
          to === from &&
          from === previousBuffer.from + previousBuffer.rendered.length,
        )

        const rawInput = canExtendBuffer && previousBuffer
          ? `${previousBuffer.raw}${text}`
          : text
        const renderedInput = transliterateLatinToKyrgyz(rawInput)
        const replaceFrom = canExtendBuffer && previousBuffer ? previousBuffer.from : from
        const replaceTo = canExtendBuffer && previousBuffer
          ? previousBuffer.from + previousBuffer.rendered.length
          : to

        view.dispatch(view.state.tr.insertText(renderedInput, replaceFrom, replaceTo))
        transliterationBufferRef.current = {
          from: replaceFrom,
          raw: rawInput,
          rendered: renderedInput,
        }
        return true
      },
      handleKeyDown: (_view, event) => {
        if (
          kyrgyzTransliteration &&
          (
            event.key === 'Backspace' ||
            event.key === 'Delete' ||
            event.key === 'Enter' ||
            event.key === 'Tab' ||
            event.key.startsWith('Arrow')
          )
        ) {
          transliterationBufferRef.current = null
        }

        if (kyrgyzTransliteration && event.key.length === 1 && !/[A-Za-z]/.test(event.key)) {
          transliterationBufferRef.current = null
        }

        if (event.key === '/' && !slashOpenRef.current) {
          const domSelection = window.getSelection()
          if (domSelection && domSelection.rangeCount > 0) {
            const range = domSelection.getRangeAt(0)
            const rect = range.getBoundingClientRect()
            setSlashPosition({ top: rect.bottom, left: rect.left })
            slashPosRef.current = _view.state.selection.from
            setTimeout(() => setSlashOpen(true), 10)
          }
          return false
        }
        if (slashOpenRef.current) {
          // Let the SlashCommandMenu handle all keys while open
          // Consume printable keys so they don't get inserted into the editor
          if (event.key === ' ') {
            setSlashOpen(false)
            return false
          }
          if (event.key.length === 1 && !event.ctrlKey && !event.metaKey) {
            return true // consume — SlashCommandMenu captures via document listener
          }
          if (event.key === 'Backspace' || event.key === 'ArrowUp' || event.key === 'ArrowDown' || event.key === 'Enter' || event.key === 'Escape') {
            return true // consume — SlashCommandMenu handles these
          }
        }
        return false
      },
    },
  })

  // Handle image upload from slash command
  useEffect(() => {
    const handleImageUpload = async (e: Event) => {
      const file = (e as CustomEvent).detail.file as File
      if (!editor) return

      try {
        let url: string
        if (onImageUpload) {
          url = await onImageUpload(file)
        } else {
          url = await uploadImage(file, 'posts')
        }
        editor.chain().focus().setImage({ src: url }).run()
      } catch (err) {
        console.error('Failed to upload image:', err)
      }
    }

    document.addEventListener('editor-image-upload', handleImageUpload)
    return () => document.removeEventListener('editor-image-upload', handleImageUpload)
  }, [editor, onImageUpload])

  const handleSlashClose = useCallback(() => {
    setSlashOpen(false)
    slashPosRef.current = null
  }, [])

  if (!editor) return null

  return (
    <div className="relative">
      {editable && <FloatingToolbar editor={editor} />}
      {editable && (
        <SlashCommandMenu
          editor={editor}
          isOpen={slashOpen}
          position={slashPosition}
          onClose={handleSlashClose}
        />
      )}
      <EditorContent editor={editor} />
    </div>
  )
}
