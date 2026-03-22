import { createFileRoute, Link } from '@tanstack/react-router'
import { getPublishedPosts } from '~/server/functions/posts'
import { BlogCard } from '~/components/blog/BlogCard'
import { Header } from '~/components/layout/Header'
import { Footer } from '~/components/layout/Footer'
import { motion } from 'framer-motion'
import { ArrowRight, Sparkles } from 'lucide-react'
import { Button } from '~/components/ui/button'
import { Badge } from '~/components/ui/badge'
import { useState, useMemo } from 'react'

export const Route = createFileRoute('/')(
  {
    loader: () => getPublishedPosts(),
    component: HomePage,
  },
)

function HomePage() {
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
      <main className="flex-1">
        {/* Hero */}
        <section className="relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-[hsl(var(--primary))]/5 via-transparent to-purple-500/5" />
          <div className="relative mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-24 sm:py-32">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-center"
            >
              <Badge variant="secondary" className="mb-4 gap-1.5">
                <Sparkles className="h-3 w-3" />
                Personal Blog
              </Badge>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight mb-6">
                Thoughts, stories &{' '}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-[hsl(var(--primary))] to-purple-500">
                  ideas
                </span>
              </h1>
              <p className="text-lg sm:text-xl text-[hsl(var(--muted-foreground))] max-w-2xl mx-auto mb-8">
                Writing about technology, development, the things I learn along the way, and beautiful places I visit.
              </p>
              <div className="flex justify-center gap-3">
                <Link to="/blog">
                  <Button size="lg" className="gap-2">
                    Read the blog
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
                <Link to="/about">
                  <Button variant="outline" size="lg">
                    About me
                  </Button>
                </Link>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Latest Posts */}
        <section className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 pb-24">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-bold">Latest Posts</h2>
            <Link
              to="/blog"
              className="text-sm text-[hsl(var(--primary))] hover:underline flex items-center gap-1"
            >
              View all <ArrowRight className="h-3 w-3" />
            </Link>
          </div>

          {/* Tag filter */}
          {allTags.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-6">
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
              <p className="text-[hsl(var(--muted-foreground))]">No posts yet. Check back soon!</p>
            </div>
          ) : (
            <motion.div
              className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3"
              initial="hidden"
              animate="visible"
              variants={{
                visible: { transition: { staggerChildren: 0.1 } },
              }}
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
        </section>
      </main>
      <Footer />
    </div>
  )
}
