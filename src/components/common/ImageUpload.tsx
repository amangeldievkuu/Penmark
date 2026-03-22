import { useState, useRef } from 'react'
import { Upload, X, Loader2 } from 'lucide-react'
import { cn } from '~/lib/utils'
import { uploadImage } from '~/lib/storage'
import { Button } from '~/components/ui/button'

interface ImageUploadProps {
  value?: string
  onChange: (url: string) => void
  path?: string
  className?: string
}

export function ImageUpload({ value, onChange, path = 'uploads', className }: ImageUploadProps) {
  const [uploading, setUploading] = useState(false)
  const [dragActive, setDragActive] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const handleUpload = async (file: File) => {
    setUploading(true)
    setError(null)
    try {
      const url = await uploadImage(file, path)
      onChange(url)
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Upload failed'
      setError(message)
    } finally {
      setUploading(false)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setDragActive(false)
    const file = e.dataTransfer.files[0]
    if (file) handleUpload(file)
  }

  return (
    <div className={cn('relative', className)}>
      {value ? (
        <div className="relative group rounded-xl overflow-hidden">
          <img src={value} alt="Uploaded" className="w-full h-48 object-cover" />
          <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => inputRef.current?.click()}
            >
              Change
            </Button>
            <Button
              variant="destructive"
              size="sm"
              onClick={() => onChange('')}
            >
              <X className="h-3 w-3" />
            </Button>
          </div>
        </div>
      ) : (
        <div
          className={cn(
            'flex flex-col items-center justify-center rounded-xl border-2 border-dashed p-8 transition-colors cursor-pointer',
            dragActive
              ? 'border-[hsl(var(--primary))] bg-[hsl(var(--primary))]/5'
              : 'border-[hsl(var(--border))] hover:border-[hsl(var(--primary))]/50',
          )}
          onClick={() => inputRef.current?.click()}
          onDragOver={(e) => { e.preventDefault(); setDragActive(true) }}
          onDragLeave={() => setDragActive(false)}
          onDrop={handleDrop}
        >
          {uploading ? (
            <Loader2 className="h-8 w-8 animate-spin text-[hsl(var(--muted-foreground))]" />
          ) : (
            <>
              <Upload className="h-8 w-8 text-[hsl(var(--muted-foreground))] mb-2" />
              <p className="text-sm text-[hsl(var(--muted-foreground))]">
                Click or drag to upload
              </p>
              <p className="text-xs text-[hsl(var(--muted-foreground))] mt-1">
                Max 15MB. JPEG, PNG, WebP, GIF, HEIC
              </p>
            </>
          )}
        </div>
      )}
      {error && (
        <p className="mt-2 text-xs text-red-500">{error}</p>
      )}
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif,image/heic,image/heif,.heic,.heif"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0]
          if (file) handleUpload(file)
        }}
      />
    </div>
  )
}
