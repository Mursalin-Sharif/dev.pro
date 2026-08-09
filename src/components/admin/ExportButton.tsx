import { useState } from 'react'
import { Download, FileSpreadsheet, FileText } from 'lucide-react'
import { AnimatePresence, motion } from 'framer-motion'
import { toast } from 'sonner'
import type { Registration } from '@/types'
import { exportRegistrationsToCsv, exportRegistrationsToExcel } from '@/lib/exportToExcel'

export function ExportButton({ registrations }: { registrations: Registration[] }) {
  const [open, setOpen] = useState(false)

  const handleExport = (format: 'xlsx' | 'csv') => {
    if (registrations.length === 0) {
      toast.error('There are no registrations to export yet.')
      return
    }
    if (format === 'xlsx') {
      exportRegistrationsToExcel(registrations)
    } else {
      exportRegistrationsToCsv(registrations)
    }
    toast.success(`Exported ${registrations.length} registrations (${format.toUpperCase()}).`)
    setOpen(false)
  }

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-2 rounded-full bg-navy px-4 py-2.5 text-sm font-bold text-white transition-colors hover:bg-navy-soft"
      >
        <Download size={16} />
        Export Excel
      </button>
      <AnimatePresence>
        {open && (
          <>
            <div className="fixed inset-0 z-30" onClick={() => setOpen(false)} />
            <motion.div
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              className="absolute right-0 z-40 mt-2 w-52 overflow-hidden rounded-xl border border-black/5 bg-white py-1 shadow-card"
            >
              <button
                onClick={() => handleExport('xlsx')}
                className="flex w-full items-center gap-2 px-4 py-2.5 text-left text-sm text-ink hover:bg-black/5"
              >
                <FileSpreadsheet size={16} className="text-success" />
                Export as Excel (.xlsx)
              </button>
              <button
                onClick={() => handleExport('csv')}
                className="flex w-full items-center gap-2 px-4 py-2.5 text-left text-sm text-ink hover:bg-black/5"
              >
                <FileText size={16} className="text-primary" />
                Export as CSV
              </button>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  )
}
