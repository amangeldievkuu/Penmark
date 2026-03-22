import { useState, useCallback } from 'react'
import { uploadImage, deleteImage } from '~/lib/storage'

export function useUpload() {
  const [uploading, setUploading] = useState(false)
  const [progress, setProgress] = useState(0)
  const [error, setError] = useState<string | null>(null)

  const upload = useCallback(async (file: File, path: string = 'uploads') => {
    setUploading(true)
    setProgress(0)
    setError(null)
    try {
      setProgress(50) // Simulated progress since Supabase doesn't provide upload progress
      const url = await uploadImage(file, path)
      setProgress(100)
      return url
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Upload failed'
      setError(message)
      throw err
    } finally {
      setUploading(false)
    }
  }, [])

  const remove = useCallback(async (path: string) => {
    try {
      await deleteImage(path)
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Delete failed'
      setError(message)
      throw err
    }
  }, [])

  return { upload, remove, uploading, progress, error }
}
