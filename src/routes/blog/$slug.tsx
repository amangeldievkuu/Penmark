import { createFileRoute, Link } from '@tanstack/react-router'
import { getPostBySlug, getAdjacentPosts } from '~/server/functions/posts'
import { TiptapRenderer } from '~/components/editor/TiptapRenderer'
import { Header } from '~/components/layout/Header'
import { Footer } from '~/components/layout/Footer'
import { Badge } from '~/components/ui/badge'
import { Avatar } from '~/components/ui/avatar'
import { Button } from '~/components/ui/button'
import { formatDate } from '~/lib/utils'
import { Clock, Calendar, ArrowLeft, ArrowRight, Share2, Twitter, LinkIcon } from 'lucide-react'
import { motion } from 'framer-motion'
import { useMemo } from 'react'
import { useToast } from '~/components/ui/toast'

export const Route = createFileRoute('/blog/$slug')({
  loader: async ({ params }) => {
    const post = await getPostBySlug({ data: { slug: params.slug } })
    const adjacent = post.published_at
      ? await getAdjacentPosts({ data: { publishedAt: post.published_at, currentId: post.id } })
      : { previous: null, next: null }
    return { post, adjacent }
  },
  head: ({ loaderData }) => {
    const post = loaderData?.post
    if (!post) return { meta: [{ title: 'Post not found | Blog' }] }
    return {
      meta: [
        { title: `${post.title} | Blog` },
        { name: 'description', content: post.excerpt || '' },
        { property: 'og:title', content: post.title },
        { property: 'og:description', content: post.excerpt || '' },
        { property: 'og:type', content: 'article' },
        ...(post.cover_image_url ? [{ property: 'og:image', content: post.cover_image_url }] : []),
        { name: 'twitter:card', content: 'summary_large_image' },
        { name: 'twitter:title', content: post.title },
        { name: 'twitter:description', content: post.excerpt || '' },
      ],
    }
  },
  component: BlogPostPage,
  errorComponent: ({ error }) => (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-2xl font-bold mb-2">Post not found</h1>
        <p className="text-[hsl(var(--muted-foreground))] mb-4">This post doesn't exist or has been removed.</p>
        <Link to="/blog"><Button>Back to blog</Button></Link>
      </div>
    </div>
  ),
})

function BlogPostPage() {
  const { post, adjacent } = Route.useLoaderData()
  const { toast } = useToast()

  const copyLink = async () => {
    await navigator.clipboard.writeText(window.location.href)
    toast('Link copied to clipboard', 'success')
  }

  // Extract headings for table of contents
  const headings = useMemo(() => {
    const result: { level: number; text: string; id: string }[] = []
    if (post.content?.content) {
      for (const node of post.content.content as Array<{ type: string; content?: Array<{ text: string }>; attrs?: { level?: number } }>) {
        if (node.type === 'heading' && node.content) {
          const text = node.content.map((c) => c.text).join('')
          result.push({
            level: node.attrs?.level ?? 2,
            text,
            id: text.toLowerCase().replace(/[^\w]+/g, '-'),
          })
        }
      }
    }
    return result
  }, [post.content])

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">
        <article>
          {/* Cover Image */}
          {post.cover_image_url && (
            <div className="relative h-64 sm:h-80 lg:h-96 overflow-hidden">
              <img
                src={post.cover_image_url}
                alt={post.title}
                loading="eager"
                decoding="async"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[hsl(var(--background))] to-transparent" />
            </div>
          )}

          <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-12">
            <div className={`flex gap-12 ${headings.length === 0 ? 'justify-center' : ''}`}>
              {/* Main content */}
              <motion.div
                className={`flex-1 max-w-3xl ${headings.length === 0 ? 'mx-auto' : ''}`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
              >
                {/* Meta */}
                <div className="flex flex-wrap gap-2 mb-4">
                  {post.tags?.map((tag: string) => (
                    <Badge key={tag} variant="secondary">{tag}</Badge>
                  ))}
                </div>

                <h1 className="text-3xl sm:text-4xl font-bold mb-4">{post.title}</h1>

                <div className="flex items-center gap-4 text-sm text-[hsl(var(--muted-foreground))] mb-8">
                  <span className="flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    {post.published_at ? formatDate(post.published_at) : formatDate(post.created_at)}
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    {post.reading_time_minutes} min read
                  </span>
                </div>

                {/* Content */}
                <div className="prose-container">
                  <TiptapRenderer content={post.content} />
                </div>

                {/* Share */}
                <div className="flex items-center gap-3 mt-12 pt-8 border-t border-[hsl(var(--border))]">
                  <span className="text-sm font-medium">Share:</span>
                  <Button variant="outline" size="sm" onClick={copyLink} className="gap-1.5">
                    <LinkIcon className="h-3.5 w-3.5" />
                    Copy link
                  </Button>
                  <a
                    href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(post.title)}&url=${encodeURIComponent(typeof window !== 'undefined' ? window.location.href : '')}`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Button variant="outline" size="sm" className="gap-1.5">
                      <Twitter className="h-3.5 w-3.5" />
                      Tweet
                    </Button>
                  </a>
                </div>

                {/* Author card */}
                {post.profiles && (
                  <div className="mt-8 max-w-sm">
                    <div className="flex items-center gap-3 p-3 rounded-lg bg-[hsl(var(--card))] border border-[hsl(var(--border))]">
                      <Avatar
                        src={post.profiles.avatar_url}
                        fallback={post.profiles.full_name || 'A'}
                        size="sm"
                      />
                      <div className="min-w-0">
                        <p className="text-sm font-medium">{post.profiles.full_name}</p>
                        {post.profiles.bio && (
                          <p className="text-xs text-[hsl(var(--muted-foreground))] truncate">
                            {post.profiles.bio}
                          </p>
                        )}
                        <div className="flex gap-2 mt-0.5">
                          {post.profiles.twitter && (
                            <a href={`https://twitter.com/${post.profiles.twitter}`} target="_blank" rel="noopener noreferrer" className="text-xs text-[hsl(var(--primary))] hover:underline">
                              @{post.profiles.twitter}
                            </a>
                          )}
                          {post.profiles.github && (
                            <a href={`https://github.com/${post.profiles.github}`} target="_blank" rel="noopener noreferrer" className="text-xs text-[hsl(var(--primary))] hover:underline">
                              GitHub
                            </a>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Prev/Next */}
                <div className="flex justify-between mt-8 gap-4">
                  {adjacent.previous ? (
                    <Link to="/blog/$slug" params={{ slug: adjacent.previous.slug }} className="flex-1">
                      <div className="p-4 rounded-lg border border-[hsl(var(--border))] hover:bg-[hsl(var(--accent))] transition-colors">
                        <span className="text-xs text-[hsl(var(--muted-foreground))] flex items-center gap-1 mb-1">
                          <ArrowLeft className="h-3 w-3" /> Previous
                        </span>
                        <p className="text-sm font-medium line-clamp-1">{adjacent.previous.title}</p>
                      </div>
                    </Link>
                  ) : <div className="flex-1" />}
                  {adjacent.next ? (
                    <Link to="/blog/$slug" params={{ slug: adjacent.next.slug }} className="flex-1 text-right">
                      <div className="p-4 rounded-lg border border-[hsl(var(--border))] hover:bg-[hsl(var(--accent))] transition-colors">
                        <span className="text-xs text-[hsl(var(--muted-foreground))] flex items-center justify-end gap-1 mb-1">
                          Next <ArrowRight className="h-3 w-3" />
                        </span>
                        <p className="text-sm font-medium line-clamp-1">{adjacent.next.title}</p>
                      </div>
                    </Link>
                  ) : <div className="flex-1" />}
                </div>
              </motion.div>

              {/* Table of contents - desktop only */}
              {headings.length > 0 && (
                <aside className="hidden lg:block w-48 shrink-0">
                  <div className="sticky top-24">
                    <h4 className="text-xs font-semibold uppercase tracking-wider text-[hsl(var(--muted-foreground))] mb-3">On this page</h4>
                    <nav className="space-y-0.5">
                      {headings.map((h) => (
                        <a
                          key={h.id}
                          href={`#${h.id}`}
                          onClick={(e) => {
                            e.preventDefault()
                            document.getElementById(h.id)?.scrollIntoView({ behavior: 'smooth' })
                          }}
                          className={`block text-xs leading-relaxed text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))] transition-colors ${
                            h.level === 3 ? 'pl-3' : ''
                          }`}
                        >
                          {h.text}
                        </a>
                      ))}
                    </nav>
                  </div>
                </aside>
              )}
            </div>
          </div>
        </article>
      </main>
      <Footer />
    </div>
  )
}
