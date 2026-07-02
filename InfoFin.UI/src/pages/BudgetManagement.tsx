'use client'

import { useState } from 'react'
import { Upload, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Select } from '@/components/ui/select'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { useSession } from '@/auth/AuthContext'
import { budgetRows, departments, formatCurrency } from '@/lib/mock-data'

function usage(actual: number, forecast: number) {
  return Math.round((actual / forecast) * 100)
}

function statusFor(pct: number) {
  if (pct > 100)
    return { variant: 'danger' as const, bar: 'bg-destructive' }
  if (pct >= 80)
    return { variant: 'warning' as const, bar: 'bg-warning' }
  return { variant: 'success' as const, bar: 'bg-success' }
}

export default function BudgetsPage() {
  const { role } = useSession()
  const isAdmin = role === 'Admin' || role === 'FPA Reviewer' || role === 'FPA Approver'
  const [showUpload, setShowUpload] = useState(false)

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center gap-3 rounded-lg border border-border bg-card p-3">
        <Select defaultValue="2026" className="h-9 w-28">
          <option value="2026">2026</option>
          <option value="2025">2025</option>
        </Select>
        <Select defaultValue="all" className="h-9 w-48">
          <option value="all">All Departments</option>
          {departments.map((d) => (
            <option key={d} value={d}>
              {d}
            </option>
          ))}
        </Select>
        <Select defaultValue="all" className="h-9 w-52">
          <option value="all">All Financial Groups</option>
          <option value="opex">Operating Expenses</option>
          <option value="capex">Capital Expenditure</option>
          <option value="cos">Cost of Sales</option>
        </Select>
        {isAdmin && (
          <Button className="ml-auto" onClick={() => setShowUpload(true)}>
            <Upload className="size-4" />
            Upload Budget
          </Button>
        )}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Budget vs Actual</CardTitle>
          <p className="text-sm text-muted-foreground">
            Execution against forecast by category
          </p>
        </CardHeader>
        <CardContent className="px-0">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead className="pl-6">Category</TableHead>
                <TableHead className="text-right">Forecast</TableHead>
                <TableHead className="text-right">Actual</TableHead>
                <TableHead className="text-right">Remaining</TableHead>
                <TableHead className="w-64 pr-6">% Used</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {budgetRows.map((row) => {
                const pct = usage(row.actual, row.forecast)
                const remaining = row.forecast - row.actual
                const s = statusFor(pct)
                return (
                  <TableRow key={row.category}>
                    <TableCell className="pl-6 font-medium">
                      {row.category}
                    </TableCell>
                    <TableCell className="text-right tabular-nums">
                      {formatCurrency(row.forecast)}
                    </TableCell>
                    <TableCell className="text-right tabular-nums">
                      {formatCurrency(row.actual)}
                    </TableCell>
                    <TableCell
                      className={`text-right tabular-nums ${remaining < 0 ? 'text-destructive' : ''}`}
                    >
                      {formatCurrency(remaining)}
                    </TableCell>
                    <TableCell className="pr-6">
                      <div className="flex items-center gap-3">
                        <Progress
                          value={pct}
                          indicatorClassName={s.bar}
                          className="flex-1"
                        />
                        <Badge variant={s.variant} className="w-14 justify-center">
                          {pct}%
                        </Badge>
                      </div>
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {showUpload && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <button
            className="absolute inset-0 bg-foreground/40"
            onClick={() => setShowUpload(false)}
            aria-label="Close"
          />
          <Card className="relative w-full max-w-md">
            <CardHeader className="flex-row items-center justify-between">
              <CardTitle>Upload Budget (CSV)</CardTitle>
              <Button
                variant="ghost"
                size="icon-sm"
                aria-label="Close"
                onClick={() => setShowUpload(false)}
              >
                <X className="size-4" />
              </Button>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
              <div className="flex flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed border-border bg-muted/40 px-6 py-10 text-center">
                <Upload className="size-7 text-muted-foreground" />
                <p className="text-sm font-medium">Drop a CSV file here</p>
                <p className="text-xs text-muted-foreground">
                  Columns: category, forecast, department, year
                </p>
              </div>
              <div className="flex justify-end gap-3">
                <Button variant="outline" onClick={() => setShowUpload(false)}>
                  Cancel
                </Button>
                <Button onClick={() => setShowUpload(false)}>Import</Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
