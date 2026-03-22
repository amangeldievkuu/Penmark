import { Link } from '@tanstack/react-router'
import { Clock, Calendar } from 'lucide-react'
import { Badge } from '~/components/ui/badge'
import { formatDateShort } from '~/lib/utils'
import type { Post } from '~/types/post'

interface BlogCardProps {
  post: Post & { profiles?: { full_name: string; avatar_url: string } | null }
}

export function BlogCard({ post }: BlogCardProps) {
  return (
    <Link
      to="/blog/$slug"
      params={{ slug: post.slug }}
      className="group block"
    >
      <article className="rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] overflow-hidden transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5">
        {post.cover_image_url && (
          <div className="aspect-[16/9] overflow-hidden">
            <img
              src={post.cover_image_url}
              alt={post.title}
              loading="lazy"
              decoding="async"
              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
          </div>
        )}
        <div className="p-5">
          <div className="flex flex-wrap gap-1.5 mb-3">
            {post.tags.map((tag) => (
              <Badge key={tag} variant="secondary" className="text-xs">
                {tag}
              </Badge>
            ))}
          </div>
          <h2 className="text-lg font-semibold mb-2 group-hover:text-[hsl(var(--primary))] transition-colors line-clamp-2">
            {post.title}
          </h2>
          {post.excerpt && (
            <p className="text-sm text-[hsl(var(--muted-foreground))] mb-4 line-clamp-2">
              {post.excerpt}
            </p>
          )}
          <div className="flex items-center gap-4 text-xs text-[hsl(var(--muted-foreground))]">
            <span className="flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              {post.published_at ? formatDateShort(post.published_at) : formatDateShort(post.created_at)}
            </span>
            <span className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              {post.reading_time_minutes} min read
            </span>
          </div>
        </div>
      </article>
    </Link>
  )
}
