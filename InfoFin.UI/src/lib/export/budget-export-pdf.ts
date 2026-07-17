// ─────────────────────────────────────────────────────────────────────────────
// INFOFIN Budget → PDF Export
// Generates a professionally styled PDF P&L report ready for email submission.
// Uses jspdf + jspdf-autotable for table generation.
// ─────────────────────────────────────────────────────────────────────────────

import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'
import type { Department } from '@/lib/budget-data'
import {
  fmtCurrency,
  fmtPct,
  generateFilename,
  computeBudgetKPIs,
  buildExportRows,
  SECTION_LABELS,
  type FlatExportRow,
} from './export-utils'
import { saveAs } from 'file-saver'

// ─── Options ─────────────────────────────────────────────────────────────────

export interface ExportOptions {
  year: number
  month: number | null
  buSu: string
  groupName: string
}

// ─── Constants ───────────────────────────────────────────────────────────────

const PAGE_W = 420 // A3 landscape (mm)
const PAGE_H = 297
const MARGIN = 15

const HEADER_BG = '#0F3D66'
const SECTION_BG = '#DBEAFE'
const CLASS_BG = '#F0FDF4'
const SUBTOTAL_BG = '#F3F4F6'
const SUMMARY_BG = '#EFF6FF'
const EBIT_BG = '#1E40AF'
const WHITE = '#FFFFFF'
const BLACK = '#111827'
const GRAY = '#6B7280'

// ─── Main export function ────────────────────────────────────────────────────

export async function exportBudgetToPdf(
  departments: Department[],
  options: ExportOptions,
): Promise<void> {
  const doc = new jsPDF({
    orientation: 'landscape',
    unit: 'mm',
    format: [PAGE_W, PAGE_H],
  })

  const numDepts = departments.length
  const kpis = computeBudgetKPIs(departments)
  const rows = buildExportRows(departments)

  const bucketLabel = options.buSu === 'BU' ? 'BU — Full P&L'
    : options.buSu === 'SU' ? 'SU — OPEX'
    : 'All — Consolidated'
  const monthLabel = options.month
    ? ['January','February','March','April','May','June','July','August','September','October','November','December'][options.month - 1]
    : 'Full Year'

  // ═══════════════════════════════════════════════════════════════════════
  // PAGE 1: Title + Summary + Table
  // ═══════════════════════════════════════════════════════════════════════

  let yPos = MARGIN

  // ─── Header block ────────────────────────────────────────────────────
  // Left: INFOFIN brand, Right: report metadata
  doc.setFillColor(HEADER_BG)
  doc.rect(MARGIN, yPos, PAGE_W - MARGIN * 2, 28, 'F')

  doc.setTextColor(WHITE)
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(18)
  doc.text('INFOfIN', MARGIN + 6, yPos + 12)

  doc.setFontSize(11)
  doc.text('Budget Report', MARGIN + 6, yPos + 22)

  // Right-aligned metadata
  doc.setFontSize(9)
  doc.setFont('helvetica', 'normal')
  doc.text(`FY ${options.year}  |  ${bucketLabel}`, PAGE_W - MARGIN - 6, yPos + 10, { align: 'right' })
  doc.text(`${monthLabel}  |  ${options.groupName || 'All Departments'}`, PAGE_W - MARGIN - 6, yPos + 17, { align: 'right' })
  doc.text(`Generated: ${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}`, PAGE_W - MARGIN - 6, yPos + 24, { align: 'right' })

  yPos += 34

  // ─── KPI Summary box ─────────────────────────────────────────────────
  const summaryItems = [
    { label: 'Revenue', f: kpis.revF, e: kpis.revE },
    { label: 'COS', f: kpis.cosF, e: kpis.cosE },
    { label: 'Gross Margin', f: kpis.gmF, e: kpis.gmE, isKey: true },
    { label: 'Fixed Costs', f: kpis.fixF, e: kpis.fixE },
    { label: 'Variable Costs', f: kpis.varF, e: kpis.varE },
    { label: 'Total OPEX', f: kpis.opexF, e: kpis.opexE, isKey: true },
    { label: 'EBIT', f: kpis.ebitF, e: kpis.ebitE, isKey: true },
  ]

  const kpiBoxW = PAGE_W - MARGIN * 2
  const kpiBoxH = 36
  doc.setDrawColor('#D1D5DB')
  doc.setFillColor('#FAFAFA')
  doc.roundedRect(MARGIN, yPos, kpiBoxW, kpiBoxH, 3, 3, 'FD')

  doc.setFontSize(8)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(GRAY)
  doc.text('SUMMARY', MARGIN + 4, yPos + 5)

  const kpiItemW = kpiBoxW / summaryItems.length
  summaryItems.forEach((item, i) => {
    const x = MARGIN + i * kpiItemW + 2
    // Label
    doc.setFontSize(6.5)
    doc.setFont('helvetica', 'bold')
    doc.setTextColor(item.isKey ? HEADER_BG : GRAY)
    doc.text(item.label.toUpperCase(), x, yPos + 11)

    // Forecast
    doc.setFontSize(9)
    doc.setFont('helvetica', item.isKey ? 'bold' : 'normal')
    doc.setTextColor(BLACK)
    doc.text(fmtCurrency(item.f), x, yPos + 20)

    // Execution & %
    const pct = item.f !== 0 ? Math.round((item.e / item.f) * 100) : null
    doc.setFontSize(7.5)
    doc.setFont('helvetica', 'normal')
    const execColor = pct !== null && pct > 100 ? '#DC2626' : pct !== null && pct >= 80 ? '#D97706' : '#059669'
    doc.setTextColor(execColor)
    doc.text(`${fmtCurrency(item.e)}  ${pct !== null ? pct + '%' : '—'}`, x, yPos + 27)
  })

  yPos += kpiBoxH + 8

  // ─── Build table columns ─────────────────────────────────────────────
  const tableColumns: Array<{ header: string; dataKey: string }> = [
    { header: 'Account', dataKey: 'label' },
  ]
  for (let d = 0; d < numDepts; d++) {
    const name = departments[d].name.length > 14
      ? departments[d].name.slice(0, 13) + '…'
      : departments[d].name
    tableColumns.push(
      { header: `${name} F`, dataKey: `d${d}f` },
      { header: `${name} E`, dataKey: `d${d}e` },
      { header: '%', dataKey: `d${d}p` },
    )
  }
  tableColumns.push(
    { header: 'TOTAL F', dataKey: 'tf' },
    { header: 'TOTAL E', dataKey: 'te' },
    { header: '%', dataKey: 'tp' },
  )

  // ─── Build table body ────────────────────────────────────────────────
  const tableBody: Record<string, string | number>[] = []

  for (const row of rows) {
    const rowData: Record<string, string | number> = {
      label: (row.indent === 1 ? '  ' : row.indent === 2 ? '    ' : '') + row.label,
    }
    for (let d = 0; d < numDepts; d++) {
      const v = row.values[d] ?? { forecast: 0, execution: 0 }
      rowData[`d${d}f`] = fmtCurrency(v.forecast)
      rowData[`d${d}e`] = fmtCurrency(v.execution)
      rowData[`d${d}p`] = fmtPct(v.forecast, v.execution)
    }
    rowData['tf'] = fmtCurrency(row.totalForecast)
    rowData['te'] = fmtCurrency(row.totalExecution)
    rowData['tp'] = fmtPct(row.totalForecast, row.totalExecution)

    // Add styling metadata
    ;(rowData as any)._rowType = row.isSectionHeader ? 'section'
      : row.isClassification ? 'class'
      : row.isHighlight ? 'ebit'
      : row.isSummary ? 'summary'
      : row.isSubtotal ? 'subtotal'
      : 'item'

    tableBody.push(rowData)
  }

  // ─── Render table ────────────────────────────────────────────────────
  autoTable(doc, {
    startY: yPos,
    margin: { left: MARGIN, right: MARGIN },
    columns: tableColumns,
    body: tableBody,
    styles: {
      fontSize: 7.5,
      cellPadding: 1.5,
      lineColor: '#D1D5DB',
      lineWidth: 0.1,
      font: 'helvetica',
      textColor: BLACK,
    },
    headStyles: {
      fillColor: HEADER_BG,
      textColor: WHITE,
      fontStyle: 'bold',
      fontSize: 7,
      halign: 'center',
      valign: 'middle',
    },
    columnStyles: {
      label: { cellWidth: 50, fontStyle: 'normal' },
    },
    alternateRowStyles: {
      fillColor: '#F9FAFB',
    },
    didParseCell: (hookData) => {
      const rowData = hookData.row.raw as any
      const rowType = rowData?._rowType as string | undefined

      if (rowType === 'section') {
        hookData.cell.styles.fillColor = SECTION_BG
        hookData.cell.styles.fontStyle = 'bold'
        hookData.cell.styles.fontSize = 8
        hookData.cell.styles.textColor = HEADER_BG
      } else if (rowType === 'class') {
        hookData.cell.styles.fillColor = CLASS_BG
        hookData.cell.styles.fontStyle = 'bold'
        hookData.cell.styles.fontSize = 7.5
        hookData.cell.styles.textColor = '#065F46'
      } else if (rowType === 'ebit') {
        hookData.cell.styles.fillColor = EBIT_BG
        hookData.cell.styles.textColor = WHITE
        hookData.cell.styles.fontStyle = 'bold'
        hookData.cell.styles.fontSize = 8.5
      } else if (rowType === 'summary') {
        hookData.cell.styles.fillColor = SUMMARY_BG
        hookData.cell.styles.fontStyle = 'bold'
        hookData.cell.styles.fontSize = 8
        hookData.cell.styles.textColor = HEADER_BG
      } else if (rowType === 'subtotal') {
        hookData.cell.styles.fillColor = SUBTOTAL_BG
        hookData.cell.styles.fontStyle = 'bold'
        hookData.cell.styles.fontSize = 8
      }

      // Right-align numeric columns
      if (hookData.column.dataKey !== 'label') {
        hookData.cell.styles.halign = 'right'
      }
      // Center percentage columns
      if (hookData.column.dataKey.endsWith('p')) {
        hookData.cell.styles.halign = 'center'
      }
    },
    didDrawPage: () => {
      // Footer on every page
      const pageCount = (doc as any).internal.getNumberOfPages?.() ?? 1
      doc.setFontSize(7)
      doc.setFont('helvetica', 'normal')
      doc.setTextColor(GRAY)
      doc.text(
        `InfoFin Budget Report — FY ${options.year}`,
        MARGIN,
        PAGE_H - 8,
      )
      doc.text(
        `Page ${pageCount}`,
        PAGE_W - MARGIN,
        PAGE_H - 8,
        { align: 'right' },
      )
    },
  })

  // ─── Generate & download ─────────────────────────────────────────────
  const pdfBlob = doc.output('blob')
  const filename = generateFilename('Budget', options.year, options.buSu, 'pdf')
  saveAs(pdfBlob, filename)
}
