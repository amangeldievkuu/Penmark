import { z } from 'zod'

export const PostSchema = z.object({
  id: z.string().uuid(),
  title: z.string().min(1, 'Title is required'),
  slug: z.string().min(1, 'Slug is required'),
  content: z.any(),
  excerpt: z.string().default(''),
  cover_image_url: z.string().default(''),
  published: z.boolean().default(false),
  published_at: z.string().nullable().default(null),
  author_id: z.string().uuid().nullable().default(null),
  tags: z.array(z.string()).default([]),
  reading_time_minutes: z.number().default(1),
  created_at: z.string(),
  updated_at: z.string(),
})

export const CreatePostSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  slug: z.string().min(1, 'Slug is required'),
  content: z.any().default({}),
  excerpt: z.string().default(''),
  cover_image_url: z.string().default(''),
  published: z.boolean().default(false),
  published_at: z.string().nullable().default(null),
  tags: z.array(z.string()).default([]),
  reading_time_minutes: z.number().default(1),
})

export const UpdatePostSchema = z.object({
  id: z.string().uuid(),
  title: z.string().min(1).optional(),
  slug: z.string().min(1).optional(),
  content: z.any().optional(),
  excerpt: z.string().optional(),
  cover_image_url: z.string().optional(),
  published: z.boolean().optional(),
  published_at: z.string().nullable().optional(),
  tags: z.array(z.string()).optional(),
  reading_time_minutes: z.number().optional(),
})

export type Post = z.infer<typeof PostSchema>
export type CreatePost = z.infer<typeof CreatePostSchema>
export type UpdatePost = z.infer<typeof UpdatePostSchema>
