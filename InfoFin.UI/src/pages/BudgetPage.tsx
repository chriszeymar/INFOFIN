'use client'

import { useState, useEffect } from 'react'
import { BudgetNavigator, type Selection, type NavGroup } from '@/components/budgets/BudgetNavigator'
import { BUGrid, SUGrid } from '@/components/budgets/BudgetGrid'
import type { Department } from '@/lib/budget-data'
import { httpClient } from '@/api/httpClient'
import { Select } from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Loader2 } from 'lucide-react'

const YEARS = [2026, 2025, 2024]

export default function BudgetPage() {
  const [year, setYear] = useState(2026)
  const [buSu, setBuSu] = useState<'BU' | 'SU'>('BU')
  const [selection, setSelection] = useState<Selection | null>(null)
  const [showNav, setShowNav] = useState(true)
  const [depts, setDepts] = useState<Department[]>([])
  const [navGroups, setNavGroups] = useState<NavGroup[]>([])
  const [loading, setLoading] = useState(true)

  // Fetch grid data
  useEffect(() => {
    setLoading(true)
    httpClient.get(`/api/budgets/grid/${year}`, { params: { buSu } })
      .then(({ data }) => setDepts(Array.isArray(data) ? data : []))
      .catch(() => setDepts([]))
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

  return (
    <div className="flex flex-col gap-4">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-3 rounded-lg border bg-card p-3">
        <Select value={String(year)} onChange={(e) => setYear(Number(e.target.value))} className="h-9 w-28">
          {YEARS.map((y) => (<option key={y} value={String(y)}>{y}</option>))}
        </Select>
        <Button variant="outline" size="sm" onClick={() => setShowNav((v) => !v)}>
          {showNav ? 'Hide' : 'Show'} Navigator
        </Button>
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
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">
                {buSu === 'BU' ? 'Business Units' : 'Support Units'} — {year}
                {selection?.deptId && selection.deptId !== 'all' && (
                  <span className="ml-2 text-sm font-normal text-muted-foreground">
                    (filtered to {filteredDepts[0]?.name ?? selection.deptId})
                  </span>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {loading ? (
                <div className="flex justify-center py-16"><Loader2 className="size-5 animate-spin text-muted-foreground" /></div>
              ) : filteredDepts.length === 0 ? (
                <div className="py-16 text-center text-muted-foreground text-sm">No actuals data for {year}. Run Odoo Sync from Master Data.</div>
              ) : buSu === 'BU' ? (
                <BUGrid departments={filteredDepts} />
              ) : (
                <SUGrid departments={filteredDepts} />
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
