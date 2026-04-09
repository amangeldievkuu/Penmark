import { createFileRoute, useNavigate, useRouter } from '@tanstack/react-router'
import { useEffect, useState } from 'react'
import { createPost } from '~/server/functions/posts'
import { TiptapEditor } from '~/components/editor/TiptapEditor'
import { ImageUpload } from '~/components/common/ImageUpload'
import { TagInput } from '~/components/common/TagInput'
import { Button } from '~/components/ui/button'
import { Input } from '~/components/ui/input'
import { Textarea } from '~/components/ui/textarea'
import { useToast } from '~/components/ui/toast'
import { useKyrgyzFieldTransliteration } from '~/hooks/use-kyrgyz-field-transliteration'
import { slugify } from '~/lib/utils'
import { getAuthHeaders } from '~/lib/auth-headers'
import { Loader2, Save } from 'lucide-react'

export const Route = createFileRoute('/admin/posts/new')({
  component: NewPostPage,
})

function NewPostPage() {
  const navigate = useNavigate()
  const router = useRouter()
  const { toast } = useToast()
  const [saving, setSaving] = useState(false)

  const [title, setTitle] = useState('')
  const [slug, setSlug] = useState('')
  const [excerpt, setExcerpt] = useState('')
  const [coverImage, setCoverImage] = useState('')
  const [tags, setTags] = useState<string[]>([])
  const [published, setPublished] = useState(false)
  const [content, setContent] = useState<Record<string, unknown>>({})
  const [slugEdited, setSlugEdited] = useState(false)
  const [kyrgyzTypingEnabled, setKyrgyzTypingEnabled] = useState(false)
  const titleTransliteration = useKyrgyzFieldTransliteration<HTMLInputElement>(
    kyrgyzTypingEnabled,
    title,
    setTitle,
  )
  const excerptTransliteration = useKyrgyzFieldTransliteration<HTMLTextAreaElement>(
    kyrgyzTypingEnabled,
    excerpt,
    setExcerpt,
  )

  useEffect(() => {
    if (!slugEdited) {
      setSlug(slugify(title))
    }
  }, [title, slugEdited])

  const handleSave = async () => {
    if (!title.trim()) {
      toast('Title is required', 'error')
      return
    }
    if (!slug.trim()) {
      toast('Slug is required', 'error')
      return
    }

    setSaving(true)
    try {
      const headers = await getAuthHeaders()
      const post = await createPost({
        headers,
        data: {
          title,
          slug,
          content,
          excerpt,
          cover_image_url: coverImage,
          published,
          published_at: published ? new Date().toISOString() : null,
          tags,
          reading_time_minutes: 1,
        },
      })
      toast('Post created!', 'success')
      router.invalidate()
      navigate({ to: '/admin/posts/$id/edit', params: { id: post.id } })
    } catch (err: any) {
      toast(err.message || 'Failed to create post', 'error')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="max-w-4xl">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">New Post</h1>
        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant={kyrgyzTypingEnabled ? 'default' : 'outline'}
            onClick={() => setKyrgyzTypingEnabled((current) => !current)}
          >
            {kyrgyzTypingEnabled ? 'Kyrgyz typing on' : 'Kyrgyz typing off'}
          </Button>
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={published}
              onChange={(e) => setPublished(e.target.checked)}
              className="rounded"
            />
            Publish
          </label>
          <Button onClick={handleSave} disabled={saving} className="gap-2">
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            {saving ? 'Saving...' : 'Save'}
          </Button>
        </div>
      </div>

      <div className="space-y-6">
        {/* Cover Image */}
        <ImageUpload value={coverImage} onChange={setCoverImage} path="covers" />

        {/* Title */}
        <input
          ref={titleTransliteration.fieldRef}
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Post title"
          className="w-full text-3xl font-bold bg-transparent border-none outline-none placeholder:text-[hsl(var(--muted-foreground))]/50"
        />

        {/* Slug */}
        <div className="flex items-center gap-2">
          <span className="text-sm text-[hsl(var(--muted-foreground))]">/blog/</span>
          <Input
            value={slug}
            onChange={(e) => { setSlug(e.target.value); setSlugEdited(true) }}
            placeholder="post-slug"
            className="flex-1"
          />
        </div>

        {/* Excerpt */}
        <Textarea
          ref={excerptTransliteration.fieldRef}
          value={excerpt}
          onChange={(e) => setExcerpt(e.target.value)}
          placeholder="Write a brief excerpt..."
          rows={2}
        />

        {/* Tags */}
        <div>
          <label className="text-sm font-medium mb-1.5 block">Tags</label>
          <TagInput
            value={tags}
            onChange={setTags}
            kyrgyzTransliteration={kyrgyzTypingEnabled}
          />
        </div>

        <div className="flex items-center justify-between gap-4">
          <div>
            <label className="text-sm font-medium block">Content</label>
            <p className="text-xs text-[hsl(var(--muted-foreground))]">
              Kyrgyz typing transliterates the title, tags, excerpt, and content. Use Latin input like
              `ng`, `oe`, `ue`, `sh`, `ch`, `j`, `y`, and `eh`.
            </p>
          </div>
        </div>

        <div className="min-h-[400px] rounded-lg border border-[hsl(var(--border))] p-4">
          <TiptapEditor
            content={content}
            onChange={setContent}
            kyrgyzTransliteration={kyrgyzTypingEnabled}
          />
        </div>
      </div>
    </div>
  )
}
