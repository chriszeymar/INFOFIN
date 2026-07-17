// ─────────────────────────────────────────────────────────────────────────────
// INFOFIN Budget → Excel Export
// Generates a fully styled .xlsx P&L report ready for email submission.
// Uses exceljs for professional formatting (colors, borders, fonts, merging).
// ─────────────────────────────────────────────────────────────────────────────

import ExcelJS from 'exceljs'
import { saveAs } from 'file-saver'
import type { Department } from '@/lib/budget-data'
import {
  fmtCurrency,
  fmtPct,
  fmtExcelNum,
  generateFilename,
  COLORS,
  buildExportRows,
  type FlatExportRow,
} from './export-utils'

// ─── Options ─────────────────────────────────────────────────────────────────

export interface ExportOptions {
  year: number
  month: number | null
  buSu: string
  groupName: string
}

// ─── Main export function ────────────────────────────────────────────────────

export async function exportBudgetToExcel(
  departments: Department[],
  options: ExportOptions,
): Promise<void> {
  const wb = new ExcelJS.Workbook()
  wb.creator = 'InfoFin'
  wb.created = new Date()

  const ws = wb.addWorksheet('Budget Report', {
    views: [{ state: 'frozen', ySplit: 5 }], // Freeze header rows
  })

  const numDepts = departments.length
  const colsPerDept = 3 // Forecast, Execution, %
  const totalCols = 1 + numDepts * colsPerDept + colsPerDept // Account + depts + TOTAL

  // ─── Column widths ────────────────────────────────────────────────────
  ws.getColumn(1).width = 36 // Account column
  for (let i = 0; i < numDepts; i++) {
    ws.getColumn(2 + i * 3).width = 16     // Forecast
    ws.getColumn(3 + i * 3).width = 16     // Execution
    ws.getColumn(4 + i * 3).width = 8      // %
  }
  // TOTAL columns
  ws.getColumn(totalCols - 2).width = 16  // Total Forecast
  ws.getColumn(totalCols - 1).width = 16  // Total Execution
  ws.getColumn(totalCols).width = 8       // Total %

  // ─── Build rows for export ────────────────────────────────────────────
  const rows = buildExportRows(departments)

  // ─── Styles ───────────────────────────────────────────────────────────
  const titleFont: Partial<ExcelJS.Font> = { name: 'Calibri', size: 14, bold: true, color: { argb: COLORS.white } }
  const subtitleFont: Partial<ExcelJS.Font> = { name: 'Calibri', size: 10, color: { argb: COLORS.gray } }
  const headerFont: Partial<ExcelJS.Font> = { name: 'Calibri', size: 9, bold: true, color: { argb: COLORS.white } }
  const sectionFont: Partial<ExcelJS.Font> = { name: 'Calibri', size: 10, bold: true, color: { argb: COLORS.primaryDark } }
  const classFont: Partial<ExcelJS.Font> = { name: 'Calibri', size: 9, bold: true, color: { argb: '065F46' } }
  const itemFont: Partial<ExcelJS.Font> = { name: 'Calibri', size: 10, color: { argb: COLORS.black } }
  const subtotalFont: Partial<ExcelJS.Font> = { name: 'Calibri', size: 10, bold: true, color: { argb: COLORS.black } }
  const summaryFont: Partial<ExcelJS.Font> = { name: 'Calibri', size: 10, bold: true, color: { argb: COLORS.primaryDark } }
  const ebitFont: Partial<ExcelJS.Font> = { name: 'Calibri', size: 11, bold: true, color: { argb: COLORS.white } }
  const numFont: Partial<ExcelJS.Font> = { name: 'Calibri', size: 10, color: { argb: COLORS.black } }

  const centerAlign: Partial<ExcelJS.Alignment> = { horizontal: 'center', vertical: 'middle', wrapText: false }
  const leftAlign: Partial<ExcelJS.Alignment> = { horizontal: 'left', vertical: 'middle', wrapText: false }
  const rightAlign: Partial<ExcelJS.Alignment> = { horizontal: 'right', vertical: 'middle', wrapText: false }

  const thinBorder: Partial<ExcelJS.Borders> = {
    top: { style: 'thin', color: { argb: COLORS.border } },
    bottom: { style: 'thin', color: { argb: COLORS.border } },
    left: { style: 'thin', color: { argb: COLORS.border } },
    right: { style: 'thin', color: { argb: COLORS.border } },
  }

  const bottomBorder: Partial<ExcelJS.Borders> = {
    bottom: { style: 'medium', color: { argb: COLORS.primaryDark } },
  }

  // ─── Row 1: Title ────────────────────────────────────────────────────
  let rowIdx = 1
  const titleRow = ws.getRow(rowIdx)
  titleRow.height = 32

  const bucketLabel = options.buSu === 'BU' ? 'BU — Full P&L'
    : options.buSu === 'SU' ? 'SU — OPEX'
    : 'All — Consolidated'
  const monthLabel = options.month ? ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'][options.month - 1] : 'Full Year'

  ws.mergeCells(1, 1, 1, totalCols)
  const titleCell = ws.getCell('A1')
  titleCell.value = `InfoFin — Budget Report`
  titleCell.font = titleFont
  titleCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: COLORS.primaryDark } }
  titleCell.alignment = { horizontal: 'center', vertical: 'middle' }

  // ─── Row 2: Subtitle ─────────────────────────────────────────────────
  rowIdx = 2
  ws.mergeCells(2, 1, 2, totalCols)
  const subCell = ws.getCell('A2')
  subCell.value = `FY ${options.year}  |  ${bucketLabel}  |  ${monthLabel}  |  ${options.groupName || 'All Departments'}  |  Generated: ${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}`
  subCell.font = subtitleFont
  subCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: COLORS.white } }
  subCell.alignment = { horizontal: 'center', vertical: 'middle' }
  subCell.border = {
    bottom: { style: 'thin', color: { argb: COLORS.border } },
  }
  ws.getRow(2).height = 22

  // ─── Row 3: Blank ────────────────────────────────────────────────────
  rowIdx = 3
  ws.getRow(3).height = 8

  // ─── Row 4-5: Column headers ─────────────────────────────────────────
  rowIdx = 4
  const hRow1 = ws.getRow(rowIdx)
  hRow1.height = 24

  // Account header (spans 2 rows)
  ws.mergeCells(4, 1, 5, 1)
  const acctHeader = ws.getCell('A4')
  acctHeader.value = 'Account'
  acctHeader.font = headerFont
  acctHeader.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: COLORS.primaryDark } }
  acctHeader.alignment = centerAlign
  acctHeader.border = thinBorder

  // Department group headers
  for (let d = 0; d < numDepts; d++) {
    const startCol = 2 + d * 3
    ws.mergeCells(4, startCol, 4, startCol + 2)
    const deptCell = ws.getCell(4, startCol)
    deptCell.value = departments[d].name
    deptCell.font = headerFont
    deptCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: COLORS.primaryMed } }
    deptCell.alignment = centerAlign
    deptCell.border = thinBorder

    // Sub-headers: Forecast | Execution | %
    const fCell = ws.getCell(5, startCol)
    fCell.value = 'Forecast'
    fCell.font = { name: 'Calibri', size: 8, bold: true, color: { argb: COLORS.white } }
    fCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: COLORS.primaryMed } }
    fCell.alignment = centerAlign
    fCell.border = thinBorder

    const eCell = ws.getCell(5, startCol + 1)
    eCell.value = 'Execution'
    eCell.font = { name: 'Calibri', size: 8, bold: true, color: { argb: COLORS.white } }
    eCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: COLORS.primaryMed } }
    eCell.alignment = centerAlign
    eCell.border = thinBorder

    const pCell = ws.getCell(5, startCol + 2)
    pCell.value = '%'
    pCell.font = { name: 'Calibri', size: 8, bold: true, color: { argb: COLORS.white } }
    pCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: COLORS.primaryMed } }
    pCell.alignment = centerAlign
    pCell.border = thinBorder
  }

  // TOTAL group headers
  const totalStart = 2 + numDepts * 3
  ws.mergeCells(4, totalStart, 4, totalStart + 2)
  const totalHeader = ws.getCell(4, totalStart)
  totalHeader.value = 'TOTAL'
  totalHeader.font = { name: 'Calibri', size: 9, bold: true, color: { argb: COLORS.white } }
  totalHeader.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: '0A2F4D' } }
  totalHeader.alignment = centerAlign
  totalHeader.border = thinBorder

  for (let off = 0; off < 3; off++) {
    const tc = ws.getCell(5, totalStart + off)
    tc.value = off === 0 ? 'Forecast' : off === 1 ? 'Execution' : '%'
    tc.font = { name: 'Calibri', size: 8, bold: true, color: { argb: COLORS.white } }
    tc.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: '0A2F4D' } }
    tc.alignment = centerAlign
    tc.border = thinBorder
  }

  // ─── Data rows ───────────────────────────────────────────────────────
  rowIdx = 5 // will be incremented before each data row

  for (const row of rows) {
    rowIdx++
    const excelRow = ws.getRow(rowIdx)
    excelRow.height = row.isSectionHeader ? 22 : row.isSubtotal || row.isSummary ? 20 : 18

    const labelCol = ws.getCell(rowIdx, 1)

    // Determine indent level
    const indent = row.indent === 1 ? '    ' : row.indent === 2 ? '        ' : ''
    labelCol.value = indent + row.label

    // ─── Row styling ────────────────────────────────────────────────
    if (row.isSectionHeader) {
      labelCol.font = sectionFont
      ws.mergeCells(rowIdx, 1, rowIdx, totalCols)
      for (let c = 1; c <= totalCols; c++) {
        const cell = ws.getCell(rowIdx, c)
        cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: COLORS.sectionBg } }
        cell.border = thinBorder
        cell.alignment = leftAlign
      }
      // Skip value cells for section headers
      continue
    }

    if (row.isClassification) {
      labelCol.font = classFont
      for (let c = 1; c <= totalCols; c++) {
        const cell = ws.getCell(rowIdx, c)
        cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: COLORS.classificationBg } }
        cell.border = thinBorder
      }
      continue
    }

    if (row.isSubtotal) {
      labelCol.font = subtotalFont
      labelCol.border = { ...thinBorder, ...bottomBorder }
      for (let c = 2; c <= totalCols; c++) {
        const cell = ws.getCell(rowIdx, c)
        cell.font = subtotalFont
        cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: COLORS.subtotalBg } }
        cell.border = { ...thinBorder, ...bottomBorder }
        cell.alignment = rightAlign
      }
    } else if (row.isHighlight) {
      // EBIT row
      labelCol.font = ebitFont
      labelCol.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: COLORS.ebitBg } }
      labelCol.border = thinBorder
      for (let c = 2; c <= totalCols; c++) {
        const cell = ws.getCell(rowIdx, c)
        cell.font = ebitFont
        cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: COLORS.ebitBg } }
        cell.border = thinBorder
        cell.alignment = rightAlign
      }
    } else if (row.isSummary) {
      labelCol.font = summaryFont
      labelCol.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: COLORS.summaryBg } }
      labelCol.border = thinBorder
      for (let c = 2; c <= totalCols; c++) {
        const cell = ws.getCell(rowIdx, c)
        cell.font = summaryFont
        cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: COLORS.summaryBg } }
        cell.border = { ...thinBorder, ...bottomBorder }
        cell.alignment = rightAlign
      }
    } else {
      // Regular item row
      labelCol.font = itemFont
      labelCol.border = thinBorder
    }

    // ─── Value cells ────────────────────────────────────────────────
    if (!row.isSectionHeader && !row.isClassification) {
      // Per-department values
      for (let d = 0; d < numDepts; d++) {
        const v = row.values[d] ?? { forecast: 0, execution: 0 }
        const fCol = 2 + d * 3
        const eCol = 2 + d * 3 + 1
        const pCol = 2 + d * 3 + 2

        const fCell = ws.getCell(rowIdx, fCol)
        fCell.value = fmtExcelNum(v.forecast)
        fCell.numFmt = '#,##0'
        fCell.font = numFont
        fCell.alignment = rightAlign
        if (!row.isSubtotal && !row.isSummary && !row.isHighlight) fCell.border = thinBorder

        const eCell = ws.getCell(rowIdx, eCol)
        eCell.value = fmtExcelNum(v.execution)
        eCell.numFmt = '#,##0'
        eCell.font = numFont
        eCell.alignment = rightAlign
        if (!row.isSubtotal && !row.isSummary && !row.isHighlight) eCell.border = thinBorder

        const pCell = ws.getCell(rowIdx, pCol)
        const pct = v.forecast !== 0 ? Math.round((v.execution / v.forecast) * 100) : null
        pCell.value = pct !== null ? pct / 100 : null
        pCell.numFmt = pct !== null ? '0%' : '@'
        pCell.font = numFont
        pCell.alignment = centerAlign
        if (!row.isSubtotal && !row.isSummary && !row.isHighlight) pCell.border = thinBorder
      }

      // TOTAL columns
      const tfCol = totalStart
      const teCol = totalStart + 1
      const tpCol = totalStart + 2

      const tfCell = ws.getCell(rowIdx, tfCol)
      tfCell.value = fmtExcelNum(row.totalForecast)
      tfCell.numFmt = '#,##0'
      tfCell.font = { name: 'Calibri', size: 10, bold: true, color: { argb: COLORS.black } }
      tfCell.alignment = rightAlign
      if (!row.isSubtotal && !row.isSummary && !row.isHighlight) tfCell.border = thinBorder

      const teCell = ws.getCell(rowIdx, teCol)
      teCell.value = fmtExcelNum(row.totalExecution)
      teCell.numFmt = '#,##0'
      teCell.font = { name: 'Calibri', size: 10, bold: true, color: { argb: COLORS.black } }
      teCell.alignment = rightAlign
      if (!row.isSubtotal && !row.isSummary && !row.isHighlight) teCell.border = thinBorder

      const tpCell = ws.getCell(rowIdx, tpCol)
      const totalPct = row.totalForecast !== 0 ? Math.round((row.totalExecution / row.totalForecast) * 100) : null
      tpCell.value = totalPct !== null ? totalPct / 100 : null
      tpCell.numFmt = totalPct !== null ? '0%' : '@'
      tpCell.font = { name: 'Calibri', size: 10, bold: true, color: { argb: COLORS.black } }
      tpCell.alignment = centerAlign
      if (!row.isSubtotal && !row.isSummary && !row.isHighlight) tpCell.border = thinBorder
    }
  }

  // ─── Footer row ──────────────────────────────────────────────────────
  rowIdx += 2
  ws.mergeCells(rowIdx, 1, rowIdx, totalCols)
  const footerCell = ws.getCell(rowIdx, 1)
  footerCell.value = `Generated by InfoFin on ${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })}`
  footerCell.font = { name: 'Calibri', size: 8, italic: true, color: { argb: COLORS.gray } }
  footerCell.alignment = { horizontal: 'center', vertical: 'middle' }

  // ─── Print settings ──────────────────────────────────────────────────
  ws.pageSetup.orientation = 'landscape'
  ws.pageSetup.paperSize = 9 // A4
  ws.pageSetup.fitToPage = true
  ws.pageSetup.fitToWidth = 1
  ws.pageSetup.fitToHeight = 0
  ws.pageSetup.showGridLines = false

  // ─── Generate & download ─────────────────────────────────────────────
  const buf = await wb.xlsx.writeBuffer()
  const blob = new Blob([buf], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' })
  const filename = generateFilename('Budget', options.year, options.buSu, 'xlsx')
  saveAs(blob, filename)
}
