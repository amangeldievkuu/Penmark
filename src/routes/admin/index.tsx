import { createFileRoute } from '@tanstack/react-router'
import { getAllPosts } from '~/server/functions/posts'
import { getChangelogEntries } from '~/server/functions/changelog'
import { Card, CardHeader, CardTitle, CardContent } from '~/components/ui/card'
import { FileText, Eye, EyeOff, History } from 'lucide-react'
import { motion } from 'framer-motion'
import { formatDateShort } from '~/lib/utils'

export const Route = createFileRoute('/admin/')({
  loader: async () => {
    const [posts, changelog] = await Promise.all([
      getAllPosts(),
      getChangelogEntries(),
    ])
    return { posts, changelog }
  },
  component: AdminDashboard,
})

function AdminDashboard() {
  const { posts, changelog } = Route.useLoaderData()
  const published = posts.filter((p: any) => p.published)
  const drafts = posts.filter((p: any) => !p.published)

  const stats = [
    { label: 'Total Posts', value: posts.length, icon: FileText, color: 'text-blue-500' },
    { label: 'Published', value: published.length, icon: Eye, color: 'text-emerald-500' },
    { label: 'Drafts', value: drafts.length, icon: EyeOff, color: 'text-amber-500' },
    { label: 'Changelog', value: changelog.length, icon: History, color: 'text-purple-500' },
  ]

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Dashboard</h1>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-8">
        {stats.map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
          >
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-[hsl(var(--muted-foreground))]">{stat.label}</p>
                    <p className="text-3xl font-bold mt-1">{stat.value}</p>
                  </div>
                  <stat.icon className={`h-8 w-8 ${stat.color} opacity-80`} />
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Posts</CardTitle>
        </CardHeader>
        <CardContent>
          {posts.length === 0 ? (
            <p className="text-sm text-[hsl(var(--muted-foreground))]">No posts yet.</p>
          ) : (
            <div className="space-y-3">
              {posts.slice(0, 5).map((post: any) => (
                <div key={post.id} className="flex items-center justify-between py-2 border-b border-[hsl(var(--border))] last:border-0">
                  <div>
                    <p className="font-medium text-sm">{post.title}</p>
                    <p className="text-xs text-[hsl(var(--muted-foreground))]">
                      {formatDateShort(post.created_at)}
                    </p>
                  </div>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${
                    post.published
                      ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'
                      : 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'
                  }`}>
                    {post.published ? 'Published' : 'Draft'}
                  </span>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
