import { supabase } from './supabase'

const BUCKET = 'media'
const MAX_FILE_SIZE = 15 * 1024 * 1024 // 15MB (HEIC files are larger before conversion)
const ACCEPTED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/heic', 'image/heif']
const HEIC_TYPES = ['image/heic', 'image/heif']
const ALLOWED_PATHS = ['uploads', 'covers', 'avatars', 'content']

function isHeic(file: File): boolean {
  if (HEIC_TYPES.includes(file.type)) return true
  const name = file.name.toLowerCase()
  return name.endsWith('.heic') || name.endsWith('.heif')
}

async function convertHeicToJpeg(file: File): Promise<File> {
  const newName = file.name.replace(/\.(heic|heif)$/i, '.jpg')

  try {
    const { default: heic2any } = await import('heic2any')
    const blob = await heic2any({ blob: file, toType: 'image/jpeg', quality: 0.9 })
    const converted = Array.isArray(blob) ? blob[0] : blob
    return new File([converted], newName, { type: 'image/jpeg' })
  } catch {
    // Fallback: <img> element decoding (works in Safari which natively supports HEIC)
  }

  const blobUrl = URL.createObjectURL(file)
  try {
    const jpegBlob = await new Promise<Blob>((resolve, reject) => {
      const img = new Image()
      img.onload = () => {
        const canvas = document.createElement('canvas')
        canvas.width = img.naturalWidth
        canvas.height = img.naturalHeight
        const ctx = canvas.getContext('2d')
        if (!ctx) { reject(new Error('Failed to get canvas context')); return }
        ctx.drawImage(img, 0, 0)
        canvas.toBlob(
          (b) => (b ? resolve(b) : reject(new Error('Canvas export failed'))),
          'image/jpeg',
          0.9,
        )
      }
      img.onerror = () => reject(new Error('Cannot convert this HEIC file. Please open it in Preview or Photos, export as JPEG, and upload that instead.'))
      img.src = blobUrl
    })
    return new File([jpegBlob], newName, { type: 'image/jpeg' })
  } finally {
    URL.revokeObjectURL(blobUrl)
  }
}

function sanitizePath(path: string): string {
  // Only allow whitelisted base paths, strip traversal attempts
  const clean = path.replace(/\.\./g, '').replace(/^\/+/, '').split('/')[0]
  if (!ALLOWED_PATHS.includes(clean)) {
    return 'uploads'
  }
  return clean
}

export async function uploadImage(file: File, path: string): Promise<string> {
  if (file.size > MAX_FILE_SIZE) {
    throw new Error('File size must be less than 15MB')
  }

  if (!ACCEPTED_TYPES.includes(file.type) && !isHeic(file)) {
    throw new Error('File type not supported. Use JPEG, PNG, WebP, GIF, or HEIC')
  }

  const safePath = sanitizePath(path)

  // Convert HEIC/HEIF to JPEG before uploading
  let processedFile = file
  if (isHeic(file)) {
    processedFile = await convertHeicToJpeg(file)
  }

  const compressed = await compressImage(processedFile, 1200, 0.85)
  const fileName = `${safePath}/${Date.now()}-${processedFile.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`

  const { error } = await supabase.storage.from(BUCKET).upload(fileName, compressed, {
    contentType: processedFile.type,
    upsert: false,
  })

  if (error) throw error

  return getPublicUrl(fileName)
}

export function getPublicUrl(path: string): string {
  const { data } = supabase.storage.from(BUCKET).getPublicUrl(path)
  return data.publicUrl
}

export async function deleteImage(path: string): Promise<void> {
  const { error } = await supabase.storage.from(BUCKET).remove([path])
  if (error) throw error
}

async function compressImage(
  file: File,
  maxWidth: number,
  quality: number,
): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const blobUrl = URL.createObjectURL(file)
    const img = new Image()
    img.onload = () => {
      URL.revokeObjectURL(blobUrl)
      const canvas = document.createElement('canvas')
      let { width, height } = img

      if (width > maxWidth) {
        height = (height * maxWidth) / width
        width = maxWidth
      }

      canvas.width = width
      canvas.height = height

      const ctx = canvas.getContext('2d')
      if (!ctx) {
        reject(new Error('Failed to get canvas context'))
        return
      }

      ctx.drawImage(img, 0, 0, width, height)
      canvas.toBlob(
        (blob) => {
          if (blob) resolve(blob)
          else reject(new Error('Failed to compress image'))
        },
        file.type,
        quality,
      )
    }
    img.onerror = () => {
      URL.revokeObjectURL(blobUrl)
      reject(new Error('Failed to load image'))
    }
    img.src = blobUrl
  })
}
