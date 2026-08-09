import { supabase, isSupabaseConfigured } from '@/lib/supabaseClient'

export type StorageBucket = 'videos' | 'sponsor-logos' | 'blog-covers'

const DEMO_MAX_FILE_SIZE_BYTES = 2 * 1024 * 1024

export async function uploadFile(bucket: StorageBucket, file: File): Promise<string> {
  if (!isSupabaseConfigured) {
    if (file.size > DEMO_MAX_FILE_SIZE_BYTES) {
      throw new Error('In demo mode, please use an image smaller than 2 MB.')
    }
    return readFileAsDataUrl(file)
  }

  // Prefer edge function (service role) so uploads work even if storage RLS
  // policies were never applied on the project.
  const viaFunction = await uploadViaEdgeFunction(bucket, file)
  if (viaFunction) return viaFunction

  const path = `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`
  const { error } = await supabase.storage.from(bucket).upload(path, file, {
    cacheControl: '3600',
    upsert: false,
  })
  if (error) {
    // If storage RLS isn't applied yet, keep admin usable with a compact data URL.
    if (
      file.size <= DEMO_MAX_FILE_SIZE_BYTES &&
      /row-level security|rls|violates|policy|permission|not allowed|unauthorized|403|jwt|forbidden/i.test(
        error.message,
      )
    ) {
      return readFileAsDataUrl(file)
    }
    throw new Error(formatStorageError(bucket, error.message))
  }

  const { data } = supabase.storage.from(bucket).getPublicUrl(path)
  return data.publicUrl
}

async function uploadViaEdgeFunction(bucket: StorageBucket, file: File): Promise<string | null> {
  const {
    data: { session },
  } = await supabase.auth.getSession()
  if (!session?.access_token) return null

  const form = new FormData()
  form.append('bucket', bucket)
  form.append('file', file)

  const { data, error } = await supabase.functions.invoke<{ publicUrl?: string; error?: string }>(
    'admin-upload-media',
    { body: form },
  )

  if (error) {
    // Function not deployed / network — fall back to direct storage upload.
    const message = error.message ?? ''
    if (/Failed to send|not found|404|FunctionsRelayError|FunctionsFetchError/i.test(message)) {
      return null
    }
    throw new Error(formatStorageError(bucket, message))
  }

  if (data?.error) {
    if (/not found|404/i.test(data.error)) return null
    throw new Error(formatStorageError(bucket, data.error))
  }

  if (!data?.publicUrl) return null
  return data.publicUrl
}

function formatStorageError(bucket: StorageBucket, message: string): string {
  if (/bucket not found/i.test(message)) {
    return `Storage bucket "${bucket}" is missing. Run supabase/MEDIA_STORAGE_FIX.sql in the Supabase SQL Editor, then retry.`
  }
  if (/row-level security|rls|permission|not allowed|unauthorized|403/i.test(message)) {
    return `Upload blocked for "${bucket}". Run supabase/MEDIA_STORAGE_FIX.sql (storage policies) and confirm your account is admin.`
  }
  return message
}

function readFileAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result as string)
    reader.onerror = () => reject(reader.error ?? new Error('Could not read file.'))
    reader.readAsDataURL(file)
  })
}
