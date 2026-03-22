import { createFileRoute, useNavigate, useRouter } from '@tanstack/react-router'
import { useState, useEffect, useCallback, useRef } from 'react'
import { getPostById, updatePost } from '~/server/functions/posts'
import { TiptapEditor } from '~/components/editor/TiptapEditor'
import { ImageUpload } from '~/components/common/ImageUpload'
import { TagInput } from '~/components/common/TagInput'
import { Button } from '~/components/ui/button'
import { Input } from '~/components/ui/input'
import { Textarea } from '~/components/ui/textarea'
import { useToast } from '~/components/ui/toast'
import { slugify } from '~/lib/utils'
import { getAuthHeaders } from '~/lib/auth-headers'
import { Save, Loader2, Check } from 'lucide-react'

export const Route = createFileRoute('/admin/posts/$id/edit')({
  loader: ({ params }) => getPostById({ data: { id: params.id } }),
  component: EditPostPage,
})

function EditPostPage() {
  const post = Route.useLoaderData()
  const router = useRouter()
  const { toast } = useToast()
  const [saving, setSaving] = useState(false)
  const [autoSaveStatus, setAutoSaveStatus] = useState<'saved' | 'saving' | 'idle'>('idle')
  const autoSaveTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  const [title, setTitle] = useState(post.title)
  const [slug, setSlug] = useState(post.slug)
  const [excerpt, setExcerpt] = useState(post.excerpt || '')
  const [coverImage, setCoverImage] = useState(post.cover_image_url || '')
  const [tags, setTags] = useState<string[]>(post.tags || [])
  const [published, setPublished] = useState(post.published)
  const [content, setContent] = useState<Record<string, unknown>>(post.content as Record<string, unknown>)

  const savePost = useCallback(async (showToast = true) => {
    setSaving(true)
    setAutoSaveStatus('saving')
    try {
      const headers = await getAuthHeaders()
      await updatePost({
        headers,
        data: {
          id: post.id,
          title,
          slug,
          content,
          excerpt,
          cover_image_url: coverImage,
          published,
          published_at: published && !post.published_at ? new Date().toISOString() : post.published_at,
          tags,
        },
      })
      setAutoSaveStatus('saved')
      if (showToast) toast('Post saved!', 'success')
      router.invalidate()
    } catch (err: any) {
      setAutoSaveStatus('idle')
      if (showToast) toast(err.message || 'Failed to save', 'error')
    } finally {
      setSaving(false)
    }
  }, [title, slug, content, excerpt, coverImage, published, tags, post.id, post.published_at, toast, router])

  // Auto-save on content change
  const handleContentChange = useCallback((newContent: Record<string, unknown>) => {
    setContent(newContent)
    setAutoSaveStatus('idle')
    if (autoSaveTimer.current) clearTimeout(autoSaveTimer.current)
    autoSaveTimer.current = setTimeout(() => {
      setAutoSaveStatus('saving')
    }, 3000)
  }, [])

  useEffect(() => {
    if (autoSaveStatus === 'saving' && !saving) {
      savePost(false)
    }
  }, [autoSaveStatus, saving, savePost])

  // Warn before navigating away with unsaved changes
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (autoSaveStatus === 'idle' && autoSaveTimer.current) {
        e.preventDefault()
      }
    }
    window.addEventListener('beforeunload', handleBeforeUnload)
    return () => window.removeEventListener('beforeunload', handleBeforeUnload)
  }, [autoSaveStatus])

  return (
    <div className="max-w-4xl">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-bold">Edit Post</h1>
          {autoSaveStatus === 'saving' && (
            <span className="text-xs text-[hsl(var(--muted-foreground))] flex items-center gap-1">
              <Loader2 className="h-3 w-3 animate-spin" /> Saving...
            </span>
          )}
          {autoSaveStatus === 'saved' && (
            <span className="text-xs text-emerald-500 flex items-center gap-1">
              <Check className="h-3 w-3" /> Saved
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={published}
              onChange={(e) => setPublished(e.target.checked)}
              className="rounded"
            />
            Published
          </label>
          <Button onClick={() => savePost()} disabled={saving} className="gap-2">
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            Save
          </Button>
        </div>
      </div>

      <div className="space-y-6">
        <ImageUpload value={coverImage} onChange={setCoverImage} path="covers" />

        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Post title"
          className="w-full text-3xl font-bold bg-transparent border-none outline-none placeholder:text-[hsl(var(--muted-foreground))]/50"
        />

        <div className="flex items-center gap-2">
          <span className="text-sm text-[hsl(var(--muted-foreground))]">/blog/</span>
          <Input value={slug} onChange={(e) => setSlug(e.target.value)} placeholder="post-slug" className="flex-1" />
        </div>

        <Textarea
          value={excerpt}
          onChange={(e) => setExcerpt(e.target.value)}
          placeholder="Write a brief excerpt..."
          rows={2}
        />

        <div>
          <label className="text-sm font-medium mb-1.5 block">Tags</label>
          <TagInput value={tags} onChange={setTags} />
        </div>

        <div className="min-h-[400px] rounded-lg border border-[hsl(var(--border))] p-4">
          <TiptapEditor content={content} onChange={handleContentChange} />
        </div>
      </div>
    </div>
  )
}
