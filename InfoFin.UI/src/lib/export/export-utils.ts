// ─────────────────────────────────────────────────────────────────────────────
// INFOFIN Export Utilities
// Shared formatting, constants, and helpers for Excel & PDF exports
// ─────────────────────────────────────────────────────────────────────────────

import type { SectionType, ClassificationType, Department } from '@/lib/budget-data'
import { getDeptSummary, getSectionTotals, sumItems, execPct } from '@/lib/budget-data'

// ─── Formatting ─────────────────────────────────────────────────────────────

/** Format number as currency string: $1,234,567 or $1.23M for large values */
export function fmtCurrency(n: number): string {
  if (n === 0) return '$0'
  const abs = Math.abs(n)
  const sign = n < 0 ? '-' : ''
  if (abs >= 1_000_000) return `${sign}$${(abs / 1_000_000).toFixed(2)}M`
  return `${sign}$${abs.toLocaleString('en-US')}`
}

/** Format execution %: "85%" or "—" if forecast is 0 */
export function fmtPct(forecast: number, execution: number): string {
  const p = execPct(forecast, execution)
  return p !== null ? `${p}%` : '—'
}

/** Format a decimal number for Excel cells (raw number, not string) */
export function fmtExcelNum(n: number): number {
  return Math.round(n * 100) / 100
}

// ─── Filename ───────────────────────────────────────────────────────────────

export function generateFilename(
  feature: string,
  year: number,
  buSu: string,
  ext: 'xlsx' | 'pdf',
): string {
  const date = new Date().toISOString().slice(0, 10) // YYYY-MM-DD
  const bucket = buSu === 'all' ? 'All' : buSu.toUpperCase()
  return `InfoFin_${feature}_FY${year}_${bucket}_${date}.${ext}`
}

// ─── Section / Classification labels ────────────────────────────────────────

export const SECTION_LABELS: Record<SectionType, string> = {
  REVENUES: 'REVENUES',
  COS: 'COST OF SALES',
  FIXED_COSTS: 'FIXED COSTS',
  VARIABLE_COSTS: 'VARIABLE COSTS',
}

export const CLASSIFICATION_LABELS_X: Record<ClassificationType, string> = {
  ADMIN_FIN: 'Admin & Finances',
  TECH_OPS: 'Technical & Operations',
  MKT_SALES: 'Marketing & Sales',
}

// ─── KPI summary for export header ──────────────────────────────────────────

export function computeBudgetKPIs(departments: Department[]) {
  let revF = 0, revE = 0, cosF = 0, cosE = 0
  let fixF = 0, fixE = 0, varF = 0, varE = 0

  for (const dept of departments) {
    const s = getDeptSummary(dept, 'BU')
    revF += s.rev.forecast
    revE += s.rev.execution
    cosF += s.cos.forecast
    cosE += s.cos.execution
    fixF += s.fixed.forecast
    fixE += s.fixed.execution
    varF += s.variable.forecast
    varE += s.variable.execution
  }

  const opexF = fixF + varF
  const opexE = fixE + varE
  const gmF = revF - cosF
  const gmE = revE - cosE
  const ebitF = gmF - opexF
  const ebitE = gmE - opexE

  return { revF, revE, cosF, cosE, fixF, fixE, varF, varE, opexF, opexE, gmF, gmE, ebitF, ebitE }
}

// ─── Colors / style constants ───────────────────────────────────────────────

export const COLORS = {
  primaryDark: '0F3D66',       // Dark navy for headers
  primaryMed: '125586',        // Medium blue for sub-headers
  sectionBg: 'DBEAFE',         // Light blue for section headers (Excel)
  classificationBg: 'F0FDF4',  // Light green for classification headers
  subtotalBg: 'F3F4F6',        // Light gray for subtotals
  summaryBg: 'EFF6FF',         // Very light blue for Gross Margin / OPEX
  ebitBg: '1E40AF',            // Dark blue for EBIT row
  white: 'FFFFFF',
  black: '111827',
  gray: '6B7280',
  green: '059669',
  red: 'DC2626',
  border: 'D1D5DB',
}

// ─── Compute merged item list for a section across all departments ──────────

export interface FlatExportRow {
  label: string
  indent: number            // 0 = section header, 1 = classification, 2 = item, -1 = summary
  isSectionHeader: boolean
  isSubtotal: boolean
  isSummary: boolean        // Gross Margin, OPEX, EBIT
  isClassification: boolean
  isHighlight: boolean      // EBIT
  sectionType?: SectionType
  values: { forecast: number; execution: number }[]  // one per department
  totalForecast: number
  totalExecution: number
}

export function buildExportRows(departments: Department[]): FlatExportRow[] {
  const rows: FlatExportRow[] = []
  const sectionOrder: SectionType[] = ['REVENUES', 'COS', 'FIXED_COSTS', 'VARIABLE_COSTS']
  const classifications: ClassificationType[] = ['ADMIN_FIN', 'TECH_OPS', 'MKT_SALES']

  for (const sectionType of sectionOrder) {
    // Section header
    rows.push({
      label: SECTION_LABELS[sectionType],
      indent: 0,
      isSectionHeader: true,
      isSubtotal: false,
      isSummary: false,
      isClassification: false,
      isHighlight: false,
      sectionType,
      values: [],
      totalForecast: 0,
      totalExecution: 0,
    })

    if (sectionType === 'REVENUES' || sectionType === 'COS') {
      // Flat sections — collect all unique item labels across departments
      const seen = new Set<string>()
      for (const dept of departments) {
        const s = dept.sections.find(x => x.type === sectionType)
        for (const item of s?.items ?? []) {
          if (!seen.has(item.label)) {
            seen.add(item.label)
            const values = departments.map(d => {
              const si = d.sections.find(x => x.type === sectionType)
              const it = si?.items?.find(i => i.label === item.label)
              return { forecast: it?.forecast ?? 0, execution: it?.execution ?? 0 }
            })
            rows.push({
              label: item.label,
              indent: 2,
              isSectionHeader: false,
              isSubtotal: false,
              isSummary: false,
              isClassification: false,
              isHighlight: false,
              sectionType,
              values,
              totalForecast: values.reduce((a, v) => a + v.forecast, 0),
              totalExecution: values.reduce((a, v) => a + v.execution, 0),
            })
          }
        }
      }
      // Section subtotal
      const subVals = departments.map(d => {
        const s = d.sections.find(x => x.type === sectionType)
        const t = s ? getSectionTotals(s) : { forecast: 0, execution: 0 }
        return t
      })
      rows.push({
        label: `Total ${SECTION_LABELS[sectionType]}`,
        indent: 0,
        isSectionHeader: false,
        isSubtotal: true,
        isSummary: false,
        isClassification: false,
        isHighlight: false,
        sectionType,
        values: subVals,
        totalForecast: subVals.reduce((a, v) => a + v.forecast, 0),
        totalExecution: subVals.reduce((a, v) => a + v.execution, 0),
      })
    } else {
      // Classified sections (FIXED_COSTS, VARIABLE_COSTS)
      for (const cls of classifications) {
        const seen = new Set<string>()
        // Check if any department has items in this classification
        let hasItems = false
        for (const dept of departments) {
          const s = dept.sections.find(x => x.type === sectionType)
          const items = s?.classifications?.find(c => c.type === cls)?.items ?? []
          if (items.length > 0) hasItems = true
        }
        if (!hasItems) continue

        // Classification header
        rows.push({
          label: CLASSIFICATION_LABELS_X[cls],
          indent: 1,
          isSectionHeader: false,
          isSubtotal: false,
          isSummary: false,
          isClassification: true,
          isHighlight: false,
          sectionType,
          values: [],
          totalForecast: 0,
          totalExecution: 0,
        })

        for (const dept of departments) {
          const s = dept.sections.find(x => x.type === sectionType)
          for (const item of s?.classifications?.find(c => c.type === cls)?.items ?? []) {
            if (!seen.has(item.label)) {
              seen.add(item.label)
              const values = departments.map(d => {
                const si = d.sections.find(x => x.type === sectionType)
                const it = si?.classifications?.find(c => c.type === cls)?.items?.find(i => i.label === item.label)
                return { forecast: it?.forecast ?? 0, execution: it?.execution ?? 0 }
              })
              rows.push({
                label: item.label,
                indent: 2,
                isSectionHeader: false,
                isSubtotal: false,
                isSummary: false,
                isClassification: false,
                isHighlight: false,
                sectionType,
                values,
                totalForecast: values.reduce((a, v) => a + v.forecast, 0),
                totalExecution: values.reduce((a, v) => a + v.execution, 0),
              })
            }
          }
        }
      }
      // Section total
      const subVals = departments.map(d => {
        const s = d.sections.find(x => x.type === sectionType)
        const t = s ? getSectionTotals(s) : { forecast: 0, execution: 0 }
        return t
      })
      rows.push({
        label: `Total ${SECTION_LABELS[sectionType]}`,
        indent: 0,
        isSectionHeader: false,
        isSubtotal: true,
        isSummary: false,
        isClassification: false,
        isHighlight: false,
        sectionType,
        values: subVals,
        totalForecast: subVals.reduce((a, v) => a + v.forecast, 0),
        totalExecution: subVals.reduce((a, v) => a + v.execution, 0),
      })
    }
  }

  // ─── Summary rows ──────────────────────────────────────────────────
  const kpis = computeBudgetKPIs(departments)
  const deptSummaries = departments.map(d => getDeptSummary(d, departments.length > 0 ? 'BU' : 'BU'))

  // Gross Margin
  rows.push({
    label: 'GROSS MARGIN',
    indent: 0,
    isSectionHeader: false,
    isSubtotal: false,
    isSummary: true,
    isClassification: false,
    isHighlight: false,
    values: deptSummaries.map(s => s.grossMargin),
    totalForecast: kpis.gmF,
    totalExecution: kpis.gmE,
  })

  // Total OPEX
  rows.push({
    label: 'TOTAL OPEX',
    indent: 0,
    isSectionHeader: false,
    isSubtotal: false,
    isSummary: true,
    isClassification: false,
    isHighlight: false,
    values: deptSummaries.map(s => s.opex),
    totalForecast: kpis.opexF,
    totalExecution: kpis.opexE,
  })

  // EBIT
  rows.push({
    label: 'EBIT',
    indent: 0,
    isSectionHeader: false,
    isSubtotal: false,
    isSummary: true,
    isClassification: false,
    isHighlight: true,
    values: deptSummaries.map(s => s.ebit),
    totalForecast: kpis.ebitF,
    totalExecution: kpis.ebitE,
  })

  return rows
}
