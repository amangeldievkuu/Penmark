import { useCallback, useState } from 'react'
import { createPost, updatePost, deletePost } from '~/server/functions/posts'
import { getAuthHeaders } from '~/lib/auth-headers'
import type { CreatePost, UpdatePost } from '~/types/post'

export function usePosts() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const create = useCallback(async (data: CreatePost) => {
    setLoading(true)
    setError(null)
    try {
      const headers = await getAuthHeaders()
      const post = await createPost({ headers, data })
      return post
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to create post'
      setError(message)
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  const update = useCallback(async (data: UpdatePost) => {
    setLoading(true)
    setError(null)
    try {
      const headers = await getAuthHeaders()
      const post = await updatePost({ headers, data })
      return post
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to update post'
      setError(message)
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  const remove = useCallback(async (id: string) => {
    setLoading(true)
    setError(null)
    try {
      const headers = await getAuthHeaders()
      await deletePost({ headers, data: { id } })
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to delete post'
      setError(message)
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  return { create, update, remove, loading, error }
}
