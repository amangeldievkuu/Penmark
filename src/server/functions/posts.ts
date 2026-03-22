import { createServerFn } from '@tanstack/react-start'
import { createClient } from '@supabase/supabase-js'
import { z } from 'zod'
import { requireAdmin } from './auth'

function getServerSupabase() {
  const url = process.env.VITE_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) throw new Error('Missing Supabase server config')
  return createClient(url, key)
}

// --- Public (no auth) ---

export const getPublishedPosts = createServerFn({ method: 'GET' })
  .handler(async () => {
    const supabase = getServerSupabase()
    const { data, error } = await supabase
      .from('posts')
      .select('*, profiles(full_name, avatar_url)')
      .eq('published', true)
      .order('published_at', { ascending: false })
    if (error) throw new Error('Failed to load posts')
    return data ?? []
  })

export const getPostBySlug = createServerFn({ method: 'GET' })
  .inputValidator(z.object({ slug: z.string() }))
  .handler(async ({ data }) => {
    const supabase = getServerSupabase()
    const { data: post, error } = await supabase
      .from('posts')
      .select('*, profiles(full_name, avatar_url, bio, twitter, github)')
      .eq('slug', data.slug)
      .single()
    if (error) throw new Error('Post not found')
    return post
  })

export const getAdjacentPosts = createServerFn({ method: 'GET' })
  .inputValidator(z.object({ publishedAt: z.string(), currentId: z.string() }))
  .handler(async ({ data }) => {
    const supabase = getServerSupabase()
    const [prevResult, nextResult] = await Promise.all([
      supabase
        .from('posts')
        .select('title, slug')
        .eq('published', true)
        .lt('published_at', data.publishedAt)
        .order('published_at', { ascending: false })
        .limit(1)
        .single(),
      supabase
        .from('posts')
        .select('title, slug')
        .eq('published', true)
        .gt('published_at', data.publishedAt)
        .order('published_at', { ascending: true })
        .limit(1)
        .single(),
    ])
    return {
      previous: prevResult.data ?? null,
      next: nextResult.data ?? null,
    }
  })

// --- Admin (auth required) ---

export const getAllPosts = createServerFn({ method: 'GET' })
  .handler(async () => {
    const supabase = getServerSupabase()
    const { data, error } = await supabase
      .from('posts')
      .select('*, profiles(full_name, avatar_url)')
      .order('created_at', { ascending: false })
    if (error) throw new Error('Failed to load posts')
    return data ?? []
  })

export const getPostById = createServerFn({ method: 'GET' })
  .inputValidator(z.object({ id: z.string().uuid() }))
  .handler(async ({ data }) => {
    const supabase = getServerSupabase()
    const { data: post, error } = await supabase
      .from('posts')
      .select('*')
      .eq('id', data.id)
      .single()
    if (error) throw new Error('Post not found')
    return post
  })

export const createPost = createServerFn({ method: 'POST' })
  .inputValidator(z.object({
    title: z.string().min(1),
    slug: z.string().min(1),
    content: z.any().default({}),
    excerpt: z.string().default(''),
    cover_image_url: z.string().default(''),
    published: z.boolean().default(false),
    published_at: z.string().nullable().default(null),
    tags: z.array(z.string()).default([]),
    reading_time_minutes: z.number().default(1),
  }))
  .handler(async ({ data }) => {
    const userId = await requireAdmin()
    const supabase = getServerSupabase()
    const { data: post, error } = await supabase
      .from('posts')
      .insert({ ...data, author_id: userId })
      .select()
      .single()
    if (error) throw new Error('Failed to create post')
    return post
  })

export const updatePost = createServerFn({ method: 'POST' })
  .inputValidator(z.object({
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
  }))
  .handler(async ({ data }) => {
    await requireAdmin()
    const supabase = getServerSupabase()
    const { id, ...updates } = data
    const { data: post, error } = await supabase
      .from('posts')
      .update(updates)
      .eq('id', id)
      .select()
      .single()
    if (error) throw new Error('Failed to update post')
    return post
  })

export const deletePost = createServerFn({ method: 'POST' })
  .inputValidator(z.object({ id: z.string().uuid() }))
  .handler(async ({ data }) => {
    await requireAdmin()
    const supabase = getServerSupabase()
    const { error } = await supabase
      .from('posts')
      .delete()
      .eq('id', data.id)
    if (error) throw new Error('Failed to delete post')
    return { success: true }
  })
