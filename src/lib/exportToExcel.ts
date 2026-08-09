import * as XLSX from 'xlsx'
import { saveAs } from 'file-saver'
import type { Registration } from '@/types'
import { formatDate } from '@/lib/utils'

function toRow(registration: Registration) {
  return {
    'First Name': registration.first_name,
    'Last Name': registration.last_name,
    'Date of Birth': formatDate(registration.date_of_birth),
    City: registration.city,
    Country: registration.country,
    Phone: registration.phone,
    Email: registration.email,
    Status: registration.status,
    'Fee Amount': (registration.fee_amount / 100).toFixed(2),
    Currency: registration.fee_currency.toUpperCase(),
    'Registered At': formatDate(registration.created_at),
  }
}

export function exportRegistrationsToExcel(registrations: Registration[], filename = 'hopeland-registrations.xlsx') {
  const rows = registrations.map(toRow)
  const worksheet = XLSX.utils.json_to_sheet(rows)
  const workbook = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Registrations')
  const buffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' })
  saveAs(new Blob([buffer], { type: 'application/octet-stream' }), filename)
}

export function exportRegistrationsToCsv(registrations: Registration[], filename = 'hopeland-registrations.csv') {
  const rows = registrations.map(toRow)
  const worksheet = XLSX.utils.json_to_sheet(rows)
  const csv = XLSX.utils.sheet_to_csv(worksheet)
  saveAs(new Blob([csv], { type: 'text/csv;charset=utf-8;' }), filename)
}
