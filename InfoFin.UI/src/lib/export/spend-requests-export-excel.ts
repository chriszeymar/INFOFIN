// ─────────────────────────────────────────────────────────────────────────────
// INFOFIN Spend Requests → Excel Export
// Generates a fully styled .xlsx report of all filtered spend requests.
// Uses exceljs for professional formatting (colors, borders, fonts, freezing).
// ─────────────────────────────────────────────────────────────────────────────

import ExcelJS from 'exceljs'
import { saveAs } from 'file-saver'
import type { SpendRequestGridRow, SpendRequestStatus } from '@/types/spend-request'
import { formatCurrency, formatDate } from '@/types/spend-request'
import { generateFilename, COLORS } from './export-utils'

// ─── Options ─────────────────────────────────────────────────────────────────

export interface SpendRequestExportOptions {
  status: SpendRequestStatus | 'all'
  searchQuery: string
}

// ─── Main export function ────────────────────────────────────────────────────

export async function exportSpendRequestsToExcel(
  rows: SpendRequestGridRow[],
  options: SpendRequestExportOptions,
): Promise<void> {
  const wb = new ExcelJS.Workbook()
  wb.creator = 'InfoFin'
  wb.created = new Date()

  const ws = wb.addWorksheet('Spend Requests', {
    views: [{ state: 'frozen', ySplit: 4 }], // Freeze header rows
  })

  const columns = [
    { header: 'Reference #',    key: 'ref',    width: 16 },
    { header: 'Department',     key: 'dept',   width: 22 },
    { header: 'Account',        key: 'cat',    width: 28 },
    { header: 'Amount',         key: 'amount', width: 16 },
    { header: 'Currency',       key: 'curr',   width: 12 },
    { header: 'Status',         key: 'status', width: 16 },
    { header: 'Encoder',        key: 'enc',    width: 28 },
    { header: 'Assigned To',    key: 'assign', width: 28 },
    { header: 'Date',           key: 'date',   width: 14 },
  ]
  const numCols = columns.length

  // ─── Styles ───────────────────────────────────────────────────────────
  const titleFont: Partial<ExcelJS.Font> = { name: 'Calibri', size: 14, bold: true, color: { argb: COLORS.white } }
  const subtitleFont: Partial<ExcelJS.Font> = { name: 'Calibri', size: 10, color: { argb: COLORS.gray } }
  const headerFont: Partial<ExcelJS.Font> = { name: 'Calibri', size: 9, bold: true, color: { argb: COLORS.white } }
  const dataFont: Partial<ExcelJS.Font> = { name: 'Calibri', size: 10, color: { argb: COLORS.black } }
  const monoFont: Partial<ExcelJS.Font> = { name: 'Consolas', size: 10, color: { argb: COLORS.black } }

  const centerAlign: Partial<ExcelJS.Alignment> = { horizontal: 'center', vertical: 'middle' }
  const leftAlign: Partial<ExcelJS.Alignment> = { horizontal: 'left', vertical: 'middle' }
  const rightAlign: Partial<ExcelJS.Alignment> = { horizontal: 'right', vertical: 'middle' }

  const thinBorder: Partial<ExcelJS.Borders> = {
    top: { style: 'thin', color: { argb: COLORS.border } },
    bottom: { style: 'thin', color: { argb: COLORS.border } },
    left: { style: 'thin', color: { argb: COLORS.border } },
    right: { style: 'thin', color: { argb: COLORS.border } },
  }

  // Status colors for Excel
  const statusFill: Record<string, string> = {
    Posted:      'DBEAFE',  // blue
    UnderReview: 'FEF3C7',  // amber
    Approved:    'D1FAE5',  // green
    Completed:   'F3F4F6',  // gray
    Declined:    'FEE2E2',  // red
  }
  const statusFont: Record<string, string> = {
    Posted:      '1E40AF',
    UnderReview: '92400E',
    Approved:    '065F46',
    Completed:   '374151',
    Declined:    '991B1B',
  }

  // ─── Row 1: Title ────────────────────────────────────────────────────
  ws.mergeCells(1, 1, 1, numCols)
  const titleCell = ws.getCell('A1')
  titleCell.value = 'InfoFin — Spend Requests Report'
  titleCell.font = titleFont
  titleCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: COLORS.primaryDark } }
  titleCell.alignment = { horizontal: 'center', vertical: 'middle' }
  ws.getRow(1).height = 32

  // ─── Row 2: Subtitle with filters ────────────────────────────────────
  ws.mergeCells(2, 1, 2, numCols)
  const subCell = ws.getCell('A2')
  const statusLabel = options.status === 'all' ? 'All Statuses' : options.status
  const filterParts = [`Status: ${statusLabel}`]
  if (options.searchQuery) filterParts.push(`Search: "${options.searchQuery}"`)
  filterParts.push(`Generated: ${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}`)
  subCell.value = filterParts.join('  |  ')
  subCell.font = subtitleFont
  subCell.alignment = { horizontal: 'center', vertical: 'middle' }
  subCell.border = { bottom: { style: 'thin', color: { argb: COLORS.border } } }
  ws.getRow(2).height = 22

  // ─── Row 3: Blank ────────────────────────────────────────────────────
  ws.getRow(3).height = 8

  // ─── Row 4: Column headers ───────────────────────────────────────────
  const hRow = ws.getRow(4)
  hRow.height = 26

  columns.forEach((col, i) => {
    const cell = ws.getCell(4, i + 1)
    cell.value = col.header
    cell.font = headerFont
    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: COLORS.primaryDark } }
    cell.alignment = centerAlign
    cell.border = thinBorder
  })

  // ─── Data rows ────────────────────────────────────────────────────────
  rows.forEach((r, rowIdx) => {
    const excelRow = ws.getRow(5 + rowIdx)
    excelRow.height = 20

    const values = [
      { v: r.referenceNumber,     font: monoFont, align: leftAlign },
      { v: r.departmentName,       font: dataFont, align: leftAlign },
      { v: r.categoryName,         font: dataFont, align: leftAlign },
      { v: r.amount,               font: { ...dataFont, bold: true }, align: rightAlign, fmt: '#,##0' },
      { v: r.currencyCode,         font: dataFont, align: centerAlign },
      { v: r.status,               font: { ...dataFont, bold: true, color: { argb: statusFont[r.status] ?? COLORS.black } }, align: centerAlign },
      { v: r.createdByEmail,       font: dataFont, align: leftAlign },
      { v: r.assignedToEmail ?? '—', font: dataFont, align: leftAlign },
      { v: formatDate(r.createDT), font: dataFont, align: leftAlign },
    ]

    values.forEach((val, colIdx) => {
      const cell = ws.getCell(5 + rowIdx, colIdx + 1)
      cell.value = val.v
      cell.font = val.font
      cell.alignment = val.align
      cell.border = thinBorder
      if ((val as any).fmt) cell.numFmt = (val as any).fmt

      // Status background color
      if (colIdx === 5) {
        const fill = statusFill[r.status]
        if (fill) {
          cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: fill } }
        }
      }
    })
  })

  // ─── Auto-filter ──────────────────────────────────────────────────────
  ws.autoFilter = {
    from: { row: 4, column: 1 },
    to: { row: 4 + rows.length, column: numCols },
  }

  // ─── Footer ──────────────────────────────────────────────────────────
  const footerRow = 5 + rows.length + 2
  ws.mergeCells(footerRow, 1, footerRow, numCols)
  const footerCell = ws.getCell(footerRow, 1)
  footerCell.value = `Generated by InfoFin on ${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })}  ·  ${rows.length} request(s)`
  footerCell.font = { name: 'Calibri', size: 8, italic: true, color: { argb: COLORS.gray } }
  footerCell.alignment = { horizontal: 'center', vertical: 'middle' }

  // ─── Print settings ──────────────────────────────────────────────────
  ws.pageSetup.orientation = 'landscape'
  ws.pageSetup.paperSize = 9
  ws.pageSetup.fitToPage = true
  ws.pageSetup.fitToWidth = 1
  ws.pageSetup.fitToHeight = 0
  ws.pageSetup.showGridLines = false

  // Set column widths
  columns.forEach((col, i) => {
    ws.getColumn(i + 1).width = col.width
  })

  // ─── Generate & download ─────────────────────────────────────────────
  const buf = await wb.xlsx.writeBuffer()
  const blob = new Blob([buf], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' })
  const filename = generateFilename('SpendRequests', new Date().getFullYear(), options.status === 'all' ? 'All' : options.status, 'xlsx')
  saveAs(blob, filename)
}
