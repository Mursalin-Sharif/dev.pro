import { useState } from 'react'
import { Helmet } from 'react-helmet-async'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Plus, Pencil, Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import { useVideos, useVideoMutations } from '@/hooks/useVideos'
import { DataTable, type DataTableColumn } from '@/components/admin/DataTable'
import { FileUploadDropzone } from '@/components/admin/FileUploadDropzone'
import { Modal } from '@/components/common/Modal'
import { Button } from '@/components/common/Button'
import { Badge } from '@/components/common/Badge'
import { FormField } from '@/components/forms/FormField'
import { videoSchema, type VideoSchema } from '@/lib/validators'
import { formatDate } from '@/lib/utils'
import type { Video } from '@/types'

export default function VideosManager() {
  const { data: videos, isLoading } = useVideos({ publishedOnly: false })
  const { create, update, remove } = useVideoMutations()
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState<Video | null>(null)

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<VideoSchema>({ resolver: zodResolver(videoSchema), defaultValues: { published: true } })

  const openCreate = () => {
    setEditing(null)
    reset({ title: '', description: '', videoUrl: '', thumbnailUrl: '', published: true })
    setModalOpen(true)
  }

  const openEdit = (video: Video) => {
    setEditing(video)
    reset({
      title: video.title,
      description: video.description ?? '',
      videoUrl: video.video_url,
      thumbnailUrl: video.thumbnail_url ?? '',
      published: video.published,
    })
    setModalOpen(true)
  }

  const onSubmit = async (values: VideoSchema) => {
    try {
      const payload = {
        title: values.title,
        description: values.description?.trim() ? values.description : null,
        video_url: values.videoUrl,
        thumbnail_url: values.thumbnailUrl?.trim() ? values.thumbnailUrl : null,
        published: values.published,
      }
      if (editing) {
        await update.mutateAsync({ id: editing.id, ...payload })
        toast.success('Video updated.')
      } else {
        await create.mutateAsync(payload)
        toast.success('Video created.')
      }
      setModalOpen(false)
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Something went wrong.')
    }
  }

  const onDelete = async (video: Video) => {
    if (!window.confirm(`Delete "${video.title}"?`)) return
    await remove.mutateAsync(video.id)
    toast.success('Video deleted.')
  }

  const columns: DataTableColumn<Video>[] = [
    { key: 'title', header: 'Title', render: (v) => v.title },
    { key: 'published', header: 'Status', render: (v) => <Badge tone={v.published ? 'success' : 'neutral'}>{v.published ? 'Published' : 'Draft'}</Badge> },
    { key: 'created', header: 'Added', render: (v) => formatDate(v.created_at) },
    {
      key: 'actions',
      header: 'Actions',
      render: (v) => (
        <div className="flex justify-end gap-2">
          <button onClick={() => openEdit(v)} className="rounded-lg p-2 text-primary hover:bg-primary/10">
            <Pencil size={16} />
          </button>
          <button onClick={() => onDelete(v)} className="rounded-lg p-2 text-error hover:bg-error/10">
            <Trash2 size={16} />
          </button>
        </div>
      ),
    },
  ]

  return (
    <>
      <Helmet>
        <title>Videos — Admin</title>
        <meta name="robots" content="noindex" />
      </Helmet>

      <div className="flex items-center justify-between">
        <h1 className="text-h2 text-ink">Videos</h1>
        <Button size="sm" icon={<Plus size={16} />} onClick={openCreate}>
          Add Video
        </Button>
      </div>

      <div className="mt-6">
        <DataTable columns={columns} data={videos ?? []} keyField="id" isLoading={isLoading} emptyMessage="No videos uploaded yet." />
      </div>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editing ? 'Edit Video' : 'Add Video'}>
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5">
          <FormField label="Title" error={errors.title?.message} {...register('title')} />
          <FormField label="Description" error={errors.description?.message} {...register('description')} />
          <FormField
            label="Video URL"
            placeholder="https://youtube.com/watch?v=… or youtu.be/… or MP4 link"
            error={errors.videoUrl?.message}
            {...register('videoUrl')}
          />
          <p className="text-xs text-muted">
            Paste a YouTube link (watch / youtu.be / shorts) or a direct MP4 URL. Thumbnail upload is optional.
          </p>
          <FileUploadDropzone
            bucket="videos"
            label="Thumbnail upload"
            currentUrl={watch('thumbnailUrl')}
            onUploaded={(url) => setValue('thumbnailUrl', url, { shouldValidate: true })}
          />
          <FormField
            label="Or thumbnail URL"
            placeholder="https://…/thumb.jpg"
            error={errors.thumbnailUrl?.message}
            {...register('thumbnailUrl')}
          />
          <label className="flex items-center gap-2 text-sm font-semibold text-ink">
            <input type="checkbox" {...register('published')} className="h-4 w-4 rounded border-black/20" />
            Published
          </label>
          <Button type="submit" size="lg">
            {editing ? 'Save Changes' : 'Create Video'}
          </Button>
        </form>
      </Modal>
    </>
  )
}
