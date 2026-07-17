'use client'

import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { cn } from '@/lib/utils'
import {
  formatCompact,
  formatCurrency,
} from '@/lib/mock-data'
import type { BudgetLine as BudgetLineDto, CostGroup, DeptCost } from '@/lib/dashboard-data'

const tooltipStyle = {
  borderRadius: 8,
  border: '1px solid var(--color-border)',
  background: 'var(--color-card)',
  fontSize: 12,
}

/* ---------------- Budget performance table ---------------- */

function BudgetTable({ rows, showTodate = true }: { rows: BudgetLineDto[]; showTodate?: boolean }) {
  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow className="hover:bg-transparent">
            <TableHead>Budget</TableHead>
            <TableHead className="text-right">Forecast</TableHead>
            {showTodate && <TableHead className="text-right">To Date</TableHead>}
            <TableHead className="text-right">Execution</TableHead>
            <TableHead className="text-right">%</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map((r) => (
            <TableRow
              key={r.label}
              className={cn('hover:bg-muted/40', r.emphasis && 'font-semibold')}
            >
              <TableCell className={cn(r.emphasis && 'text-foreground')}>
                {r.label}
              </TableCell>
              <TableCell className="text-right tabular-nums text-muted-foreground">
                {formatCompact(r.forecast)}
              </TableCell>
              {showTodate && (
                <TableCell className="text-right tabular-nums">
                  {formatCompact(r.todate)}
                </TableCell>
              )}
              <TableCell className="text-right tabular-nums">
                {formatCompact(r.execution)}
              </TableCell>
              <TableCell
                className={cn(
                  'text-right font-medium tabular-nums',
                  r.pct >= 100
                    ? 'text-success'
                    : r.pct < 20
                      ? 'text-destructive'
                      : 'text-foreground',
                )}
              >
                {r.pct}%
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}

export function YearlyBudgetPerformance({ data }: { data: BudgetLineDto[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Yearly Budget Performance</CardTitle>
        <p className="text-sm text-muted-foreground">
          Forecast vs to-date vs execution for the fiscal year
        </p>
      </CardHeader>
      <CardContent>
        <BudgetTable rows={data} />
      </CardContent>
    </Card>
  )
}

export function MonthlyBudgetPerformance({ data }: { data: BudgetLineDto[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Monthly Budget Performance</CardTitle>
        <p className="text-sm text-muted-foreground">
          Forecast vs execution for the current month
        </p>
      </CardHeader>
      <CardContent>
        <BudgetTable rows={data} showTodate={false} />
      </CardContent>
    </Card>
  )
}

/* ---------------- Costs Analysis (grouped bars) ---------------- */

export function CostsAnalysis({ data }: { data: CostGroup[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Costs Analysis</CardTitle>
        <p className="text-sm text-muted-foreground">
          To-date vs execution across cost groups
        </p>
      </CardHeader>
      <CardContent>
        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} barGap={6}>
              <CartesianGrid
                strokeDasharray="3 3"
                vertical={false}
                stroke="var(--color-border)"
              />
              <XAxis
                dataKey="name"
                tickLine={false}
                axisLine={false}
                fontSize={11}
                stroke="var(--color-muted-foreground)"
                interval={0}
              />
              <YAxis
                tickFormatter={(v) => formatCompact(v)}
                tickLine={false}
                axisLine={false}
                fontSize={11}
                stroke="var(--color-muted-foreground)"
                width={56}
              />
              <Tooltip
                cursor={{ fill: 'var(--color-muted)' }}
                contentStyle={tooltipStyle}
                formatter={(v: unknown) => formatCurrency(Number(v) || 0)}
              />
              <Legend iconType="circle" wrapperStyle={{ fontSize: 12, paddingTop: 8 }} />
              <Bar dataKey="todate" name="To Date" fill="var(--color-chart-1)" radius={[4, 4, 0, 0]} />
              <Bar dataKey="execution" name="Execution" fill="var(--color-chart-4)" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}

/* ---------------- Cost Analysis by department (table) ---------------- */

export function CostAnalysisByDept({ data }: { data: DeptCost[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Cost Analysis by Department</CardTitle>
        <p className="text-sm text-muted-foreground">
          Forecast vs to-date vs execution per department
        </p>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead>Department</TableHead>
                <TableHead className="text-right">Forecast</TableHead>
                <TableHead className="text-right">To Date</TableHead>
                <TableHead className="text-right">Execution</TableHead>
                <TableHead className="text-right">%</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.map((r) => (
                <TableRow key={r.department} className="hover:bg-muted/40">
                  <TableCell className="font-medium">{r.department}</TableCell>
                  <TableCell className="text-right tabular-nums text-muted-foreground">
                    {formatCompact(r.forecast)}
                  </TableCell>
                  <TableCell className="text-right tabular-nums">
                    {formatCompact(r.todate)}
                  </TableCell>
                  <TableCell className="text-right tabular-nums">
                    {formatCompact(r.execution)}
                  </TableCell>
                  <TableCell className="text-right font-medium tabular-nums">
                    {r.pct}%
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  )
}
