// ─────────────────────────────────────────────────────────────────────────────
// INFOFIN Dashboard → PDF Export
// Captures visible dashboard widgets as images and composes a professional
// multi-page PDF report. Uses html2canvas for DOM-to-image capture.
// ─────────────────────────────────────────────────────────────────────────────

import jsPDF from 'jspdf'
import html2canvas from 'html2canvas'
import { saveAs } from 'file-saver'
import { generateFilename, COLORS } from './export-utils'

// ─── Options ─────────────────────────────────────────────────────────────────

export interface DashboardExportOptions {
  year: number
  view: 'BU' | 'SU' | 'all'
  month: number | null
  departmentName: string
}

// ─── Widget capture config ───────────────────────────────────────────────────

interface WidgetCapture {
  /** CSS selector for the widget container element */
  selector: string
  /** Display label in the PDF */
  label: string
  /** Maximum width in the PDF (mm) — will scale down if wider */
  maxWidth: number
}

// ─── Constants ───────────────────────────────────────────────────────────────

const PAGE_W = 210 // A4 portrait (mm)
const PAGE_H = 297
const MARGIN = 12
const CONTENT_W = PAGE_W - MARGIN * 2

// ─── Main export function ────────────────────────────────────────────────────

export async function exportDashboardToPdf(
  visibleWidgetIds: string[],
  options: DashboardExportOptions,
): Promise<void> {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  })

  const viewLabel = options.view === 'all' ? 'All — Consolidated' : options.view === 'BU' ? 'BU — Full P&L' : 'SU — OPEX'
  const monthLabel = options.month
    ? ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'][options.month - 1]
    : 'Full Year'

  // ═══════════════════════════════════════════════════════════════════════
  // PAGE 1: Title + KPI Summary
  // ═══════════════════════════════════════════════════════════════════════

  drawPageHeader(doc, 1, options, viewLabel, monthLabel)

  let yPos = 42

  // ─── Capture KPI cards if visible ────────────────────────────────────
  if (visibleWidgetIds.includes('kpi-cards')) {
    const kpiImg = await captureElement('[data-widget="kpi-cards"]', 2)
    if (kpiImg) {
      const imgH = 36 // approximate height for KPI cards row
      doc.addImage(kpiImg, 'PNG', MARGIN, yPos, CONTENT_W, imgH)
      yPos += imgH + 10
    }
  }

  // ─── Capture execution-forecast chart row if visible ─────────────────
  if (visibleWidgetIds.includes('execution-forecast')) {
    const chartImg = await captureElement('[data-widget="execution-forecast"]', 2)
    if (chartImg) {
      // Check if it fits on current page
      const neededH = 90
      if (yPos + neededH > PAGE_H - 20) {
        doc.addPage()
        drawPageHeader(doc, doc.getCurrentPageInfo().pageNumber as number, options, viewLabel, monthLabel)
        yPos = 42
      }
      doc.addImage(chartImg, 'PNG', MARGIN, yPos, CONTENT_W, neededH)
      yPos += neededH + 8
    }
  }

  // ─── Capture overspent table if visible ──────────────────────────────
  if (visibleWidgetIds.includes('overspent-table')) {
    const tableImg = await captureElement('[data-widget="overspent-table"]', 2)
    if (tableImg) {
      const neededH = 80
      if (yPos + neededH > PAGE_H - 20) {
        doc.addPage()
        drawPageHeader(doc, doc.getCurrentPageInfo().pageNumber as number, options, viewLabel, monthLabel)
        yPos = 42
      }
      doc.addImage(tableImg, 'PNG', MARGIN, yPos, CONTENT_W, neededH)
      yPos += neededH + 8
    }
  }

  // ─── Capture yearly budget performance if visible ────────────────────
  if (visibleWidgetIds.includes('yearly-budget')) {
    const tableImg = await captureElement('[data-widget="yearly-budget"]', 2)
    if (tableImg) {
      const neededH = 85
      if (yPos + neededH > PAGE_H - 20) {
        doc.addPage()
        drawPageHeader(doc, doc.getCurrentPageInfo().pageNumber as number, options, viewLabel, monthLabel)
        yPos = 42
      }
      doc.addImage(tableImg, 'PNG', MARGIN, yPos, CONTENT_W, neededH)
      yPos += neededH + 8
    }
  }

  // ─── Capture monthly budget performance if visible ───────────────────
  if (visibleWidgetIds.includes('monthly-budget')) {
    const tableImg = await captureElement('[data-widget="monthly-budget"]', 2)
    if (tableImg) {
      const neededH = 85
      if (yPos + neededH > PAGE_H - 20) {
        doc.addPage()
        drawPageHeader(doc, doc.getCurrentPageInfo().pageNumber as number, options, viewLabel, monthLabel)
        yPos = 42
      }
      doc.addImage(tableImg, 'PNG', MARGIN, yPos, CONTENT_W, neededH)
      yPos += neededH + 8
    }
  }

  // ─── Capture costs analysis chart if visible ─────────────────────────
  if (visibleWidgetIds.includes('costs-analysis')) {
    const chartImg = await captureElement('[data-widget="costs-analysis"]', 2)
    if (chartImg) {
      const neededH = 80
      if (yPos + neededH > PAGE_H - 20) {
        doc.addPage()
        drawPageHeader(doc, doc.getCurrentPageInfo().pageNumber as number, options, viewLabel, monthLabel)
        yPos = 42
      }
      doc.addImage(chartImg, 'PNG', MARGIN, yPos, CONTENT_W, neededH)
      yPos += neededH + 8
    }
  }

  // ─── Capture cost by dept table if visible ───────────────────────────
  if (visibleWidgetIds.includes('cost-by-dept')) {
    const tableImg = await captureElement('[data-widget="cost-by-dept"]', 2)
    if (tableImg) {
      const neededH = 85
      if (yPos + neededH > PAGE_H - 20) {
        doc.addPage()
        drawPageHeader(doc, doc.getCurrentPageInfo().pageNumber as number, options, viewLabel, monthLabel)
        yPos = 42
      }
      doc.addImage(tableImg, 'PNG', MARGIN, yPos, CONTENT_W, neededH)
      yPos += neededH + 8
    }
  }

  // ─── Footer on all pages ─────────────────────────────────────────────
  const pageCount = (doc as any).internal.getNumberOfPages?.() ?? 1
  for (let p = 1; p <= pageCount; p++) {
    doc.setPage(p)
    doc.setFontSize(7)
    doc.setFont('helvetica', 'normal')
    doc.setTextColor('#6B7280')
    doc.text(
      `InfoFin Dashboard — FY ${options.year}  |  Generated: ${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}`,
      MARGIN,
      PAGE_H - 10,
    )
    doc.text(
      `Page ${p} of ${pageCount}`,
      PAGE_W - MARGIN,
      PAGE_H - 10,
      { align: 'right' },
    )
  }

  // ─── Generate & download ─────────────────────────────────────────────
  const pdfBlob = doc.output('blob')
  const filename = generateFilename('Dashboard', options.year, options.view, 'pdf')
  saveAs(pdfBlob, filename)
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function drawPageHeader(
  doc: jsPDF,
  pageNum: number,
  options: DashboardExportOptions,
  viewLabel: string,
  monthLabel: string,
) {
  // Brand bar
  doc.setFillColor('#0F3D66')
  doc.rect(MARGIN, MARGIN, PAGE_W - MARGIN * 2, 20, 'F')

  doc.setTextColor('#FFFFFF')
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(14)
  doc.text('INFOfIN', MARGIN + 5, MARGIN + 9)

  doc.setFontSize(8)
  doc.text('Dashboard Report', MARGIN + 5, MARGIN + 17)

  // Right metadata
  doc.setFontSize(7)
  doc.setFont('helvetica', 'normal')
  doc.text(`FY ${options.year}  |  ${viewLabel}  |  ${monthLabel}`, PAGE_W - MARGIN - 5, MARGIN + 9, { align: 'right' })
  doc.text(`Dept: ${options.departmentName || 'All Departments'}`, PAGE_W - MARGIN - 5, MARGIN + 15, { align: 'right' })

  // Divider line
  doc.setDrawColor('#D1D5DB')
  doc.setLineWidth(0.3)
  doc.line(MARGIN, MARGIN + 26, PAGE_W - MARGIN, MARGIN + 26)
}

/**
 * Capture a DOM element as a data URL image.
 * @param selector CSS selector for the element
 * @param scale Pixel ratio for capture quality (2 = retina)
 */
async function captureElement(
  selector: string,
  scale: number = 2,
): Promise<string | null> {
  try {
    const el = document.querySelector(selector) as HTMLElement | null
    if (!el) return null
    const canvas = await html2canvas(el, {
      scale,
      useCORS: true,
      backgroundColor: '#FFFFFF',
      logging: false,
    })
    return canvas.toDataURL('image/png')
  } catch {
    return null
  }
}
