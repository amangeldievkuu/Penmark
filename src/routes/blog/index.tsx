import { createFileRoute } from '@tanstack/react-router'
import { getPublishedPosts } from '~/server/functions/posts'
import { BlogCard } from '~/components/blog/BlogCard'
import { Header } from '~/components/layout/Header'
import { Footer } from '~/components/layout/Footer'
import { motion } from 'framer-motion'
import { useState, useMemo } from 'react'

export const Route = createFileRoute('/blog/')(
  {
    loader: () => getPublishedPosts(),
    component: BlogListPage,
  },
)

function BlogListPage() {
  const posts = Route.useLoaderData()
  const [selectedTag, setSelectedTag] = useState<string | null>(null)

  const allTags = useMemo(
    () => Array.from(new Set(posts.flatMap((p) => p.tags || []))),
    [posts],
  )
  const filtered = useMemo(
    () => selectedTag ? posts.filter((p) => p.tags?.includes(selectedTag)) : posts,
    [posts, selectedTag],
  )

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h1 className="text-3xl font-bold mb-2">Blog</h1>
          <p className="text-[hsl(var(--muted-foreground))] mb-8">
            All posts about technology, development, and more.
          </p>
        </motion.div>

        {allTags.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-8">
            <button
              onClick={() => setSelectedTag(null)}
              className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                !selectedTag
                  ? 'bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))]'
                  : 'bg-[hsl(var(--secondary))] text-[hsl(var(--secondary-foreground))] hover:bg-[hsl(var(--accent))]'
              }`}
            >
              All
            </button>
            {allTags.map((tag) => (
              <button
                key={tag}
                onClick={() => setSelectedTag(tag === selectedTag ? null : tag)}
                className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                  tag === selectedTag
                    ? 'bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))]'
                    : 'bg-[hsl(var(--secondary))] text-[hsl(var(--secondary-foreground))] hover:bg-[hsl(var(--accent))]'
                }`}
              >
                {tag}
              </button>
            ))}
          </div>
        )}

        {filtered.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-[hsl(var(--muted-foreground))]">No posts found.</p>
          </div>
        ) : (
          <motion.div
            className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3"
            initial="hidden"
            animate="visible"
            variants={{ visible: { transition: { staggerChildren: 0.1 } } }}
          >
            {filtered.map((post) => (
              <motion.div
                key={post.id}
                variants={{
                  hidden: { opacity: 0, y: 20 },
                  visible: { opacity: 1, y: 0 },
                }}
              >
                <BlogCard post={post} />
              </motion.div>
            ))}
          </motion.div>
        )}
      </main>
      <Footer />
    </div>
  )
}
