'use client'

import React, { useState, useRef, useEffect, useCallback } from 'react'
import { ChevronDown, Plus, Trash2, Pencil, Check, X } from 'lucide-react'
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

function fmt(n: number) {
  if (n === 0) return <span className="text-muted-foreground/40">—</span>
  const abs = Math.abs(n)
  const str =
    abs >= 1_000_000
      ? `$${(abs / 1_000_000).toFixed(2)}M`
      : `$${abs.toLocaleString()}`
  return <span>{n < 0 ? `-${str}` : str}</span>
}

function Pct({ forecast, execution }: { forecast: number; execution: number }) {
  const p = execPct(forecast, execution)
  if (p === null) return <span className="text-muted-foreground/40">—</span>
  const cls =
    p > 120
      ? 'text-destructive font-semibold'
      : p > 100
      ? 'text-warning font-medium'
      : 'text-success'
  return <span className={cls}>{p}%</span>
}

// ─── Editable Cell ────────────────────────────────────────────────────────────

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

  if (!editable) return <>{fmt(value)}</>

  if (editing) {
    return (
      <input
        ref={inputRef}
        type="text"
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onBlur={commit}
        onKeyDown={(e) => {
          if (e.key === 'Enter') commit()
          if (e.key === 'Escape') setEditing(false)
        }}
        className="w-full rounded border border-primary/40 bg-background px-1.5 py-0.5 text-right text-xs tabular-nums outline-none ring-1 ring-primary/20 focus:ring-primary/50"
      />
    )
  }

  return (
    <button
      onClick={() => {
        setDraft(String(value))
        setEditing(true)
      }}
      className="group/cell w-full cursor-text rounded px-1 py-0.5 text-right transition-colors hover:bg-primary/5 hover:ring-1 hover:ring-primary/20"
      title="Click to edit"
    >
      {fmt(value)}
      <Pencil className="ml-1 inline-block size-2.5 text-muted-foreground/0 transition-colors group-hover/cell:text-muted-foreground/50" />
    </button>
  )
}

// ─── Editable Label ───────────────────────────────────────────────────────────

function EditableLabel({
  label,
  editable,
  onCommit,
}: {
  label: string
  editable: boolean
  onCommit: (val: string) => void
}) {
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState(label)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (editing && inputRef.current) {
      inputRef.current.focus()
      inputRef.current.select()
    }
  }, [editing])

  const commit = useCallback(() => {
    const trimmed = draft.trim()
    if (trimmed && trimmed !== label) {
      onCommit(trimmed)
    }
    setEditing(false)
  }, [draft, label, onCommit])

  if (!editable) return <span>{label}</span>

  if (editing) {
    return (
      <input
        ref={inputRef}
        type="text"
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onBlur={commit}
        onKeyDown={(e) => {
          if (e.key === 'Enter') commit()
          if (e.key === 'Escape') setEditing(false)
        }}
        className="w-full rounded border border-primary/40 bg-background px-1.5 py-0.5 text-left text-xs outline-none ring-1 ring-primary/20 focus:ring-primary/50"
      />
    )
  }

  return (
    <button
      onClick={() => {
        setDraft(label)
        setEditing(true)
      }}
      className="group/label w-full cursor-text truncate rounded px-1 py-0.5 text-left transition-colors hover:bg-primary/5"
      title="Click to rename"
    >
      {label}
      <Pencil className="ml-1 inline-block size-2.5 text-muted-foreground/0 transition-colors group-hover/label:text-muted-foreground/50" />
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
        <td colSpan={colSpan} className="border-b border-border px-3 py-1">
          <button
            onClick={() => setActive(true)}
            className="flex items-center gap-1.5 rounded-md px-2 py-1 text-[11px] font-medium text-primary/70 transition-colors hover:bg-primary/5 hover:text-primary"
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
      <td colSpan={colSpan} className="border-b border-border px-3 py-1.5">
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
            className="flex-1 rounded border border-input bg-background px-2 py-1 text-xs outline-none focus:ring-1 focus:ring-primary/40"
          />
          <button onClick={submit} className="rounded p-1 text-success hover:bg-success/10 transition-colors" title="Add">
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

const th =
  'border-b border-r border-border px-3 py-2 text-center text-[10px] font-semibold uppercase tracking-wide text-muted-foreground last:border-r-0'
const td =
  'border-b border-r border-border px-3 py-1.5 text-right text-xs tabular-nums last:border-r-0'
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

// ─── Table header rows ────────────────────────────────────────────────────────

function DeptColHeaders({ departments, editable }: { departments: Department[]; editable?: boolean }) {
  return (
    <tr className="bg-gradient-to-r from-[#0f3d66] to-[#1a5276]">
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
          colSpan={editable ? 4 : 3}
        >
          {d.name}
        </th>
      ))}
    </tr>
  )
}

function DeptSubHeaders({ departments, editable }: { departments: Department[]; editable?: boolean }) {
  return (
    <tr className="bg-[#125586]/80">
      {departments.map((d) => (
        <React.Fragment key={d.id}>
          <th className={cn(th, 'text-white/70 border-white/10')}>Forecast</th>
          <th className={cn(th, 'text-white/70 border-white/10')}>Execution</th>
          <th className={cn(th, 'w-14 text-white/70 border-white/10')}>%</th>
          {editable && <th className={cn(th, 'w-8 text-white/70 border-white/10')}></th>}
        </React.Fragment>
      ))}
    </tr>
  )
}

// ─── Section header row (clickable to collapse) ───────────────────────────────

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
        className="sticky left-0 z-10 cursor-pointer select-none border-b border-border bg-secondary px-3 py-2 transition-colors hover:bg-secondary/80"
        onClick={onToggle}
      >
        <div className="flex items-center gap-2">
          <ChevronDown
            className={cn(
              'size-3.5 text-secondary-foreground/60 transition-transform duration-200',
              !open && '-rotate-90',
            )}
          />
          <span className="text-xs font-bold uppercase tracking-wide text-secondary-foreground">
            {label}
          </span>
        </div>
      </td>
    </tr>
  )
}

// ─── Classification header row (also foldable) ────────────────────────────────

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
        className="sticky left-0 z-10 cursor-pointer select-none border-b border-border bg-accent px-3 py-1.5 transition-colors hover:bg-accent/80"
        onClick={onToggle}
      >
        <div className="flex items-center gap-2 pl-3">
          <ChevronDown
            className={cn(
              'size-3 text-accent-foreground/50 transition-transform duration-200',
              !open && '-rotate-90',
            )}
          />
          <span className="text-[11px] font-semibold uppercase tracking-wide text-accent-foreground">
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
  const [open, setOpen] = useState(false)
  const colSpan = 1 + departments.length * (editable ? 4 : 3)

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
          <tr key={refItem.id} className="group hover:bg-muted/30 transition-colors">
            <td className={cn(tdLabel, 'pl-6')}>
              {editable && onLabelEdit ? (
                <EditableLabel label={refItem.label} editable onCommit={(val) => onLabelEdit(refItem.id, val)} />
              ) : (
                refItem.label
              )}
            </td>
            {departments.map((dept) => {
              const item = getDeptSection(dept)?.items?.[idx]
              const f = item?.forecast ?? 0
              const e = item?.execution ?? 0
              return (
                <React.Fragment key={dept.id}>
                  <td className={td}>
                    <EditableCell value={f} editable={!!editable} onCommit={(val) => onCellEdit?.({ deptId: dept.id, itemId: refItem.id, field: 'forecast', value: val })} />
                  </td>
                  <td className={td}>
                    <EditableCell value={e} editable={!!editable} onCommit={(val) => onCellEdit?.({ deptId: dept.id, itemId: refItem.id, field: 'execution', value: val })} />
                  </td>
                  <td className={td}><Pct forecast={f} execution={e} /></td>
                  {editable && (
                    <td className="border-b border-r border-border px-1 py-1 text-center last:border-r-0">
                      <button
                        onClick={() => onRowRemove?.({ sectionType, itemIndex: idx })}
                        className="rounded p-0.5 text-muted-foreground/40 opacity-0 transition-all hover:bg-destructive/10 hover:text-destructive group-hover:opacity-100"
                        title="Remove row"
                      >
                        <Trash2 className="size-3" />
                      </button>
                    </td>
                  )}
                </React.Fragment>
              )
            })}
          </tr>
        ))}
      {open && editable && (
        <AddRowInline colSpan={colSpan} onAdd={(lbl) => onRowAdd?.({ sectionType, label: lbl })} />
      )}
      {/* Section total always visible */}
      <tr className="bg-muted/20">
        <td className={cn(subtotalLabelCls, 'text-[11px]')}>Total {label}</td>
        {departments.map((dept) => {
          const s = getDeptSection(dept)
          const tot = s ? sumItems(s.items ?? []) : { forecast: 0, execution: 0 }
          return (
            <React.Fragment key={dept.id}>
              <td className={subtotalCls}>{fmt(tot.forecast)}</td>
              <td className={subtotalCls}>{fmt(tot.execution)}</td>
              <td className={subtotalCls}><Pct forecast={tot.forecast} execution={tot.execution} /></td>
              {editable && <td className={cn(subtotalCls, 'w-8')} />}
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
  const [sectionOpen, setSectionOpen] = useState(false)
  const [classOpen, setClassOpen] = useState<Record<string, boolean>>({
    ADMIN_FIN: false,
    TECH_OPS: false,
    MKT_SALES: false,
  })

  const colSpan = 1 + departments.length * (editable ? 4 : 3)
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
                  <tr key={`${cls}-${refItem.id}`} className="group hover:bg-muted/30 transition-colors">
                    <td className={cn(tdLabel, 'pl-8')}>
                      {editable && onLabelEdit ? (
                        <EditableLabel label={refItem.label} editable onCommit={(val) => onLabelEdit(refItem.id, val)} />
                      ) : (
                        refItem.label
                      )}
                    </td>
                    {departments.map((dept) => {
                      const item = getSection(dept)
                        ?.classifications?.find((c) => c.type === cls)
                        ?.items?.[idx]
                      const f = item?.forecast ?? 0
                      const e = item?.execution ?? 0
                      return (
                        <React.Fragment key={dept.id}>
                          <td className={td}>
                            <EditableCell value={f} editable={!!editable} onCommit={(val) => onCellEdit?.({ deptId: dept.id, itemId: refItem.id, field: 'forecast', value: val })} />
                          </td>
                          <td className={td}>
                            <EditableCell value={e} editable={!!editable} onCommit={(val) => onCellEdit?.({ deptId: dept.id, itemId: refItem.id, field: 'execution', value: val })} />
                          </td>
                          <td className={td}><Pct forecast={f} execution={e} /></td>
                          {editable && (
                            <td className="border-b border-r border-border px-1 py-1 text-center last:border-r-0">
                              <button
                                onClick={() => onRowRemove?.({ sectionType, classType: cls, itemIndex: idx })}
                                className="rounded p-0.5 text-muted-foreground/40 opacity-0 transition-all hover:bg-destructive/10 hover:text-destructive group-hover:opacity-100"
                                title="Remove row"
                              >
                                <Trash2 className="size-3" />
                              </button>
                            </td>
                          )}
                        </React.Fragment>
                      )
                    })}
                  </tr>
                ))}
              {isClsOpen && editable && (
                <AddRowInline colSpan={colSpan} onAdd={(lbl) => onRowAdd?.({ sectionType, classType: cls, label: lbl })} />
              )}
              {/* Classification subtotal — always visible */}
              <tr className="bg-muted/10">
                <td className={cn(subtotalLabelCls, 'pl-6 text-[11px]')}>
                  {CLASSIFICATION_LABELS[cls]} Total
                </td>
                {departments.map((dept) => {
                  const items =
                    getSection(dept)?.classifications?.find((c) => c.type === cls)?.items ?? []
                  const tot = sumItems(items)
                  return (
                    <React.Fragment key={dept.id}>
                      <td className={subtotalCls}>{fmt(tot.forecast)}</td>
                      <td className={subtotalCls}>{fmt(tot.execution)}</td>
                      <td className={subtotalCls}><Pct forecast={tot.forecast} execution={tot.execution} /></td>
                      {editable && <td className={cn(subtotalCls, 'w-8')} />}
                    </React.Fragment>
                  )
                })}
              </tr>
            </React.Fragment>
          )
        })}
      {/* Section grand total */}
      <tr>
        <td className={grandTotalLabelCls}>Total {label}</td>
        {departments.map((dept) => {
          const s = getSection(dept)
          const tot = s ? getSectionTotals(s) : { forecast: 0, execution: 0 }
          return (
            <React.Fragment key={dept.id}>
              <td className={grandTotalCls}>{fmt(tot.forecast)}</td>
              <td className={grandTotalCls}>{fmt(tot.execution)}</td>
              <td className={grandTotalCls}><Pct forecast={tot.forecast} execution={tot.execution} /></td>
              {editable && <td className={cn(grandTotalCls, 'w-8')} />}
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
  editable,
}: {
  label: string
  departments: Department[]
  getValue: (dept: Department) => { forecast: number; execution: number }
  highlight?: boolean
  editable?: boolean
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
          <React.Fragment key={dept.id}>
            <td className={rowCls}>{fmt(forecast)}</td>
            <td className={rowCls}>{fmt(execution)}</td>
            <td className={rowCls}><Pct forecast={forecast} execution={execution} /></td>
            {editable && <td className={cn(rowCls, 'w-8')} />}
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
    <div className="overflow-x-auto rounded-xl border border-border shadow-sm bg-card">
      <table className="min-w-full border-collapse text-xs">
        <thead>
          <DeptColHeaders departments={departments} editable={editable} />
          <DeptSubHeaders departments={departments} editable={editable} />
        </thead>
        <tbody>
          <FlatSection label="Revenues" departments={departments} sectionType="REVENUES" editable={editable} onCellEdit={onCellEdit} onRowAdd={onRowAdd} onRowRemove={onRowRemove} onLabelEdit={onLabelEdit} />
          <FlatSection label="Cost of Sales" departments={departments} sectionType="COS" editable={editable} onCellEdit={onCellEdit} onRowAdd={onRowAdd} onRowRemove={onRowRemove} onLabelEdit={onLabelEdit} />
          <SummaryRow
            label="Gross Margin"
            departments={departments}
            getValue={(d) => summaries[departments.indexOf(d)].grossMargin}
            editable={editable}
          />
          <ClassifiedSection label="Fixed Costs" departments={departments} sectionType="FIXED_COSTS" editable={editable} onCellEdit={onCellEdit} onRowAdd={onRowAdd} onRowRemove={onRowRemove} onLabelEdit={onLabelEdit} />
          <ClassifiedSection label="Variable Costs" departments={departments} sectionType="VARIABLE_COSTS" editable={editable} onCellEdit={onCellEdit} onRowAdd={onRowAdd} onRowRemove={onRowRemove} onLabelEdit={onLabelEdit} />
          <SummaryRow
            label="Total OPEX"
            departments={departments}
            getValue={(d) => summaries[departments.indexOf(d)].opex}
            editable={editable}
          />
          <SummaryRow
            label="EBIT"
            departments={departments}
            getValue={(d) => summaries[departments.indexOf(d)].ebit}
            highlight
            editable={editable}
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
    <div className="overflow-x-auto rounded-xl border border-border shadow-sm bg-card">
      <table className="min-w-full border-collapse text-xs">
        <thead>
          <DeptColHeaders departments={departments} editable={editable} />
          <DeptSubHeaders departments={departments} editable={editable} />
        </thead>
        <tbody>
          <ClassifiedSection label="Fixed Costs" departments={departments} sectionType="FIXED_COSTS" editable={editable} onCellEdit={onCellEdit} onRowAdd={onRowAdd} onRowRemove={onRowRemove} onLabelEdit={onLabelEdit} />
          <ClassifiedSection label="Variable Costs" departments={departments} sectionType="VARIABLE_COSTS" editable={editable} onCellEdit={onCellEdit} onRowAdd={onRowAdd} onRowRemove={onRowRemove} onLabelEdit={onLabelEdit} />
          <SummaryRow
            label="Total OPEX"
            departments={departments}
            getValue={(d) => summaries[departments.indexOf(d)].opex}
            highlight
            editable={editable}
          />
        </tbody>
      </table>
    </div>
  )
}
