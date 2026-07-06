'use client'

import { useEffect, useState } from 'react'
import { ChevronDown, Plus, Trash2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import {
  type Department,
  type BudgetSection,
  type BudgetLineItem,
  type SectionType,
  type ClassificationType,
  CLASSIFICATION_LABELS,
  getSectionTotals,
  sumItems,
  execPct,
  getDeptSummary,
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
  'border-b border-r border-border px-3 py-1.5 text-right text-xs font-semibold tabular-nums bg-muted/40 last:border-r-0'
const subtotalLabelCls =
  'border-b border-r border-border px-3 py-1.5 text-left text-xs font-semibold bg-muted/40 sticky left-0 z-10'
const grandTotalCls =
  'border-b border-r border-border px-3 py-2 text-right text-xs font-bold tabular-nums bg-primary/8 text-primary last:border-r-0'
const grandTotalLabelCls =
  'border-b border-r border-border px-3 py-2 text-left text-xs font-bold bg-primary/8 text-primary uppercase sticky left-0 z-10'

// ─── Item lookup by id within a department ──────────────────────────────────────

function deptItem(
  dept: Department,
  sectionType: SectionType,
  cls: ClassificationType | null,
  id: string,
): BudgetLineItem | undefined {
  const s = dept.sections.find((x) => x.type === sectionType)
  if (!s) return undefined
  if (cls) return s.classifications?.find((c) => c.type === cls)?.items.find((i) => i.id === id)
  return s.items?.find((i) => i.id === id)
}

// ─── Table header rows ────────────────────────────────────────────────────────

function DeptColHeaders({ departments }: { departments: Department[] }) {
  return (
    <tr className="bg-[#0f3d66]/90">
      <th
        className="sticky left-0 z-20 border-b border-r border-white/10 px-3 py-2.5 text-left text-[10px] font-semibold uppercase tracking-wide text-white/70 bg-[#0f3d66]"
        rowSpan={2}
      >
        Category
      </th>
      {departments.map((d) => (
        <th
          key={d.id}
          className="border-b border-r border-white/10 px-3 py-2.5 text-center text-xs font-semibold text-white last:border-r-0"
          colSpan={3}
        >
          {d.name}
        </th>
      ))}
    </tr>
  )
}

function DeptSubHeaders({ departments }: { departments: Department[] }) {
  return (
    <tr className="bg-[#125586]/80">
      {departments.map((d) => (
        <>
          <th key={`${d.id}-f`} className={cn(th, 'text-white/70 border-white/10')}>Forecast</th>
          <th key={`${d.id}-e`} className={cn(th, 'text-white/70 border-white/10')}>Execution</th>
          <th key={`${d.id}-p`} className={cn(th, 'w-14 text-white/70 border-white/10')}>%</th>
        </>
      ))}
    </tr>
  )
}

// ─── Section / classification header rows ──────────────────────────────────────

function SectionHeaderRow({
  label,
  colSpan,
  open,
  onToggle,
}: {
  label: string
  colSpan: number
  open: boolean
  onToggle: () => void
}) {
  return (
    <tr>
      <td
        colSpan={colSpan}
        className="sticky left-0 z-10 cursor-pointer select-none border-b border-border bg-secondary px-3 py-1.5"
        onClick={onToggle}
      >
        <div className="flex items-center gap-2">
          <ChevronDown
            className={cn('size-3.5 text-secondary-foreground/60 transition-transform duration-200', !open && '-rotate-90')}
          />
          <span className="text-xs font-bold uppercase tracking-wide text-secondary-foreground">{label}</span>
        </div>
      </td>
    </tr>
  )
}

function ClassHeaderRow({
  label,
  colSpan,
  open,
  onToggle,
}: {
  label: string
  colSpan: number
  open: boolean
  onToggle: () => void
}) {
  return (
    <tr>
      <td
        colSpan={colSpan}
        className="sticky left-0 z-10 cursor-pointer select-none border-b border-border bg-accent px-3 py-1"
        onClick={onToggle}
      >
        <div className="flex items-center gap-2 pl-3">
          <ChevronDown
            className={cn('size-3 text-accent-foreground/50 transition-transform duration-200', !open && '-rotate-90')}
          />
          <span className="text-[11px] font-semibold uppercase tracking-wide text-accent-foreground">{label}</span>
        </div>
      </td>
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
}: {
  dept: Department
  item: BudgetLineItem | undefined
  edit?: EditApi
}) {
  const f = item?.forecast ?? 0
  const e = item?.execution ?? 0
  if (edit && item) {
    return (
      <>
        <td key={`${dept.id}-f`} className={tdEdit}>
          <NumInput value={f} onCommit={(n) => edit.onValue(dept.id, item.id, 'forecast', n)} />
        </td>
        <td key={`${dept.id}-e`} className={tdEdit}>
          <NumInput value={e} onCommit={(n) => edit.onValue(dept.id, item.id, 'execution', n)} />
        </td>
        <td key={`${dept.id}-p`} className={td}><Pct forecast={f} execution={e} /></td>
      </>
    )
  }
  return (
    <>
      <td key={`${dept.id}-f`} className={td}>{fmt(f)}</td>
      <td key={`${dept.id}-e`} className={td}>{fmt(e)}</td>
      <td key={`${dept.id}-p`} className={td}><Pct forecast={f} execution={e} /></td>
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
  const [open, setOpen] = useState(true)
  const colSpan = 1 + departments.length * 3
  const refItems = departments[0]?.sections.find((s) => s.type === sectionType)?.items ?? []

  return (
    <>
      <SectionHeaderRow label={label} colSpan={colSpan} open={open} onToggle={() => setOpen((v) => !v)} />
      {open &&
        refItems.map((refItem) => (
          <tr key={refItem.id} className="hover:bg-muted/30 transition-colors">
            <LabelCell item={refItem} indentClass="pl-6" edit={edit} />
            {departments.map((dept) => (
              <ValueCells key={dept.id} dept={dept} item={deptItem(dept, sectionType, null, refItem.id)} edit={edit} />
            ))}
          </tr>
        ))}
      {open && edit && (
        <AddLineRow colSpan={colSpan} indentClass="ml-3" onAdd={() => edit.onAdd(sectionType, null)} />
      )}
      <tr className="bg-muted/20">
        <td className={cn(subtotalLabelCls, 'text-[11px]')}>Total {label}</td>
        {departments.map((dept) => {
          const s = dept.sections.find((x) => x.type === sectionType)
          const tot = s ? sumItems(s.items ?? []) : { forecast: 0, execution: 0 }
          return (
            <>
              <td key={`${dept.id}-f`} className={subtotalCls}>{fmt(tot.forecast)}</td>
              <td key={`${dept.id}-e`} className={subtotalCls}>{fmt(tot.execution)}</td>
              <td key={`${dept.id}-p`} className={subtotalCls}><Pct forecast={tot.forecast} execution={tot.execution} /></td>
            </>
          )
        })}
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
  const [sectionOpen, setSectionOpen] = useState(true)
  const [classOpen, setClassOpen] = useState<Record<string, boolean>>({
    ADMIN_FIN: true,
    TECH_OPS: true,
    MKT_SALES: true,
  })

  const colSpan = 1 + departments.length * 3
  const getSection = (dept: Department) => dept.sections.find((s) => s.type === sectionType)
  const classifications: ClassificationType[] = ['ADMIN_FIN', 'TECH_OPS', 'MKT_SALES']

  return (
    <>
      <SectionHeaderRow label={label} colSpan={colSpan} open={sectionOpen} onToggle={() => setSectionOpen((v) => !v)} />
      {sectionOpen &&
        classifications.map((cls) => {
          const refItems =
            getSection(departments[0])?.classifications?.find((c) => c.type === cls)?.items ?? []
          const isClsOpen = classOpen[cls]

          return (
            <>
              <ClassHeaderRow
                key={`hdr-${cls}`}
                label={CLASSIFICATION_LABELS[cls]}
                colSpan={colSpan}
                open={isClsOpen}
                onToggle={() => setClassOpen((p) => ({ ...p, [cls]: !p[cls] }))}
              />
              {isClsOpen &&
                refItems.map((refItem) => (
                  <tr key={refItem.id} className="hover:bg-muted/30 transition-colors">
                    <LabelCell item={refItem} indentClass="pl-8" edit={edit} />
                    {departments.map((dept) => (
                      <ValueCells key={dept.id} dept={dept} item={deptItem(dept, sectionType, cls, refItem.id)} edit={edit} />
                    ))}
                  </tr>
                ))}
              {isClsOpen && edit && (
                <AddLineRow colSpan={colSpan} indentClass="ml-5" onAdd={() => edit.onAdd(sectionType, cls)} />
              )}
              <tr key={`tot-${cls}`} className="bg-muted/10">
                <td className={cn(subtotalLabelCls, 'pl-6 text-[11px]')}>{CLASSIFICATION_LABELS[cls]} Total</td>
                {departments.map((dept) => {
                  const items = getSection(dept)?.classifications?.find((c) => c.type === cls)?.items ?? []
                  const tot = sumItems(items)
                  return (
                    <>
                      <td key={`${dept.id}-f`} className={subtotalCls}>{fmt(tot.forecast)}</td>
                      <td key={`${dept.id}-e`} className={subtotalCls}>{fmt(tot.execution)}</td>
                      <td key={`${dept.id}-p`} className={subtotalCls}><Pct forecast={tot.forecast} execution={tot.execution} /></td>
                    </>
                  )
                })}
              </tr>
            </>
          )
        })}
      <tr>
        <td className={grandTotalLabelCls}>Total {label}</td>
        {departments.map((dept) => {
          const s = getSection(dept)
          const tot = s ? getSectionTotals(s) : { forecast: 0, execution: 0 }
          return (
            <>
              <td key={`${dept.id}-f`} className={grandTotalCls}>{fmt(tot.forecast)}</td>
              <td key={`${dept.id}-e`} className={grandTotalCls}>{fmt(tot.execution)}</td>
              <td key={`${dept.id}-p`} className={grandTotalCls}><Pct forecast={tot.forecast} execution={tot.execution} /></td>
            </>
          )
        })}
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
  const rowCls = highlight
    ? 'border-b border-r border-border px-3 py-2 text-right text-xs font-bold tabular-nums bg-primary text-primary-foreground last:border-r-0'
    : grandTotalCls
  const lCls = highlight
    ? 'border-b border-r border-border px-3 py-2 text-left text-xs font-bold uppercase tracking-wide bg-primary text-primary-foreground sticky left-0 z-10'
    : grandTotalLabelCls

  return (
    <tr>
      <td className={lCls}>{label}</td>
      {departments.map((dept) => {
        const { forecast, execution } = getValue(dept)
        return (
          <>
            <td key={`${dept.id}-f`} className={rowCls}>{fmt(forecast)}</td>
            <td key={`${dept.id}-e`} className={rowCls}>{fmt(execution)}</td>
            <td key={`${dept.id}-p`} className={rowCls}><Pct forecast={forecast} execution={execution} /></td>
          </>
        )
      })}
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
