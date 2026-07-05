'use client'

import { useState, useEffect, useCallback } from 'react'
import { BudgetNavigator, type Selection, type NavGroup } from '@/components/budgets/BudgetNavigator'
import { BUGrid, SUGrid, type CellEdit, type RowAdd, type RowRemove } from '@/components/budgets/BudgetGrid'
import type { Department, BudgetLineItem, ClassificationType } from '@/lib/budget-data'
import { httpClient } from '@/api/httpClient'
import { Select } from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Loader2, Pencil, Save, X } from 'lucide-react'

const YEARS = [2026, 2025, 2024]

export default function BudgetPage() {
  const [year, setYear] = useState(2026)
  const [buSu, setBuSu] = useState<'BU' | 'SU'>('BU')
  const [selection, setSelection] = useState<Selection | null>(null)
  const [showNav, setShowNav] = useState(true)
  const [depts, setDepts] = useState<Department[]>([])
  const [navGroups, setNavGroups] = useState<NavGroup[]>([])
  const [loading, setLoading] = useState(true)
  const [editable, setEditable] = useState(false)
  const [saving, setSaving] = useState(false)
  const [hasChanges, setHasChanges] = useState(false)

  // Keep a snapshot for cancel
  const [snapshot, setSnapshot] = useState<Department[]>([])

  // Fetch grid data
  useEffect(() => {
    setLoading(true)
    httpClient.get(`/api/budgets/grid/${year}`, { params: { buSu } })
      .then(({ data }) => {
        const d = Array.isArray(data) ? data : []
        setDepts(d)
        setSnapshot(structuredClone(d))
      })
      .catch(() => { setDepts([]); setSnapshot([]) })
      .finally(() => setLoading(false))
  }, [year, buSu])

  // Fetch navigator data
  useEffect(() => {
    httpClient.get(`/api/budgets/navigator/${year}`)
      .then(({ data }) => setNavGroups(Array.isArray(data) ? data : []))
      .catch(() => setNavGroups([]))
  }, [year, buSu])

  // Filter departments by selection
  const filteredDepts = selection?.deptId && selection.deptId !== 'all'
    ? depts.filter((d) => d.id === selection.deptId)
    : depts

  // ─── Edit handlers ────────────────────────────────────────────────────────

  const handleCellEdit = useCallback((edit: CellEdit) => {
    setDepts((prev) =>
      prev.map((dept) => {
        if (dept.id !== edit.deptId) return dept
        return {
          ...dept,
          sections: dept.sections.map((sec) => ({
            ...sec,
            items: sec.items?.map((item) =>
              item.id === edit.itemId ? { ...item, [edit.field]: edit.value } : item
            ),
            classifications: sec.classifications?.map((cls) => ({
              ...cls,
              items: cls.items.map((item) =>
                item.id === edit.itemId ? { ...item, [edit.field]: edit.value } : item
              ),
            })),
          })),
        }
      })
    )
    setHasChanges(true)
  }, [])

  const handleRowAdd = useCallback((add: RowAdd) => {
    const newItem: BudgetLineItem = {
      id: `new-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      label: add.label,
      forecast: 0,
      execution: 0,
    }
    setDepts((prev) =>
      prev.map((dept) => ({
        ...dept,
        sections: dept.sections.map((sec) => {
          if (sec.type !== add.sectionType) return sec
          if (add.classType) {
            return {
              ...sec,
              classifications: sec.classifications?.map((cls) =>
                cls.type === add.classType
                  ? { ...cls, items: [...cls.items, { ...newItem, id: `${dept.id}-${newItem.id}` }] }
                  : cls
              ),
            }
          }
          return { ...sec, items: [...(sec.items ?? []), { ...newItem, id: `${dept.id}-${newItem.id}` }] }
        }),
      }))
    )
    setHasChanges(true)
  }, [])

  const handleRowRemove = useCallback((remove: RowRemove) => {
    setDepts((prev) =>
      prev.map((dept) => ({
        ...dept,
        sections: dept.sections.map((sec) => {
          if (sec.type !== remove.sectionType) return sec
          if (remove.classType) {
            return {
              ...sec,
              classifications: sec.classifications?.map((cls) =>
                cls.type === remove.classType
                  ? { ...cls, items: cls.items.filter((_, i) => i !== remove.itemIndex) }
                  : cls
              ),
            }
          }
          return { ...sec, items: sec.items?.filter((_, i) => i !== remove.itemIndex) }
        }),
      }))
    )
    setHasChanges(true)
  }, [])

  const handleLabelEdit = useCallback((itemId: string, newLabel: string) => {
    setDepts((prev) =>
      prev.map((dept) => ({
        ...dept,
        sections: dept.sections.map((sec) => ({
          ...sec,
          items: sec.items?.map((item) =>
            item.id === itemId ? { ...item, label: newLabel } : item
          ),
          classifications: sec.classifications?.map((cls) => ({
            ...cls,
            items: cls.items.map((item) =>
              item.id === itemId ? { ...item, label: newLabel } : item
            ),
          })),
        })),
      }))
    )
    setHasChanges(true)
  }, [])

  // ─── Save & Cancel ────────────────────────────────────────────────────────

  const handleSave = async () => {
    setSaving(true)
    try {
      await httpClient.put(`/api/budgets/grid/${year}`, { buSu, departments: depts })
      setSnapshot(structuredClone(depts))
      setHasChanges(false)
      setEditable(false)
    } catch {
      // Keep editing on error
    } finally {
      setSaving(false)
    }
  }

  const handleCancel = () => {
    setDepts(structuredClone(snapshot))
    setHasChanges(false)
    setEditable(false)
  }

  const handleEditToggle = () => {
    if (!editable) {
      setSnapshot(structuredClone(depts))
    }
    setEditable(true)
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-3 rounded-xl border bg-card p-3 shadow-sm">
        <Select value={String(year)} onChange={(e) => setYear(Number(e.target.value))} className="h-9 w-28">
          {YEARS.map((y) => (<option key={y} value={String(y)}>{y}</option>))}
        </Select>
        <Button variant="outline" size="sm" onClick={() => setShowNav((v) => !v)}>
          {showNav ? 'Hide' : 'Show'} Navigator
        </Button>

        <div className="ml-auto flex items-center gap-2">
          {!editable ? (
            <Button variant="outline" size="sm" onClick={handleEditToggle} className="gap-1.5">
              <Pencil className="size-3.5" />
              Edit Budget
            </Button>
          ) : (
            <>
              {hasChanges && (
                <span className="text-xs text-muted-foreground animate-pulse">Unsaved changes</span>
              )}
              <Button variant="ghost" size="sm" onClick={handleCancel} className="gap-1.5 text-muted-foreground">
                <X className="size-3.5" />
                Cancel
              </Button>
              <Button size="sm" onClick={handleSave} disabled={saving || !hasChanges} className="gap-1.5">
                {saving ? <Loader2 className="size-3.5 animate-spin" /> : <Save className="size-3.5" />}
                Save
              </Button>
            </>
          )}
        </div>
      </div>

      <div className="flex gap-4">
        {showNav && (
          <div className="shrink-0">
            <BudgetNavigator
              groups={navGroups}
              selection={selection}
              onSelect={setSelection}
              onClose={() => setShowNav(false)}
              onBucketChange={setBuSu}
            />
          </div>
        )}

        <div className="flex-1 min-w-0">
          <Card className="shadow-sm">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">
                  {buSu === 'BU' ? 'Business Units' : 'Support Units'} — {year}
                  {selection?.deptId && selection.deptId !== 'all' && (
                    <span className="ml-2 text-sm font-normal text-muted-foreground">
                      (filtered to {filteredDepts[0]?.name ?? selection.deptId})
                    </span>
                  )}
                </CardTitle>
                {editable && (
                  <span className="rounded-full bg-primary/10 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-primary">
                    Editing
                  </span>
                )}
              </div>
            </CardHeader>
            <CardContent className="p-0">
              {loading ? (
                <div className="flex justify-center py-16"><Loader2 className="size-5 animate-spin text-muted-foreground" /></div>
              ) : filteredDepts.length === 0 ? (
                <div className="py-16 text-center text-muted-foreground text-sm">No actuals data for {year}. Run Odoo Sync from Master Data.</div>
              ) : buSu === 'BU' ? (
                <BUGrid
                  departments={filteredDepts}
                  editable={editable}
                  onCellEdit={handleCellEdit}
                  onRowAdd={handleRowAdd}
                  onRowRemove={handleRowRemove}
                  onLabelEdit={handleLabelEdit}
                />
              ) : (
                <SUGrid
                  departments={filteredDepts}
                  editable={editable}
                  onCellEdit={handleCellEdit}
                  onRowAdd={handleRowAdd}
                  onRowRemove={handleRowRemove}
                  onLabelEdit={handleLabelEdit}
                />
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
