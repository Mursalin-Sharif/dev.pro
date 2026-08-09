import { useState } from 'react'
import { Helmet } from 'react-helmet-async'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Plus, Pencil, Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import { useBlogPosts, useBlogPostMutations } from '@/hooks/useBlogPosts'
import { DataTable, type DataTableColumn } from '@/components/admin/DataTable'
import { FileUploadDropzone } from '@/components/admin/FileUploadDropzone'
import { RichTextEditor } from '@/components/admin/RichTextEditor'
import { Modal } from '@/components/common/Modal'
import { Button } from '@/components/common/Button'
import { Badge } from '@/components/common/Badge'
import { FormField } from '@/components/forms/FormField'
import { blogPostSchema, type BlogPostSchema } from '@/lib/validators'
import { slugify, formatDate } from '@/lib/utils'
import type { BlogPost } from '@/types'

export default function BlogManager() {
  const { data: posts, isLoading } = useBlogPosts({ publishedOnly: false })
  const { create, update, remove } = useBlogPostMutations()
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState<BlogPost | null>(null)

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    control,
    formState: { errors },
  } = useForm<BlogPostSchema>({ resolver: zodResolver(blogPostSchema), defaultValues: { published: true } })

  const openCreate = () => {
    setEditing(null)
    reset({ title: '', slug: '', excerpt: '', content: '', author: '', coverImageUrl: '', published: true })
    setModalOpen(true)
  }

  const openEdit = (post: BlogPost) => {
    setEditing(post)
    reset({
      title: post.title,
      slug: post.slug,
      excerpt: post.excerpt,
      content: post.content,
      author: post.author,
      coverImageUrl: post.cover_image_url ?? '',
      published: post.published,
    })
    setModalOpen(true)
  }

  const onTitleBlur = () => {
    const currentSlug = watch('slug')
    if (!currentSlug) setValue('slug', slugify(watch('title') ?? ''))
  }

  const onSubmit = async (values: BlogPostSchema) => {
    try {
      const now = new Date().toISOString()
      const payload = {
        title: values.title,
        slug: values.slug,
        excerpt: values.excerpt,
        content: values.content,
        author: values.author,
        cover_image_url: values.coverImageUrl?.trim() ? values.coverImageUrl : null,
        published: values.published,
        published_at: values.published
          ? editing?.published_at ?? now
          : null,
      }
      if (editing) {
        await update.mutateAsync({ id: editing.id, ...payload })
        toast.success('Post updated.')
      } else {
        await create.mutateAsync(payload)
        toast.success(values.published ? 'Post published.' : 'Draft saved.')
      }
      setModalOpen(false)
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Something went wrong.')
    }
  }

  const onDelete = async (post: BlogPost) => {
    if (!window.confirm(`Delete "${post.title}"?`)) return
    await remove.mutateAsync(post.id)
    toast.success('Post deleted.')
  }

  const columns: DataTableColumn<BlogPost>[] = [
    { key: 'title', header: 'Title', render: (p) => p.title },
    { key: 'author', header: 'Author', render: (p) => p.author },
    { key: 'status', header: 'Status', render: (p) => <Badge tone={p.published ? 'success' : 'neutral'}>{p.published ? 'Published' : 'Draft'}</Badge> },
    { key: 'date', header: 'Date', render: (p) => formatDate(p.published_at ?? p.created_at) },
    {
      key: 'actions',
      header: 'Actions',
      render: (p) => (
        <div className="flex justify-end gap-2">
          <button onClick={() => openEdit(p)} className="rounded-lg p-2 text-primary hover:bg-primary/10">
            <Pencil size={16} />
          </button>
          <button onClick={() => onDelete(p)} className="rounded-lg p-2 text-error hover:bg-error/10">
            <Trash2 size={16} />
          </button>
        </div>
      ),
    },
  ]

  return (
    <>
      <Helmet>
        <title>Blog — Admin</title>
        <meta name="robots" content="noindex" />
      </Helmet>

      <div className="flex items-center justify-between">
        <h1 className="text-h2 text-ink">Blog</h1>
        <Button size="sm" icon={<Plus size={16} />} onClick={openCreate}>
          New Post
        </Button>
      </div>

      <div className="mt-6">
        <DataTable columns={columns} data={posts ?? []} keyField="id" isLoading={isLoading} emptyMessage="No blog posts yet." />
      </div>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editing ? 'Edit Post' : 'New Post'} size="lg">
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5">
          <div className="grid gap-5 sm:grid-cols-2">
            <FormField label="Title" error={errors.title?.message} {...register('title', { onBlur: onTitleBlur })} />
            <FormField label="Slug" error={errors.slug?.message} {...register('slug')} />
          </div>
          <FormField label="Author" error={errors.author?.message} {...register('author')} />
          <FormField label="Excerpt" error={errors.excerpt?.message} {...register('excerpt')} />
          <FileUploadDropzone
            bucket="blog-covers"
            label="Cover image upload"
            currentUrl={watch('coverImageUrl')}
            onUploaded={(url) => setValue('coverImageUrl', url, { shouldValidate: true })}
          />
          <FormField
            label="Or cover image URL"
            placeholder="https://…/cover.jpg"
            error={errors.coverImageUrl?.message}
            {...register('coverImageUrl')}
          />
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-bold text-ink">Content</label>
            <Controller
              control={control}
              name="content"
              render={({ field }) => <RichTextEditor value={field.value} onChange={field.onChange} placeholder="Write the post content…" />}
            />
            {errors.content?.message && <p className="text-xs font-semibold text-error">{errors.content.message}</p>}
          </div>
          <label className="flex items-center gap-2 text-sm font-semibold text-ink">
            <input type="checkbox" {...register('published')} className="h-4 w-4 rounded border-black/20" />
            Published
          </label>
          <Button type="submit" size="lg">
            {editing ? 'Save Changes' : 'Publish Post'}
          </Button>
        </form>
      </Modal>
    </>
  )
}
