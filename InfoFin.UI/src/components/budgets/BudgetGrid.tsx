'use client'

import React, { useEffect, useState } from 'react'
import { ChevronDown, Plus, Trash2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import {
  type Department,
  type BudgetLineItem,
  type SectionType,
  type ClassificationType,
  CLASSIFICATION_LABELS,
  getSectionTotals,
  sumItems,
  execPct,
  getDeptSummary,
  getItemTotal,
  getSectionTotal,
  getClassificationTotal,
  findItemByLabel,
  mergeAllItems,
} from '@/lib/budget-data'

// ─── Edit API ─────────────────────────────────────────────────────────────────

export type EditApi = {
  onValue: (deptId: string, itemId: string, field: 'forecast' | 'execution', value: number) => void
  onRename: (itemId: string, label: string) => void
  onDelete: (itemId: string) => void
  onAdd: (section: SectionType, classification: ClassificationType | null) => void
}

// ─── Formatting ───────────────────────────────────────────────────────────────

function fmt(n: number) {
  if (n === 0) return <span className="text-muted-foreground/40">—</span>
  const abs = Math.abs(n)
  const str =
    abs >= 1_000_000 ? `$${(abs / 1_000_000).toFixed(2)}M` : `$${abs.toLocaleString()}`
  return <span>{n < 0 ? `-${str}` : str}</span>
}

function Pct({ forecast, execution }: { forecast: number; execution: number }) {
  const p = execPct(forecast, execution)
  if (p === null) return <span className="text-muted-foreground/40">—</span>
  const cls =
    p > 120 ? 'text-destructive font-semibold' : p > 100 ? 'text-warning font-medium' : 'text-success'
  return <span className={cls}>{p}%</span>
}

// ─── Editable numeric cell ──────────────────────────────────────────────────────

function NumInput({
  value,
  onCommit,
}: {
  value: number
  onCommit: (n: number) => void
}) {
  const [raw, setRaw] = useState(value ? String(value) : '')

  useEffect(() => {
    setRaw(value ? String(value) : '')
  }, [value])

  return (
    <input
      type="number"
      inputMode="decimal"
      value={raw}
      onChange={(e) => {
        const v = e.target.value
        setRaw(v)
        onCommit(v === '' || v === '-' ? 0 : Number(v))
      }}
      onFocus={(e) => e.target.select()}
      className="w-full rounded border border-transparent bg-transparent px-1 py-0.5 text-right text-xs tabular-nums outline-none transition-colors focus:border-primary focus:bg-background hover:border-border"
      placeholder="0"
    />
  )
}

// ─── Cell classes ─────────────────────────────────────────────────────────────

const th =
  'border-b border-r border-border px-3 py-2 text-center text-[10px] font-semibold uppercase tracking-wide text-muted-foreground last:border-r-0'
const td =
  'border-b border-r border-border px-3 py-1.5 text-right text-xs tabular-nums last:border-r-0'
const tdEdit = 'border-b border-r border-border px-1 py-0.5 last:border-r-0'
const tdLabel =
  'border-b border-r border-border px-3 py-1.5 text-left text-xs sticky left-0 bg-card z-10'
const subtotalCls =
  'border-b border-r border-border px-3 py-1.5 text-right text-sm font-semibold tabular-nums bg-muted/40 last:border-r-0'
const subtotalLabelCls =
  'border-b border-r border-border px-3 py-1.5 text-left text-sm font-semibold bg-muted/40 sticky left-0 z-10'
const grandTotalCls =
  'border-b border-r border-border px-3 py-2 text-right text-xs font-bold tabular-nums bg-primary/8 text-primary last:border-r-0'
const grandTotalLabelCls =
  'border-b border-r border-border px-3 py-2 text-left text-xs font-bold bg-primary/8 text-primary uppercase sticky left-0 z-10'

// Department separator — thicker right border on last column of each dept group
const deptSep = 'border-r-2 border-r-white'
const deptSepHeader = 'border-r-2 border-r-white'

// ─── Item lookup by id within a department ──────────────────────────────────────
// Falls back to label-based matching for cross-department views where IDs differ
// (IDs are prefixed with deptId: "5-10" vs "7-10" for the same account).

function deptItem(
  dept: Department,
  sectionType: SectionType,
  cls: ClassificationType | null,
  id: string,
  label?: string,
): BudgetLineItem | undefined {
  const s = dept.sections.find((x) => x.type === sectionType)
  if (!s) return undefined
  const items = cls
    ? s.classifications?.find((c) => c.type === cls)?.items
    : s.items
  // Try exact ID match first, then label-based for cross-department
  return items?.find((i) => i.id === id) ?? (label ? items?.find((i) => i.label === label) : undefined)
}

// ─── Table header rows ────────────────────────────────────────────────────────

function DeptColHeaders({ departments }: { departments: Department[] }) {
  const lastIdx = departments.length - 1
  return (
    <tr className="bg-[#0f3d66]/90">
      <th
        className="sticky left-0 z-20 border-b border-r border-white/10 px-3 py-2.5 text-left text-[10px] font-semibold uppercase tracking-wide text-white/70 bg-[#0f3d66]"
        rowSpan={2}
      >
        Account
      </th>
      {departments.map((d, i) => (
        <th
          key={d.id}
          className={cn(
            'border-b border-r border-white/10 px-3 py-2.5 text-center text-xs font-semibold text-white last:border-r-0',
            i !== lastIdx && deptSepHeader,
          )}
          colSpan={3}
        >
          {d.name}
        </th>
      ))}
      {departments.length > 1 && (
      <th
        className="border-b border-r-0 border-white/10 px-3 py-2.5 text-center text-xs font-bold text-white bg-[#0a2f4d]"
        colSpan={3}
      >
        TOTAL
      </th>
      )}
    </tr>
  )
}

function DeptSubHeaders({ departments }: { departments: Department[] }) {
  const lastIdx = departments.length - 1
  return (
    <tr className="bg-[#125586]/80">
      {departments.map((d, i) => (
        <React.Fragment key={d.id}>
          <th key={`${d.id}-f`} className={cn(th, 'text-white/70 border-white/10')}>Forecast</th>
          <th key={`${d.id}-e`} className={cn(th, 'text-white/70 border-white/10')}>Execution</th>
          <th key={`${d.id}-p`} className={cn(th, 'w-14 text-white/70 border-white/10', i !== lastIdx && deptSepHeader)}>%</th>
        </React.Fragment>
      ))}
      {departments.length > 1 && (
      <>
      <th className={cn(th, 'text-white/80 border-white/10 bg-[#0a2f4d]')}>Forecast</th>
      <th className={cn(th, 'text-white/80 border-white/10 bg-[#0a2f4d]')}>Execution</th>
      <th className={cn(th, 'w-14 text-white/80 border-white/10 border-r-0 bg-[#0a2f4d]')}>%</th>
      </>
      )}
    </tr>
  )
}

// ─── Section / classification header rows ──────────────────────────────────────

function SectionHeaderRow({
  label,
  departments,
  open,
  onToggle,
}: {
  label: string
  departments: Department[]
  open: boolean
  onToggle: () => void
}) {
  const lastIdx = departments.length - 1

  return (
    <tr>
      <td
        className="sticky left-0 z-10 cursor-pointer select-none border-b border-r border-border bg-secondary px-3 py-1.5"
        onClick={onToggle}
      >
        <div className="flex items-center gap-2">
          <ChevronDown
            className={cn('size-3.5 text-secondary-foreground/60 transition-transform duration-200', !open && '-rotate-90')}
          />
          <span className="text-xs font-bold uppercase tracking-wide text-secondary-foreground">{label}</span>
        </div>
      </td>
      {departments.map((dept, i) => (
        <td
          key={dept.id}
          colSpan={3}
          className={cn(
            'border-b border-r border-border bg-secondary',
            i !== lastIdx && deptSep,
          )}
          onClick={onToggle}
        />
      ))}
      <td
        colSpan={3}
        className="border-b border-r-0 border-border bg-secondary"
        onClick={onToggle}
      />
    </tr>
  )
}

function ClassHeaderRow({
  label,
  departments,
  open,
  onToggle,
}: {
  label: string
  departments: Department[]
  open: boolean
  onToggle: () => void
}) {
  const lastIdx = departments.length - 1

  return (
    <tr>
      <td
        className="sticky left-0 z-10 cursor-pointer select-none border-b border-r border-border bg-accent px-3 py-1"
        onClick={onToggle}
      >
        <div className="flex items-center gap-2 pl-3">
          <ChevronDown
            className={cn('size-3 text-accent-foreground/50 transition-transform duration-200', !open && '-rotate-90')}
          />
          <span className="text-[11px] font-semibold uppercase tracking-wide text-accent-foreground">{label}</span>
        </div>
      </td>
      {departments.map((dept, i) => (
        <td
          key={dept.id}
          colSpan={3}
          className={cn(
            'border-b border-r border-border bg-accent',
            i !== lastIdx && deptSep,
          )}
          onClick={onToggle}
        />
      ))}
      <td
        colSpan={3}
        className="border-b border-r-0 border-border bg-accent"
        onClick={onToggle}
      />
    </tr>
  )
}

// ─── Editable label cell ────────────────────────────────────────────────────────

function LabelCell({
  item,
  indentClass,
  edit,
}: {
  item: BudgetLineItem
  indentClass: string
  edit?: EditApi
}) {
  if (!edit) return <td className={cn(tdLabel, indentClass)}>{item.label}</td>
  return (
    <td className={cn(tdLabel, 'py-1', indentClass)}>
      <div className="flex items-center gap-1">
        <input
          value={item.label}
          onChange={(e) => edit.onRename(item.id, e.target.value)}
          className="min-w-0 flex-1 rounded border border-transparent bg-transparent px-1 py-0.5 text-xs outline-none transition-colors focus:border-primary focus:bg-background hover:border-border"
        />
        <button
          type="button"
          onClick={() => edit.onDelete(item.id)}
          aria-label={`Delete ${item.label}`}
          className="shrink-0 rounded p-1 text-muted-foreground/60 transition-colors hover:bg-destructive/10 hover:text-destructive"
        >
          <Trash2 className="size-3.5" />
        </button>
      </div>
    </td>
  )
}

// ─── Add-line row ───────────────────────────────────────────────────────────────

function AddLineRow({
  colSpan,
  indentClass,
  onAdd,
}: {
  colSpan: number
  indentClass: string
  onAdd: () => void
}) {
  return (
    <tr>
      <td colSpan={colSpan} className="border-b border-border bg-card px-3 py-1">
        <button
          type="button"
          onClick={onAdd}
          className={cn(
            'inline-flex items-center gap-1.5 rounded px-1.5 py-0.5 text-[11px] font-medium text-primary transition-colors hover:bg-primary/10',
            indentClass,
          )}
        >
          <Plus className="size-3.5" />
          Add line item
        </button>
      </td>
    </tr>
  )
}

// ─── Value cells for one department / item ──────────────────────────────────────

function ValueCells({
  dept,
  item,
  edit,
  isLastDept,
}: {
  dept: Department
  item: BudgetLineItem | undefined
  edit?: EditApi
  isLastDept?: boolean
}) {
  const f = item?.forecast ?? 0
  const e = item?.execution ?? 0
  if (edit && item) {
    return (
      <>
        <td key={`${dept.id}-f`} className={tdEdit}>
          <NumInput value={f} onCommit={(n) => edit.onValue(dept.id, item.id, 'forecast', n)} />
        </td>
        <td key={`${dept.id}-e`} className={cn(td, 'text-muted-foreground/60')}>{fmt(e)}</td>
        <td key={`${dept.id}-p`} className={cn(td, !isLastDept && deptSep)}><Pct forecast={f} execution={e} /></td>
      </>
    )
  }
  return (
    <>
      <td key={`${dept.id}-f`} className={td}>{fmt(f)}</td>
      <td key={`${dept.id}-e`} className={td}>{fmt(e)}</td>
      <td key={`${dept.id}-p`} className={cn(td, !isLastDept && deptSep)}><Pct forecast={f} execution={e} /></td>
    </>
  )
}

// ─── Total cells (non-editable, sums across all departments) ───────────────────

function TotalCells({
  forecast,
  execution,
}: {
  forecast: number
  execution: number
}) {
  return (
    <>
      <td className={cn(td, 'font-semibold bg-muted/10')}>{fmt(forecast)}</td>
      <td className={cn(td, 'font-semibold bg-muted/10')}>{fmt(execution)}</td>
      <td className={cn(td, 'font-semibold bg-muted/10 border-r-0')}><Pct forecast={forecast} execution={execution} /></td>
    </>
  )
}

// ─── Flat section (REVENUES / COS) ───────────────────────────────────────────

function FlatSection({
  label,
  departments,
  sectionType,
  edit,
}: {
  label: string
  departments: Department[]
  sectionType: 'REVENUES' | 'COS'
  edit?: EditApi
}) {
  const [open, setOpen] = useState(sectionType === 'REVENUES')
  const hasTotal = departments.length > 1
  const colSpan = 1 + departments.length * 3 + (hasTotal ? 3 : 0)
  // Merge all departments' items so every account appears as a row in aggregated views
  const refItems = mergeAllItems(departments, sectionType, null)
  const lastIdx = departments.length - 1

  return (
    <>
      <SectionHeaderRow label={label} departments={departments} open={open} onToggle={() => setOpen((v) => !v)} />
      {open &&
        refItems.map((refItem) => (
          <tr key={refItem.label} className="hover:bg-muted/30 transition-colors">
            <LabelCell item={refItem} indentClass="pl-6" edit={edit} />
            {departments.map((dept, i) => (
              <ValueCells key={dept.id} dept={dept} item={deptItem(dept, sectionType, null, refItem.id, refItem.label)} edit={edit} isLastDept={i === lastIdx} />
            ))}
            {hasTotal && <TotalCells {...getItemTotal(departments, sectionType, null, refItem.id, refItem.label)} />}
          </tr>
        ))}
      {open && edit && (
        <AddLineRow colSpan={colSpan} indentClass="ml-3" onAdd={() => edit.onAdd(sectionType, null)} />
      )}
      <tr className="bg-muted/20">
        <td className={subtotalLabelCls}>Total {label}</td>
        {departments.map((dept, i) => {
          const s = dept.sections.find((x) => x.type === sectionType)
          const tot = s ? sumItems(s.items ?? []) : { forecast: 0, execution: 0 }
          return (
            <React.Fragment key={dept.id}>
              <td key={`${dept.id}-f`} className={subtotalCls}>{fmt(tot.forecast)}</td>
              <td key={`${dept.id}-e`} className={subtotalCls}>{fmt(tot.execution)}</td>
              <td key={`${dept.id}-p`} className={cn(subtotalCls, i !== lastIdx && deptSep)}><Pct forecast={tot.forecast} execution={tot.execution} /></td>
            </React.Fragment>
          )
        })}
        {hasTotal && <TotalCells {...getSectionTotal(departments, sectionType)} />}
      </tr>
    </>
  )
}

// ─── Classified section (FIXED_COSTS / VARIABLE_COSTS) ───────────────────────

function ClassifiedSection({
  label,
  departments,
  sectionType,
  edit,
}: {
  label: string
  departments: Department[]
  sectionType: 'FIXED_COSTS' | 'VARIABLE_COSTS'
  edit?: EditApi
}) {
  const [sectionOpen, setSectionOpen] = useState(false)
  const [classOpen, setClassOpen] = useState<Record<string, boolean>>({
    ADMIN_FIN: false,
    TECH_OPS: false,
    MKT_SALES: false,
  })

  const hasTotal = departments.length > 1
  const colSpan = 1 + departments.length * 3 + (hasTotal ? 3 : 0)
  const getSection = (dept: Department) => dept.sections.find((s) => s.type === sectionType)
  const classifications: ClassificationType[] = ['ADMIN_FIN', 'TECH_OPS', 'MKT_SALES']
  const lastIdx = departments.length - 1

  return (
    <>
      <SectionHeaderRow label={label} departments={departments} open={sectionOpen} onToggle={() => setSectionOpen((v) => !v)} />
      {sectionOpen &&
        classifications.map((cls) => {
          // Merge all departments' items for this classification so every
          // account appears in aggregated views
          const refItems = mergeAllItems(departments, sectionType, cls)
          const isClsOpen = classOpen[cls]

          return (
            <React.Fragment key={cls}>
              <ClassHeaderRow
                label={CLASSIFICATION_LABELS[cls]}
                departments={departments}
                open={isClsOpen}
                onToggle={() => setClassOpen((p) => ({ ...p, [cls]: !p[cls] }))}
              />
              {isClsOpen &&
                refItems.map((refItem) => (
                  <tr key={refItem.label} className="hover:bg-muted/30 transition-colors">
                    <LabelCell item={refItem} indentClass="pl-8" edit={edit} />
                    {departments.map((dept, i) => (
                      <ValueCells key={dept.id} dept={dept} item={deptItem(dept, sectionType, cls, refItem.id, refItem.label)} edit={edit} isLastDept={i === lastIdx} />
                    ))}
                    {hasTotal && <TotalCells {...getItemTotal(departments, sectionType, cls, refItem.id, refItem.label)} />}
                  </tr>
                ))}
              {isClsOpen && edit && (
                <AddLineRow colSpan={colSpan} indentClass="ml-5" onAdd={() => edit.onAdd(sectionType, cls)} />
              )}
              <tr className="bg-muted/10">
                <td className={cn(subtotalLabelCls, 'pl-6')}>{CLASSIFICATION_LABELS[cls]} Total</td>
                {departments.map((dept, i) => {
                  const items = getSection(dept)?.classifications?.find((c) => c.type === cls)?.items ?? []
                  const tot = sumItems(items)
                  return (
                    <React.Fragment key={dept.id}>
                      <td key={`${dept.id}-f`} className={subtotalCls}>{fmt(tot.forecast)}</td>
                      <td key={`${dept.id}-e`} className={subtotalCls}>{fmt(tot.execution)}</td>
                      <td key={`${dept.id}-p`} className={cn(subtotalCls, i !== lastIdx && deptSep)}><Pct forecast={tot.forecast} execution={tot.execution} /></td>
                    </React.Fragment>
                  )
                })}
                {hasTotal && <TotalCells {...getClassificationTotal(departments, sectionType, cls)} />}
              </tr>
            </React.Fragment>
          )
        })}
      <tr>
        <td className={grandTotalLabelCls}>Total {label}</td>
        {departments.map((dept, i) => {
          const s = getSection(dept)
          const tot = s ? getSectionTotals(s) : { forecast: 0, execution: 0 }
          return (
            <React.Fragment key={dept.id}>
              <td key={`${dept.id}-f`} className={grandTotalCls}>{fmt(tot.forecast)}</td>
              <td key={`${dept.id}-e`} className={grandTotalCls}>{fmt(tot.execution)}</td>
              <td key={`${dept.id}-p`} className={cn(grandTotalCls, i !== lastIdx && deptSep)}><Pct forecast={tot.forecast} execution={tot.execution} /></td>
            </React.Fragment>
          )
        })}
        {hasTotal && <TotalCells {...getSectionTotal(departments, sectionType)} />}
      </tr>
    </>
  )
}

// ─── Summary / bottom-line row ────────────────────────────────────────────────

function SummaryRow({
  label,
  departments,
  getValue,
  highlight = false,
}: {
  label: string
  departments: Department[]
  getValue: (dept: Department) => { forecast: number; execution: number }
  highlight?: boolean
}) {
  const lastIdx = departments.length - 1
  const rowCls = highlight
    ? 'border-b border-r border-border px-3 py-2 text-right text-xs font-bold tabular-nums bg-primary text-primary-foreground last:border-r-0'
    : grandTotalCls
  const lCls = highlight
    ? 'border-b border-r border-border px-3 py-2 text-left text-xs font-bold uppercase tracking-wide bg-primary text-primary-foreground sticky left-0 z-10'
    : grandTotalLabelCls

  // Compute grand total across all departments
  const total = departments.reduce(
    (acc, dept) => {
      const v = getValue(dept)
      return { forecast: acc.forecast + v.forecast, execution: acc.execution + v.execution }
    },
    { forecast: 0, execution: 0 },
  )

  return (
    <tr>
      <td className={lCls}>{label}</td>
      {departments.map((dept, i) => {
        const { forecast, execution } = getValue(dept)
        return (
          <React.Fragment key={dept.id}>
            <td key={`${dept.id}-f`} className={rowCls}>{fmt(forecast)}</td>
            <td key={`${dept.id}-e`} className={rowCls}>{fmt(execution)}</td>
            <td key={`${dept.id}-p`} className={cn(rowCls, i !== lastIdx && deptSep)}><Pct forecast={forecast} execution={execution} /></td>
          </React.Fragment>
        )
      })}
      {departments.length > 1 && <TotalCells {...total} />}
    </tr>
  )
}

// ─── BU P&L Grid ─────────────────────────────────────────────────────────────

export function BUGrid({ departments, edit }: { departments: Department[]; edit?: EditApi }) {
  const summaries = departments.map((d) => getDeptSummary(d, 'BU'))

  return (
    <div className="overflow-x-auto rounded-xl border border-border shadow-sm">
      <table className="min-w-full border-collapse text-xs">
        <thead>
          <DeptColHeaders departments={departments} />
          <DeptSubHeaders departments={departments} />
        </thead>
        <tbody>
          <FlatSection label="Revenues" departments={departments} sectionType="REVENUES" edit={edit} />
          <FlatSection label="Cost of Sales" departments={departments} sectionType="COS" edit={edit} />
          <SummaryRow
            label="Gross Margin"
            departments={departments}
            getValue={(d) => summaries[departments.indexOf(d)].grossMargin}
          />
          <ClassifiedSection label="Fixed Costs" departments={departments} sectionType="FIXED_COSTS" edit={edit} />
          <ClassifiedSection label="Variable Costs" departments={departments} sectionType="VARIABLE_COSTS" edit={edit} />
          <SummaryRow
            label="Total OPEX"
            departments={departments}
            getValue={(d) => summaries[departments.indexOf(d)].opex}
          />
          <SummaryRow
            label="EBIT"
            departments={departments}
            getValue={(d) => summaries[departments.indexOf(d)].ebit}
            highlight
          />
        </tbody>
      </table>
    </div>
  )
}

// ─── SU OPEX Grid ─────────────────────────────────────────────────────────────

export function SUGrid({ departments, edit }: { departments: Department[]; edit?: EditApi }) {
  const summaries = departments.map((d) => getDeptSummary(d, 'SU'))

  return (
    <div className="overflow-x-auto rounded-xl border border-border shadow-sm">
      <table className="min-w-full border-collapse text-xs">
        <thead>
          <DeptColHeaders departments={departments} />
          <DeptSubHeaders departments={departments} />
        </thead>
        <tbody>
          <ClassifiedSection label="Fixed Costs" departments={departments} sectionType="FIXED_COSTS" edit={edit} />
          <ClassifiedSection label="Variable Costs" departments={departments} sectionType="VARIABLE_COSTS" edit={edit} />
          <SummaryRow
            label="Total OPEX"
            departments={departments}
            getValue={(d) => summaries[departments.indexOf(d)].opex}
            highlight
          />
        </tbody>
      </table>
    </div>
  )
}
