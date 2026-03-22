import { createFileRoute, Link, useRouter } from '@tanstack/react-router'
import { getAllPosts, deletePost } from '~/server/functions/posts'
import { Button } from '~/components/ui/button'
import { Card } from '~/components/ui/card'
import { Badge } from '~/components/ui/badge'
import { Plus, Edit, Trash2, Eye, EyeOff } from 'lucide-react'
import { formatDateShort } from '~/lib/utils'
import { useToast } from '~/components/ui/toast'
import { motion } from 'framer-motion'
import { getAuthHeaders } from '~/lib/auth-headers'

export const Route = createFileRoute('/admin/posts/')({
  loader: () => getAllPosts(),
  component: PostsListPage,
})

function PostsListPage() {
  const posts = Route.useLoaderData()
  const router = useRouter()
  const { toast } = useToast()

  const handleDelete = async (id: string, title: string) => {
    if (!confirm(`Delete "${title}"? This cannot be undone.`)) return
    try {
      const headers = await getAuthHeaders()
      await deletePost({ headers, data: { id } })
      toast('Post deleted', 'success')
      router.invalidate()
    } catch {
      toast('Failed to delete post', 'error')
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Posts</h1>
        <Link to="/admin/posts/new">
          <Button className="gap-2">
            <Plus className="h-4 w-4" /> New Post
          </Button>
        </Link>
      </div>

      {posts.length === 0 ? (
        <Card className="p-12 text-center">
          <p className="text-[hsl(var(--muted-foreground))] mb-4">No posts yet. Create your first post.</p>
          <Link to="/admin/posts/new">
            <Button>Create Post</Button>
          </Link>
        </Card>
      ) : (
        <div className="space-y-2">
          {posts.map((post, i) => (
            <motion.div
              key={post.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.03 }}
            >
              <Card className="p-4">
                <div className="flex items-center gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-medium text-sm truncate">{post.title}</h3>
                      {post.published ? (
                        <Badge variant="feature" className="shrink-0"><Eye className="h-3 w-3 mr-1" />Published</Badge>
                      ) : (
                        <Badge variant="secondary" className="shrink-0"><EyeOff className="h-3 w-3 mr-1" />Draft</Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-3 text-xs text-[hsl(var(--muted-foreground))]">
                      <span>/{post.slug}</span>
                      <span>{formatDateShort(post.created_at)}</span>
                      {post.tags?.length > 0 && (
                        <span>{post.tags.join(', ')}</span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <Link to="/admin/posts/$id/edit" params={{ id: post.id }}>
                      <Button variant="ghost" size="icon">
                        <Edit className="h-4 w-4" />
                      </Button>
                    </Link>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDelete(post.id, post.title)}
                      className="text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  )
}
