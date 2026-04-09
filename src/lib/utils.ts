import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

export function slugifyHeading(text: string): string {
  return slugify(text) || 'section'
}

export function createHeadingIdGenerator() {
  const seen = new Map<string, number>()

  return (text: string) => {
    const base = slugifyHeading(text)
    const count = (seen.get(base) ?? 0) + 1
    seen.set(base, count)

    return count === 1 ? base : `${base}-${count}`
  }
}

type RichTextNode = {
  type?: string
  text?: string
  attrs?: Record<string, unknown>
  marks?: Array<{ type?: string; attrs?: Record<string, unknown> }>
  content?: RichTextNode[]
}

type RichTextDocument = {
  type?: string
  content?: RichTextNode[]
  attrs?: Record<string, unknown>
}

export type HeadingOutlineItem = {
  level: number
  text: string
  id: string
}

const unsupportedMarkTypes = new Set(['textStyle'])

function getNodeText(node: RichTextNode): string {
  if (typeof node.text === 'string') {
    return node.text
  }

  if (!node.content) {
    return ''
  }

  return node.content.map(getNodeText).join('')
}

export function sanitizeRichTextContent(content: Record<string, unknown> | null | undefined): Record<string, unknown> {
  function visit(node: RichTextNode): RichTextNode {
    return {
      ...node,
      marks: node.marks?.filter((mark) => !unsupportedMarkTypes.has(mark.type ?? '')),
      content: node.content?.map(visit),
    }
  }

  const document = (content ?? { type: 'doc', content: [] }) as RichTextDocument
  return visit(document) as Record<string, unknown>
}

export function annotateHeadings(content: Record<string, unknown> | null | undefined): {
  content: Record<string, unknown>
  headings: HeadingOutlineItem[]
} {
  const getHeadingId = createHeadingIdGenerator()
  const headings: HeadingOutlineItem[] = []

  function visit(node: RichTextNode): RichTextNode {
    const nextContent = node.content?.map(visit)

    if (node.type === 'heading') {
      const text = getNodeText({ ...node, content: nextContent }).trim()
      const id = getHeadingId(text)
      const level = typeof node.attrs?.level === 'number' ? node.attrs.level : 2

      headings.push({ level, text, id })

      return {
        ...node,
        attrs: {
          ...node.attrs,
          id,
        },
        content: nextContent,
      }
    }

    return {
      ...node,
      content: nextContent,
    }
  }

  const document = sanitizeRichTextContent(content) as RichTextDocument

  return {
    content: visit(document) as Record<string, unknown>,
    headings,
  }
}

export function formatDate(date: string | Date): string {
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(new Date(date))
}

export function formatDateShort(date: string | Date): string {
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }).format(new Date(date))
}

export function estimateReadingTime(content: string): number {
  const wordsPerMinute = 200
  const words = content.replace(/<[^>]*>/g, '').split(/\s+/).length
  return Math.max(1, Math.ceil(words / wordsPerMinute))
}
