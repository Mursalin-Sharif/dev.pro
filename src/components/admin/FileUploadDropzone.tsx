import { useCallback, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { toast } from 'sonner'
import { Loader2, UploadCloud } from 'lucide-react'
import { uploadFile, type StorageBucket } from '@/lib/storage'
import { cn } from '@/lib/utils'

interface FileUploadDropzoneProps {
  bucket: StorageBucket
  label: string
  currentUrl?: string
  onUploaded: (url: string) => void
  accept?: string
}

export function FileUploadDropzone({ bucket, label, currentUrl, onUploaded, accept = 'image/*' }: FileUploadDropzoneProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [isUploading, setIsUploading] = useState(false)

  const handleFile = useCallback(
    async (file: File | undefined) => {
      if (!file) return
      setIsUploading(true)
      try {
        const url = await uploadFile(bucket, file)
        onUploaded(url)
        toast.success('File uploaded.')
      } catch (err) {
        toast.error(err instanceof Error ? err.message : 'Upload failed.')
      } finally {
        setIsUploading(false)
      }
    },
    [bucket, onUploaded],
  )

  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-sm font-bold text-ink">{label}</label>
      <motion.div
        onDragOver={(e) => {
          e.preventDefault()
          setIsDragging(true)
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={(e) => {
          e.preventDefault()
          setIsDragging(false)
          void handleFile(e.dataTransfer.files?.[0])
        }}
        onClick={() => inputRef.current?.click()}
        className={cn(
          'flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed px-6 py-8 text-center transition-colors',
          isDragging ? 'border-primary bg-primary/5' : 'border-black/15 hover:border-primary/40',
        )}
      >
        <input
          ref={inputRef}
          type="file"
          accept={accept}
          className="hidden"
          onChange={(e) => void handleFile(e.target.files?.[0])}
        />
        {isUploading ? (
          <Loader2 className="animate-spin text-primary" size={24} />
        ) : (
          <UploadCloud className="text-muted" size={24} />
        )}
        <p className="text-xs text-muted">
          {isUploading ? 'Uploading…' : 'Drag & drop, or click to browse'}
        </p>
      </motion.div>
      {currentUrl && (
        <p className="truncate text-xs text-muted">
          Current: <span className="text-primary">{currentUrl}</span>
        </p>
      )}
    </div>
  )
}
