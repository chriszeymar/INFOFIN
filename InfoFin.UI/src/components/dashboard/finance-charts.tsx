'use client'

import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
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
  costsAnalysis,
  costsBreakdown,
  costsPerType,
  executionLevel,
  costAnalysisByDept,
  yearlyBudgetPerformance,
  monthlyBudgetPerformance,
  formatCompact,
  formatCurrency,
  type BudgetLine,
} from '@/lib/mock-data'

const tooltipStyle = {
  borderRadius: 8,
  border: '1px solid var(--color-border)',
  background: 'var(--color-card)',
  fontSize: 12,
}

const typeColors = [
  'var(--color-chart-1)',
  'var(--color-chart-2)',
  'var(--color-chart-4)',
]

/* ---------------- Budget performance table ---------------- */

function BudgetTable({ rows }: { rows: BudgetLine[] }) {
  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow className="hover:bg-transparent">
            <TableHead>Budget</TableHead>
            <TableHead className="text-right">Forecast</TableHead>
            <TableHead className="text-right">To Date</TableHead>
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
                {formatCompact(r.yForecast)}
              </TableCell>
              <TableCell className="text-right tabular-nums">
                {formatCompact(r.todate)}
              </TableCell>
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

export function YearlyBudgetPerformance() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Yearly Budget Performance</CardTitle>
        <p className="text-sm text-muted-foreground">
          Forecast vs to-date vs execution for FY 2026
        </p>
      </CardHeader>
      <CardContent>
        <BudgetTable rows={yearlyBudgetPerformance} />
      </CardContent>
    </Card>
  )
}

export function MonthlyBudgetPerformance() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Monthly Budget Performance</CardTitle>
        <p className="text-sm text-muted-foreground">
          Forecast vs to-date vs execution for the current month
        </p>
      </CardHeader>
      <CardContent>
        <BudgetTable rows={monthlyBudgetPerformance} />
      </CardContent>
    </Card>
  )
}

/* ---------------- Costs Analysis (grouped bars) ---------------- */

export function CostsAnalysis() {
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
            <BarChart data={costsAnalysis} barGap={6}>
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

/* ---------------- Costs Breakdown (grouped bars) ---------------- */

export function CostsBreakdown() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Costs Breakdown</CardTitle>
        <p className="text-sm text-muted-foreground">
          Fixed and variable costs, to-date vs execution
        </p>
      </CardHeader>
      <CardContent>
        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={costsBreakdown} barGap={6}>
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

/* ---------------- Execution Level (horizontal bars) ---------------- */

export function ExecutionLevel() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Execution Level</CardTitle>
        <p className="text-sm text-muted-foreground">
          Execution as a percentage of forecast per budget line
        </p>
      </CardHeader>
      <CardContent>
        <div className="h-80 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={executionLevel}
              layout="vertical"
              margin={{ left: 24, right: 24 }}
            >
              <CartesianGrid
                strokeDasharray="3 3"
                horizontal={false}
                stroke="var(--color-border)"
              />
              <XAxis
                type="number"
                tickFormatter={(v) => `${v}%`}
                tickLine={false}
                axisLine={false}
                fontSize={11}
                stroke="var(--color-muted-foreground)"
              />
              <YAxis
                type="category"
                dataKey="label"
                tickLine={false}
                axisLine={false}
                fontSize={11}
                width={130}
                stroke="var(--color-muted-foreground)"
              />
              <Tooltip
                cursor={{ fill: 'var(--color-muted)' }}
                contentStyle={tooltipStyle}
                formatter={(v: unknown) => `${Number(v) || 0}%`}
              />
              <Bar dataKey="pct" name="Execution %" radius={[0, 4, 4, 0]}>
                {executionLevel.map((entry) => (
                  <Cell
                    key={entry.label}
                    fill={
                      entry.pct >= 100
                        ? 'var(--color-chart-2)'
                        : 'var(--color-chart-1)'
                    }
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}

/* ---------------- Costs per Type (donut) ---------------- */

export function CostsPerType() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Costs per Type</CardTitle>
        <p className="text-sm text-muted-foreground">
          Share of executed cost by type
        </p>
      </CardHeader>
      <CardContent>
        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={costsPerType}
                dataKey="value"
                nameKey="name"
                innerRadius={55}
                outerRadius={95}
                paddingAngle={2}
                stroke="var(--color-card)"
                strokeWidth={2}
              >
                {costsPerType.map((entry, i) => (
                  <Cell key={entry.name} fill={typeColors[i % typeColors.length]} />
                ))}
              </Pie>
              <Tooltip
                formatter={(v: unknown) => formatCurrency(Number(v) || 0)}
                contentStyle={tooltipStyle}
              />
              <Legend iconType="circle" wrapperStyle={{ fontSize: 12, paddingTop: 8 }} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}

/* ---------------- Cost Analysis by department (table) ---------------- */

export function CostAnalysisByDept() {
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
              {costAnalysisByDept.map((r) => (
                <TableRow key={r.department} className="hover:bg-muted/40">
                  <TableCell className="font-medium">{r.department}</TableCell>
                  <TableCell className="text-right tabular-nums text-muted-foreground">
                    {formatCompact(r.yForecast)}
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
