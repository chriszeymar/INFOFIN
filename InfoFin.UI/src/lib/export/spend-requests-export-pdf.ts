// ─────────────────────────────────────────────────────────────────────────────
// INFOFIN Spend Requests → PDF Export
// Generates a professionally styled PDF report of all filtered spend requests.
// Uses jspdf + jspdf-autotable for table generation.
// ─────────────────────────────────────────────────────────────────────────────

import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'
import { saveAs } from 'file-saver'
import type { SpendRequestGridRow, SpendRequestStatus } from '@/types/spend-request'
import { formatCurrency, formatDate } from '@/types/spend-request'
import { generateFilename } from './export-utils'

// ─── Constants ───────────────────────────────────────────────────────────────

const HEADER_BG = '#0F3D66'

const STATUS_COLORS: Record<string, { bg: string; text: string }> = {
  Posted:      { bg: '#DBEAFE', text: '#1E40AF' },
  UnderReview: { bg: '#FEF3C7', text: '#92400E' },
  Approved:    { bg: '#D1FAE5', text: '#065F46' },
  Completed:   { bg: '#F3F4F6', text: '#374151' },
  Declined:    { bg: '#FEE2E2', text: '#991B1B' },
}

// ─── Options ─────────────────────────────────────────────────────────────────

export interface SpendRequestExportOptions {
  status: SpendRequestStatus | 'all'
  searchQuery: string
}

// ─── Main export function ────────────────────────────────────────────────────

export async function exportSpendRequestsToPdf(
  rows: SpendRequestGridRow[],
  options: SpendRequestExportOptions,
): Promise<void> {
  const doc = new jsPDF({
    orientation: 'landscape',
    unit: 'mm',
    format: 'a4',
  })

  const PAGE_W = 297
  const PAGE_H = 210
  const MARGIN = 12

  let yPos = MARGIN

  // ─── Header block ────────────────────────────────────────────────────
  doc.setFillColor(HEADER_BG)
  doc.rect(MARGIN, yPos, PAGE_W - MARGIN * 2, 22, 'F')

  doc.setTextColor('#FFFFFF')
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(16)
  doc.text('INFOfIN', MARGIN + 6, yPos + 10)

  doc.setFontSize(10)
  doc.text('Spend Requests Report', MARGIN + 6, yPos + 19)

  // Right-aligned metadata
  doc.setFontSize(8)
  doc.setFont('helvetica', 'normal')
  const statusLabel = options.status === 'all' ? 'All Statuses' : options.status
  doc.text(`Status: ${statusLabel}`, PAGE_W - MARGIN - 6, yPos + 9, { align: 'right' })
  if (options.searchQuery) {
    doc.text(`Search: "${options.searchQuery}"`, PAGE_W - MARGIN - 6, yPos + 15, { align: 'right' })
  }
  doc.text(`Generated: ${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}`, PAGE_W - MARGIN - 6, yPos + (options.searchQuery ? 21 : 15), { align: 'right' })

  yPos += 28

  // ─── Count summary ───────────────────────────────────────────────────
  doc.setFontSize(9)
  doc.setFont('helvetica', 'normal')
  doc.setTextColor('#6B7280')
  doc.text(`${rows.length} request(s) found`, MARGIN, yPos)
  yPos += 6

  // ─── Build table ──────────────────────────────────────────────────────
  const tableColumns = [
    { header: 'Reference #',  dataKey: 'ref' },
    { header: 'Department',   dataKey: 'dept' },
    { header: 'Account',      dataKey: 'cat' },
    { header: 'Amount',       dataKey: 'amount' },
    { header: 'Currency',     dataKey: 'curr' },
    { header: 'Status',       dataKey: 'status' },
    { header: 'Encoder',      dataKey: 'enc' },
    { header: 'Assigned To',  dataKey: 'assign' },
    { header: 'Date',         dataKey: 'date' },
  ]

  const tableBody = rows.map((r) => ({
    ref: r.referenceNumber,
    dept: r.departmentName,
    cat: r.categoryName,
    amount: formatCurrency(r.amount, r.currencyCode),
    curr: r.currencyCode,
    status: r.status,
    enc: r.createdByEmail,
    assign: r.assignedToEmail ?? '—',
    date: formatDate(r.createDT),
    _statusRaw: r.status, // for styling
  }))

  autoTable(doc, {
    startY: yPos,
    margin: { left: MARGIN, right: MARGIN },
    columns: tableColumns,
    body: tableBody,
    styles: {
      fontSize: 8,
      cellPadding: 2,
      lineColor: '#D1D5DB',
      lineWidth: 0.1,
      font: 'helvetica',
      textColor: '#111827',
    },
    headStyles: {
      fillColor: HEADER_BG,
      textColor: '#FFFFFF',
      fontStyle: 'bold',
      fontSize: 8,
      halign: 'center',
      valign: 'middle',
    },
    columnStyles: {
      ref:    { font: 'courier', fontStyle: 'bold', cellWidth: 28 },
      amount: { halign: 'right', fontStyle: 'bold', cellWidth: 24 },
      curr:   { halign: 'center', cellWidth: 16 },
      status: { halign: 'center', fontStyle: 'bold', cellWidth: 24 },
      date:   { cellWidth: 22 },
    },
    alternateRowStyles: {
      fillColor: '#F9FAFB',
    },
    didParseCell: (hookData) => {
      const rowData = hookData.row.raw as any
      const status = rowData?._statusRaw as string | undefined

      // Status column coloring
      if (hookData.column.dataKey === 'status' && status) {
        const colors = STATUS_COLORS[status]
        if (colors) {
          hookData.cell.styles.fillColor = colors.bg
          hookData.cell.styles.textColor = colors.text
        }
      }

      // Right-align amount
      if (hookData.column.dataKey === 'amount') {
        hookData.cell.styles.halign = 'right'
      }
    },
    didDrawPage: () => {
      // Footer
      doc.setFontSize(7)
      doc.setFont('helvetica', 'normal')
      doc.setTextColor('#6B7280')
      doc.text(
        'InfoFin — Spend Requests Report',
        MARGIN,
        PAGE_H - 8,
      )
      // Page number is added via jspdf-autotable's addPageContent or footer
    },
  })

  // Add page numbers (after table is rendered, we know total pages)
  const pageCount = (doc as any).internal.getNumberOfPages?.() ?? 1
  for (let p = 1; p <= pageCount; p++) {
    doc.setPage(p)
    doc.setFontSize(7)
    doc.setFont('helvetica', 'normal')
    doc.setTextColor('#6B7280')
    doc.text(
      `Page ${p} of ${pageCount}`,
      PAGE_W - MARGIN,
      PAGE_H - 8,
      { align: 'right' },
    )
  }

  // ─── Generate & download ─────────────────────────────────────────────
  const pdfBlob = doc.output('blob')
  const filename = generateFilename('SpendRequests', new Date().getFullYear(), options.status === 'all' ? 'All' : options.status, 'pdf')
  saveAs(pdfBlob, filename)
}
