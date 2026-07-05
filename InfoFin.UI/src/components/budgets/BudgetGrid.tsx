'use client'

import React, { useState, useRef, useEffect, useCallback } from 'react'
import { ChevronDown, Plus, Trash2, Check, X } from 'lucide-react'
import { cn } from '@/lib/utils'
import {
  type Department,
  type BudgetSection,
  type BudgetLineItem,
  type ClassificationType,
  CLASSIFICATION_LABELS,
  getSectionTotals,
  sumItems,
  execPct,
  getDeptSummary,
} from '@/lib/budget-data'

// ─── Types ────────────────────────────────────────────────────────────────────

export type CellEdit = {
  deptId: string
  itemId: string
  field: 'forecast' | 'execution'
  value: number
}

export type RowAdd = {
  sectionType: string
  classType?: ClassificationType
  label: string
}

export type RowRemove = {
  sectionType: string
  classType?: ClassificationType
  itemIndex: number
}

export type GridProps = {
  departments: Department[]
  editable?: boolean
  onCellEdit?: (edit: CellEdit) => void
  onRowAdd?: (add: RowAdd) => void
  onRowRemove?: (remove: RowRemove) => void
  onLabelEdit?: (itemId: string, newLabel: string) => void
}

// ─── Formatting ───────────────────────────────────────────────────────────────

/** Plain number for data rows (no $ prefix) */
function fmtPlain(n: number) {
  if (n === 0) return <span className="text-muted-foreground/40">0</span>
  return <span>{n.toLocaleString()}</span>
}

/** Currency format for totals */
function fmtTotal(n: number) {
  if (n === 0) return <span className="text-muted-foreground/40">—</span>
  const abs = Math.abs(n)
  const str =
    abs >= 1_000_000
      ? `$${(abs / 1_000_000).toFixed(2)}M`
      : `$${abs.toLocaleString()}`
  return <span className="font-semibold">{n < 0 ? `-${str}` : str}</span>
}

function Pct({ forecast, execution }: { forecast: number; execution: number }) {
  const p = execPct(forecast, execution)
  if (p === null) return <span className="text-muted-foreground/40">—</span>
  const cls =
    p > 120
      ? 'text-red-600 font-semibold'
      : p > 100
      ? 'text-amber-600 font-medium'
      : 'text-emerald-600 font-medium'
  return <span className={cls}>{p}%</span>
}

// ─── Editable Cell (number input with blue border when active) ────────────────

function EditableCell({
  value,
  editable,
  onCommit,
}: {
  value: number
  editable: boolean
  onCommit: (val: number) => void
}) {
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (editing && inputRef.current) {
      inputRef.current.focus()
      inputRef.current.select()
    }
  }, [editing])

  const commit = useCallback(() => {
    const parsed = parseFloat(draft.replace(/[^0-9.-]/g, ''))
    if (!isNaN(parsed) && parsed !== value) {
      onCommit(parsed)
    }
    setEditing(false)
  }, [draft, value, onCommit])

  if (!editable) return <>{fmtPlain(value)}</>

  if (editing) {
    return (
      <input
        ref={inputRef}
        type="number"
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onBlur={commit}
        onKeyDown={(e) => {
          if (e.key === 'Enter') commit()
          if (e.key === 'Escape') setEditing(false)
        }}
        className="w-full min-w-[80px] rounded border-2 border-blue-500 bg-white px-2 py-1 text-right text-xs tabular-nums outline-none"
      />
    )
  }

  return (
    <button
      onClick={() => {
        setDraft(String(value))
        setEditing(true)
      }}
      className="w-full cursor-text rounded px-1 py-0.5 text-right tabular-nums transition-colors hover:bg-blue-50"
    >
      {fmtPlain(value)}
    </button>
  )
}

// ─── Add Row Inline ───────────────────────────────────────────────────────────

function AddRowInline({
  colSpan,
  onAdd,
}: {
  colSpan: number
  onAdd: (label: string) => void
}) {
  const [active, setActive] = useState(false)
  const [label, setLabel] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (active && inputRef.current) inputRef.current.focus()
  }, [active])

  const submit = () => {
    if (label.trim()) {
      onAdd(label.trim())
      setLabel('')
      setActive(false)
    }
  }

  if (!active) {
    return (
      <tr>
        <td colSpan={colSpan} className="border-b border-border/50 px-4 py-1.5">
          <button
            onClick={() => setActive(true)}
            className="flex items-center gap-1.5 text-[11px] font-medium text-blue-600 transition-colors hover:text-blue-800"
          >
            <Plus className="size-3" />
            Add line item
          </button>
        </td>
      </tr>
    )
  }

  return (
    <tr>
      <td colSpan={colSpan} className="border-b border-border/50 px-4 py-1.5">
        <div className="flex items-center gap-2">
          <input
            ref={inputRef}
            type="text"
            placeholder="New item label…"
            value={label}
            onChange={(e) => setLabel(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') submit()
              if (e.key === 'Escape') { setActive(false); setLabel('') }
            }}
            className="flex-1 rounded border border-border bg-background px-2 py-1 text-xs outline-none focus:border-blue-500"
          />
          <button onClick={submit} className="rounded p-1 text-emerald-600 hover:bg-emerald-50 transition-colors" title="Add">
            <Check className="size-3.5" />
          </button>
          <button onClick={() => { setActive(false); setLabel('') }} className="rounded p-1 text-muted-foreground hover:bg-muted transition-colors" title="Cancel">
            <X className="size-3.5" />
          </button>
        </div>
      </td>
    </tr>
  )
}

// ─── Cell classes ─────────────────────────────────────────────────────────────

const tdCell = 'border-b border-r border-border/40 px-3 py-2 text-right text-xs tabular-nums'
const tdLabelCell = 'border-b border-r border-border/40 px-4 py-2 text-left text-[13px] text-foreground/90 sticky left-0 bg-white z-10'
const subtotalCell = 'border-b border-r border-border/40 px-3 py-2.5 text-right text-xs font-semibold tabular-nums bg-slate-50'
const subtotalLabelCell = 'border-b border-r border-border/40 px-4 py-2.5 text-left text-[13px] font-bold text-foreground sticky left-0 bg-slate-50 z-10'

// ─── Table header rows ────────────────────────────────────────────────────────

function DeptColHeaders({ departments }: { departments: Department[] }) {
  return (
    <tr className="bg-[#0f3d66]">
      <th
        className="sticky left-0 z-20 border-b border-r border-white/10 px-4 py-3 text-left text-[11px] font-bold uppercase tracking-wider text-white/60 bg-[#0f3d66]"
        rowSpan={2}
      >
        Category
      </th>
      {departments.map((d) => (
        <th
          key={d.id}
          className="border-b border-r border-white/10 px-3 py-3 text-center text-[13px] font-bold text-white last:border-r-0"
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
    <tr className="bg-[#164e80]">
      {departments.map((d) => (
        <React.Fragment key={d.id}>
          <th className="border-b border-r border-white/10 px-3 py-2 text-center text-[10px] font-bold uppercase tracking-wider text-white/60">Forecast</th>
          <th className="border-b border-r border-white/10 px-3 py-2 text-center text-[10px] font-bold uppercase tracking-wider text-white/60">Execution</th>
          <th className="border-b border-r border-white/10 px-3 py-2 text-center text-[10px] font-bold uppercase tracking-wider text-white/60 w-14 last:border-r-0">%</th>
        </React.Fragment>
      ))}
    </tr>
  )
}

// ─── Section header row ───────────────────────────────────────────────────────

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
        className="sticky left-0 z-10 cursor-pointer select-none border-b border-border/40 bg-slate-100 px-4 py-2.5"
        onClick={onToggle}
      >
        <div className="flex items-center gap-2">
          <ChevronDown
            className={cn(
              'size-4 text-foreground/60 transition-transform duration-200',
              !open && '-rotate-90',
            )}
          />
          <span className="text-[13px] font-bold uppercase tracking-wide text-foreground/80">
            {label}
          </span>
        </div>
      </td>
    </tr>
  )
}

// ─── Classification header row ────────────────────────────────────────────────

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
        className="sticky left-0 z-10 cursor-pointer select-none border-b border-border/40 bg-slate-50 px-4 py-2"
        onClick={onToggle}
      >
        <div className="flex items-center gap-2 pl-4">
          <ChevronDown
            className={cn(
              'size-3.5 text-foreground/50 transition-transform duration-200',
              !open && '-rotate-90',
            )}
          />
          <span className="text-xs font-semibold uppercase tracking-wide text-foreground/70">
            {label}
          </span>
        </div>
      </td>
    </tr>
  )
}

// ─── Flat section (REVENUES / COS) ───────────────────────────────────────────

function FlatSection({
  label,
  departments,
  sectionType,
  editable,
  onCellEdit,
  onRowAdd,
  onRowRemove,
  onLabelEdit,
}: {
  label: string
  departments: Department[]
  sectionType: 'REVENUES' | 'COS'
  editable?: boolean
  onCellEdit?: (edit: CellEdit) => void
  onRowAdd?: (add: RowAdd) => void
  onRowRemove?: (remove: RowRemove) => void
  onLabelEdit?: (itemId: string, newLabel: string) => void
}) {
  const [open, setOpen] = useState(true)
  const colSpan = 1 + departments.length * 3

  const getDeptSection = (dept: Department) =>
    dept.sections.find((s) => s.type === sectionType)

  const refItems = getDeptSection(departments[0])?.items ?? []

  return (
    <>
      <SectionHeaderRow
        label={label}
        colSpan={colSpan}
        open={open}
        onToggle={() => setOpen((v) => !v)}
      />
      {open &&
        refItems.map((refItem, idx) => (
          <tr key={refItem.id} className="hover:bg-blue-50/30 transition-colors">
            <td className={cn(tdLabelCell)}>
              <div className="flex items-center gap-2">
                <span className="truncate max-w-[200px]">{refItem.label}</span>
                {editable && (
                  <button
                    onClick={() => onRowRemove?.({ sectionType, itemIndex: idx })}
                    className="shrink-0 rounded p-0.5 text-muted-foreground/50 transition-colors hover:text-red-500"
                    title="Remove row"
                  >
                    <Trash2 className="size-3.5" />
                  </button>
                )}
              </div>
            </td>
            {departments.map((dept) => {
              const item = getDeptSection(dept)?.items?.[idx]
              const f = item?.forecast ?? 0
              const e = item?.execution ?? 0
              return (
                <React.Fragment key={dept.id}>
                  <td className={tdCell}>
                    <EditableCell value={f} editable={!!editable} onCommit={(val) => onCellEdit?.({ deptId: dept.id, itemId: refItem.id, field: 'forecast', value: val })} />
                  </td>
                  <td className={tdCell}>
                    <EditableCell value={e} editable={!!editable} onCommit={(val) => onCellEdit?.({ deptId: dept.id, itemId: refItem.id, field: 'execution', value: val })} />
                  </td>
                  <td className={cn(tdCell, 'last:border-r-0')}><Pct forecast={f} execution={e} /></td>
                </React.Fragment>
              )
            })}
          </tr>
        ))}
      {open && editable && (
        <AddRowInline colSpan={colSpan} onAdd={(lbl) => onRowAdd?.({ sectionType, label: lbl })} />
      )}
      {/* Section total */}
      <tr>
        <td className={subtotalLabelCell}>Total {label}</td>
        {departments.map((dept) => {
          const s = getDeptSection(dept)
          const tot = s ? sumItems(s.items ?? []) : { forecast: 0, execution: 0 }
          return (
            <React.Fragment key={dept.id}>
              <td className={subtotalCell}>{fmtTotal(tot.forecast)}</td>
              <td className={subtotalCell}>{fmtTotal(tot.execution)}</td>
              <td className={cn(subtotalCell, 'last:border-r-0')}><Pct forecast={tot.forecast} execution={tot.execution} /></td>
            </React.Fragment>
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
  editable,
  onCellEdit,
  onRowAdd,
  onRowRemove,
  onLabelEdit,
}: {
  label: string
  departments: Department[]
  sectionType: 'FIXED_COSTS' | 'VARIABLE_COSTS'
  editable?: boolean
  onCellEdit?: (edit: CellEdit) => void
  onRowAdd?: (add: RowAdd) => void
  onRowRemove?: (remove: RowRemove) => void
  onLabelEdit?: (itemId: string, newLabel: string) => void
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
      <SectionHeaderRow
        label={label}
        colSpan={colSpan}
        open={sectionOpen}
        onToggle={() => setSectionOpen((v) => !v)}
      />
      {sectionOpen &&
        classifications.map((cls) => {
          const refItems =
            getSection(departments[0])?.classifications?.find((c) => c.type === cls)?.items ?? []
          const isClsOpen = classOpen[cls]

          return (
            <React.Fragment key={cls}>
              <ClassHeaderRow
                label={CLASSIFICATION_LABELS[cls]}
                colSpan={colSpan}
                open={isClsOpen}
                onToggle={() =>
                  setClassOpen((p) => ({ ...p, [cls]: !p[cls] }))
                }
              />
              {isClsOpen &&
                refItems.map((refItem, idx) => (
                  <tr key={`${cls}-${refItem.id}`} className="hover:bg-blue-50/30 transition-colors">
                    <td className={cn(tdLabelCell, 'pl-8')}>
                      <div className="flex items-center gap-2">
                        <span className="truncate max-w-[180px]">{refItem.label}</span>
                        {editable && (
                          <button
                            onClick={() => onRowRemove?.({ sectionType, classType: cls, itemIndex: idx })}
                            className="shrink-0 rounded p-0.5 text-muted-foreground/50 transition-colors hover:text-red-500"
                            title="Remove row"
                          >
                            <Trash2 className="size-3.5" />
                          </button>
                        )}
                      </div>
                    </td>
                    {departments.map((dept) => {
                      const item = getSection(dept)
                        ?.classifications?.find((c) => c.type === cls)
                        ?.items?.[idx]
                      const f = item?.forecast ?? 0
                      const e = item?.execution ?? 0
                      return (
                        <React.Fragment key={dept.id}>
                          <td className={tdCell}>
                            <EditableCell value={f} editable={!!editable} onCommit={(val) => onCellEdit?.({ deptId: dept.id, itemId: refItem.id, field: 'forecast', value: val })} />
                          </td>
                          <td className={tdCell}>
                            <EditableCell value={e} editable={!!editable} onCommit={(val) => onCellEdit?.({ deptId: dept.id, itemId: refItem.id, field: 'execution', value: val })} />
                          </td>
                          <td className={cn(tdCell, 'last:border-r-0')}><Pct forecast={f} execution={e} /></td>
                        </React.Fragment>
                      )
                    })}
                  </tr>
                ))}
              {isClsOpen && editable && (
                <AddRowInline colSpan={colSpan} onAdd={(lbl) => onRowAdd?.({ sectionType, classType: cls, label: lbl })} />
              )}
              {/* Classification subtotal */}
              <tr>
                <td className={cn(subtotalLabelCell, 'pl-6 text-xs')}>
                  {CLASSIFICATION_LABELS[cls]} Total
                </td>
                {departments.map((dept) => {
                  const items =
                    getSection(dept)?.classifications?.find((c) => c.type === cls)?.items ?? []
                  const tot = sumItems(items)
                  return (
                    <React.Fragment key={dept.id}>
                      <td className={subtotalCell}>{fmtTotal(tot.forecast)}</td>
                      <td className={subtotalCell}>{fmtTotal(tot.execution)}</td>
                      <td className={cn(subtotalCell, 'last:border-r-0')}><Pct forecast={tot.forecast} execution={tot.execution} /></td>
                    </React.Fragment>
                  )
                })}
              </tr>
            </React.Fragment>
          )
        })}
      {/* Section grand total */}
      <tr className="bg-slate-100">
        <td className="border-b border-r border-border/40 px-4 py-2.5 text-left text-[13px] font-bold uppercase text-foreground sticky left-0 bg-slate-100 z-10">
          Total {label}
        </td>
        {departments.map((dept) => {
          const s = getSection(dept)
          const tot = s ? getSectionTotals(s) : { forecast: 0, execution: 0 }
          return (
            <React.Fragment key={dept.id}>
              <td className="border-b border-r border-border/40 px-3 py-2.5 text-right text-xs font-bold tabular-nums bg-slate-100">{fmtTotal(tot.forecast)}</td>
              <td className="border-b border-r border-border/40 px-3 py-2.5 text-right text-xs font-bold tabular-nums bg-slate-100">{fmtTotal(tot.execution)}</td>
              <td className="border-b border-r border-border/40 px-3 py-2.5 text-right text-xs font-bold tabular-nums bg-slate-100 last:border-r-0"><Pct forecast={tot.forecast} execution={tot.execution} /></td>
            </React.Fragment>
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
  const bg = highlight ? 'bg-[#0f3d66]' : 'bg-slate-100'
  const textCls = highlight ? 'text-white' : 'text-foreground'

  return (
    <tr className={bg}>
      <td className={cn('border-b border-r border-border/40 px-4 py-3 text-left text-[13px] font-bold uppercase sticky left-0 z-10', bg, textCls)}>
        {label}
      </td>
      {departments.map((dept) => {
        const { forecast, execution } = getValue(dept)
        return (
          <React.Fragment key={dept.id}>
            <td className={cn('border-b border-r border-border/40 px-3 py-3 text-right text-xs font-bold tabular-nums', textCls)}>{fmtTotal(forecast)}</td>
            <td className={cn('border-b border-r border-border/40 px-3 py-3 text-right text-xs font-bold tabular-nums', textCls)}>{fmtTotal(execution)}</td>
            <td className={cn('border-b border-r border-border/40 px-3 py-3 text-right text-xs font-bold tabular-nums last:border-r-0', textCls)}>
              <Pct forecast={forecast} execution={execution} />
            </td>
          </React.Fragment>
        )
      })}
    </tr>
  )
}

// ─── BU P&L Grid ─────────────────────────────────────────────────────────────

export function BUGrid({ departments, editable, onCellEdit, onRowAdd, onRowRemove, onLabelEdit }: GridProps) {
  const summaries = departments.map((d) => getDeptSummary(d, 'BU'))

  return (
    <div className="overflow-x-auto bg-white">
      <table className="min-w-full border-collapse text-xs">
        <thead>
          <DeptColHeaders departments={departments} />
          <DeptSubHeaders departments={departments} />
        </thead>
        <tbody>
          <FlatSection label="Revenues" departments={departments} sectionType="REVENUES" editable={editable} onCellEdit={onCellEdit} onRowAdd={onRowAdd} onRowRemove={onRowRemove} onLabelEdit={onLabelEdit} />
          <FlatSection label="Cost of Sales" departments={departments} sectionType="COS" editable={editable} onCellEdit={onCellEdit} onRowAdd={onRowAdd} onRowRemove={onRowRemove} onLabelEdit={onLabelEdit} />
          <SummaryRow
            label="Gross Margin"
            departments={departments}
            getValue={(d) => summaries[departments.indexOf(d)].grossMargin}
          />
          <ClassifiedSection label="Fixed Costs" departments={departments} sectionType="FIXED_COSTS" editable={editable} onCellEdit={onCellEdit} onRowAdd={onRowAdd} onRowRemove={onRowRemove} onLabelEdit={onLabelEdit} />
          <ClassifiedSection label="Variable Costs" departments={departments} sectionType="VARIABLE_COSTS" editable={editable} onCellEdit={onCellEdit} onRowAdd={onRowAdd} onRowRemove={onRowRemove} onLabelEdit={onLabelEdit} />
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

export function SUGrid({ departments, editable, onCellEdit, onRowAdd, onRowRemove, onLabelEdit }: GridProps) {
  const summaries = departments.map((d) => getDeptSummary(d, 'SU'))

  return (
    <div className="overflow-x-auto bg-white">
      <table className="min-w-full border-collapse text-xs">
        <thead>
          <DeptColHeaders departments={departments} />
          <DeptSubHeaders departments={departments} />
        </thead>
        <tbody>
          <ClassifiedSection label="Fixed Costs" departments={departments} sectionType="FIXED_COSTS" editable={editable} onCellEdit={onCellEdit} onRowAdd={onRowAdd} onRowRemove={onRowRemove} onLabelEdit={onLabelEdit} />
          <ClassifiedSection label="Variable Costs" departments={departments} sectionType="VARIABLE_COSTS" editable={editable} onCellEdit={onCellEdit} onRowAdd={onRowAdd} onRowRemove={onRowRemove} onLabelEdit={onLabelEdit} />
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
