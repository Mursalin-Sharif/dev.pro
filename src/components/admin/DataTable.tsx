import type { ReactNode } from 'react'
import { LoadingSpinner } from '@/components/common/LoadingSpinner'

export interface DataTableColumn<T> {
  key: string
  header: string
  render: (row: T) => ReactNode
  className?: string
}

interface DataTableProps<T> {
  columns: DataTableColumn<T>[]
  data: T[]
  keyField: keyof T
  isLoading?: boolean
  emptyMessage?: string
}

export function DataTable<T extends object>({
  columns,
  data,
  keyField,
  isLoading,
  emptyMessage = 'No records yet.',
}: DataTableProps<T>) {
  if (isLoading) {
    return (
      <div className="flex justify-center py-16">
        <LoadingSpinner size={26} className="text-primary" />
      </div>
    )
  }

  if (data.length === 0) {
    return <p className="py-16 text-center text-sm text-muted">{emptyMessage}</p>
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-black/5 bg-white shadow-card">
      {/* Desktop table */}
      <div className="hidden overflow-x-auto md:block">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-black/5 bg-surface-light">
            <tr>
              {columns.map((col) => (
                <th key={col.key} className="px-5 py-3 font-bold text-ink">
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.map((row) => (
              <tr key={String(row[keyField])} className="border-b border-black/5 last:border-0 hover:bg-surface-light/60">
                {columns.map((col) => (
                  <td key={col.key} className={`px-5 py-3.5 text-ink/80 ${col.className ?? ''}`}>
                    {col.render(row)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile stacked cards */}
      <div className="flex flex-col divide-y divide-black/5 md:hidden">
        {data.map((row) => (
          <div key={String(row[keyField])} className="flex flex-col gap-2 p-4">
            {columns.map((col) => (
              <div key={col.key} className="flex items-center justify-between gap-3 text-sm">
                <span className="font-semibold text-muted">{col.header}</span>
                <span className="text-right text-ink/80">{col.render(row)}</span>
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  )
}
