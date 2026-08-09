import { useState } from 'react'
import { Helmet } from 'react-helmet-async'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Plus, Pencil, Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import { useSponsors, useSponsorMutations } from '@/hooks/useSponsors'
import { DataTable, type DataTableColumn } from '@/components/admin/DataTable'
import { FileUploadDropzone } from '@/components/admin/FileUploadDropzone'
import { Modal } from '@/components/common/Modal'
import { Button } from '@/components/common/Button'
import { Badge } from '@/components/common/Badge'
import { FormField } from '@/components/forms/FormField'
import { sponsorSchema, type SponsorSchema } from '@/lib/validators'
import type { Sponsor } from '@/types'

export default function SponsorsManager() {
  const { data: sponsors, isLoading } = useSponsors()
  const { create, update, remove } = useSponsorMutations()
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState<Sponsor | null>(null)

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<SponsorSchema>({ resolver: zodResolver(sponsorSchema), defaultValues: { tier: 'partner' } })

  const openCreate = () => {
    setEditing(null)
    reset({ name: '', logoUrl: '', websiteUrl: '', tier: 'partner' })
    setModalOpen(true)
  }

  const openEdit = (sponsor: Sponsor) => {
    setEditing(sponsor)
    reset({ name: sponsor.name, logoUrl: sponsor.logo_url, websiteUrl: sponsor.website_url ?? '', tier: sponsor.tier })
    setModalOpen(true)
  }

  const onSubmit = async (values: SponsorSchema) => {
    try {
      const payload = {
        name: values.name,
        logo_url: values.logoUrl,
        website_url: values.websiteUrl?.trim() ? values.websiteUrl : null,
        tier: values.tier,
      }
      if (editing) {
        await update.mutateAsync({ id: editing.id, ...payload })
        toast.success('Sponsor updated.')
      } else {
        await create.mutateAsync(payload)
        toast.success('Sponsor added.')
      }
      setModalOpen(false)
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Something went wrong.')
    }
  }

  const onDelete = async (sponsor: Sponsor) => {
    if (!window.confirm(`Remove "${sponsor.name}"?`)) return
    await remove.mutateAsync(sponsor.id)
    toast.success('Sponsor removed.')
  }

  const columns: DataTableColumn<Sponsor>[] = [
    { key: 'name', header: 'Name', render: (s) => s.name },
    { key: 'tier', header: 'Tier', render: (s) => <Badge tone="primary">{s.tier}</Badge> },
    {
      key: 'actions',
      header: 'Actions',
      render: (s) => (
        <div className="flex justify-end gap-2">
          <button onClick={() => openEdit(s)} className="rounded-lg p-2 text-primary hover:bg-primary/10">
            <Pencil size={16} />
          </button>
          <button onClick={() => onDelete(s)} className="rounded-lg p-2 text-error hover:bg-error/10">
            <Trash2 size={16} />
          </button>
        </div>
      ),
    },
  ]

  return (
    <>
      <Helmet>
        <title>Sponsors — Admin</title>
        <meta name="robots" content="noindex" />
      </Helmet>

      <div className="flex items-center justify-between">
        <h1 className="text-h2 text-ink">Sponsors</h1>
        <Button size="sm" icon={<Plus size={16} />} onClick={openCreate}>
          Add Sponsor
        </Button>
      </div>

      <div className="mt-6">
        <DataTable columns={columns} data={sponsors ?? []} keyField="id" isLoading={isLoading} emptyMessage="No sponsors added yet." />
      </div>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editing ? 'Edit Sponsor' : 'Add Sponsor'}>
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5">
          <FormField label="Sponsor Name" error={errors.name?.message} {...register('name')} />
          <FormField label="Website URL" placeholder="https://" error={errors.websiteUrl?.message} {...register('websiteUrl')} />
          <FileUploadDropzone
            bucket="sponsor-logos"
            label="Logo upload"
            currentUrl={watch('logoUrl')}
            onUploaded={(url) => setValue('logoUrl', url, { shouldValidate: true })}
          />
          <FormField
            label="Or logo URL"
            placeholder="https://…/logo.png"
            error={errors.logoUrl?.message}
            {...register('logoUrl')}
          />
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-bold text-ink">Tier</label>
            <select {...register('tier')} className="rounded-xl border border-black/10 bg-white px-4 py-3 text-sm outline-none focus:border-primary">
              <option value="platinum">Platinum</option>
              <option value="gold">Gold</option>
              <option value="silver">Silver</option>
              <option value="partner">Partner</option>
            </select>
          </div>
          <Button type="submit" size="lg">
            {editing ? 'Save Changes' : 'Add Sponsor'}
          </Button>
        </form>
      </Modal>
    </>
  )
}
