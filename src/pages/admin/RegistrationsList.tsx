import { useMemo, useState } from 'react'
import { Helmet } from 'react-helmet-async'
import { Search } from 'lucide-react'
import { useRegistrations, useUpdateRegistrationStatus } from '@/hooks/useRegistrations'
import { DataTable, type DataTableColumn } from '@/components/admin/DataTable'
import { ExportButton } from '@/components/admin/ExportButton'
import { Badge } from '@/components/common/Badge'
import { formatCurrency, formatDate } from '@/lib/utils'
import type { Registration, RegistrationStatus } from '@/types'

const statusTone: Record<RegistrationStatus, 'success' | 'warning' | 'primary' | 'neutral'> = {
  paid: 'success',
  pending: 'warning',
  failed: 'neutral',
  refunded: 'primary',
}

export default function RegistrationsList() {
  const { data: registrations, isLoading, isError, error, refetch } = useRegistrations()
  const updateStatus = useUpdateRegistrationStatus()
  const [search, setSearch] = useState('')
  // Default to paid — webhook only inserts rows after successful Stripe payment.
  const [statusFilter, setStatusFilter] = useState<RegistrationStatus | 'all'>('paid')

  const filtered = useMemo(() => {
    return (registrations ?? []).filter((r) => {
      const matchesStatus = statusFilter === 'all' || r.status === statusFilter
      const query = search.trim().toLowerCase()
      const matchesSearch =
        !query ||
        `${r.first_name} ${r.last_name} ${r.email} ${r.country}`.toLowerCase().includes(query)
      return matchesStatus && matchesSearch
    })
  }, [registrations, search, statusFilter])

  const paidCount = (registrations ?? []).filter((r) => r.status === 'paid').length
  const totalCount = registrations?.length ?? 0

  const columns: DataTableColumn<Registration>[] = [
    { key: 'name', header: 'Name', render: (r) => `${r.first_name} ${r.last_name}` },
    { key: 'email', header: 'Email', render: (r) => r.email },
    { key: 'country', header: 'Country', render: (r) => r.country },
    {
      key: 'status',
      header: 'Status',
      render: (r) => (
        <select
          value={r.status}
          onChange={(e) => updateStatus.mutate({ id: r.id, status: e.target.value as RegistrationStatus })}
          className="w-full max-w-full rounded-lg border border-black/10 bg-white px-2 py-1 text-xs font-bold sm:w-auto"
        >
          {(['pending', 'paid', 'failed', 'refunded'] as RegistrationStatus[]).map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
      ),
    },
    { key: 'fee', header: 'Fee', render: (r) => formatCurrency(r.fee_amount, r.fee_currency) },
    { key: 'created', header: 'Registered', render: (r) => formatDate(r.created_at) },
  ]

  return (
    <>
      <Helmet>
        <title>Registrations — Admin</title>
        <meta name="robots" content="noindex" />
      </Helmet>

      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-h2 text-ink">Paid registrations</h1>
          <p className="mt-1 text-sm text-muted">
            {filtered.length} shown · {paidCount} paid / {totalCount} total in{' '}
            <code className="text-xs">registrations</code> (Auth users without payment do not appear here)
          </p>
        </div>
        <ExportButton registrations={filtered} />
      </div>

      {isError && (
        <div className="mt-4 rounded-xl border border-error/30 bg-error/5 px-4 py-3 text-sm text-error">
          Could not load registrations: {error instanceof Error ? error.message : 'Unknown error'}{' '}
          <button type="button" onClick={() => void refetch()} className="ml-2 font-bold underline">
            Retry
          </button>
        </div>
      )}

      <div className="mt-6 flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <Search size={16} className="absolute top-1/2 left-3.5 -translate-y-1/2 text-muted" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name, email, or country"
            className="w-full rounded-xl border border-black/10 bg-white py-2.5 pl-10 pr-4 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as RegistrationStatus | 'all')}
          className="w-full rounded-xl border border-black/10 bg-white px-4 py-2.5 text-sm outline-none focus:border-primary sm:w-auto"
        >
          <option value="all">All statuses</option>
          <option value="pending">Pending</option>
          <option value="paid">Paid</option>
          <option value="failed">Failed</option>
          <option value="refunded">Refunded</option>
        </select>
      </div>

      <div className="mt-6">
        <DataTable columns={columns} data={filtered} keyField="id" isLoading={isLoading} emptyMessage="No registrations match your filters." />
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        {(['pending', 'paid', 'failed', 'refunded'] as RegistrationStatus[]).map((s) => (
          <Badge key={s} tone={statusTone[s]}>
            {s}
          </Badge>
        ))}
      </div>
    </>
  )
}
