import { Wallet, TrendingDown, PiggyBank, LineChart } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { formatCompact } from '@/lib/mock-data'
import type { KpiData } from '@/lib/dashboard-data'

function fmtK(n: number) {
  if (Math.abs(n) >= 1_000_000) return `$${(n / 1_000_000).toFixed(1)}M`
  if (Math.abs(n) >= 1_000) return `$${(n / 1_000).toFixed(0)}K`
  return `$${n}`
}

export function KpiCards({ data }: { data: KpiData }) {
  const spentPct = data.totalBudget > 0 ? Math.round((data.totalSpent / data.totalBudget) * 100) : 0
  const remainingPct = 100 - spentPct

  const items = [
    {
      label: 'Total Budget',
      value: fmtK(data.totalBudget),
      icon: Wallet,
      tint: 'bg-primary/10 text-primary',
      delta: 'FY approved',
    },
    {
      label: 'Total Spent',
      value: fmtK(data.totalSpent),
      icon: TrendingDown,
      tint: 'bg-warning/15 text-warning-foreground',
      delta: `${spentPct}% of budget`,
    },
    {
      label: 'Remaining',
      value: fmtK(data.remaining),
      icon: PiggyBank,
      tint: 'bg-success/12 text-success',
      delta: `${remainingPct}% available`,
    },
    {
      label: 'EBIT',
      value: fmtK(data.ebit),
      icon: LineChart,
      tint: 'bg-accent text-accent-foreground',
      delta: 'Earnings before interest & tax',
    },
  ]

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {items.map((item) => {
        const Icon = item.icon
        return (
          <Card key={item.label}>
            <CardContent className="flex items-start justify-between p-5">
              <div className="flex flex-col gap-1">
                <span className="text-sm text-muted-foreground">
                  {item.label}
                </span>
                <span className="text-2xl font-semibold tracking-tight">
                  {item.value}
                </span>
                <span className="text-xs text-muted-foreground">
                  {item.delta}
                </span>
              </div>
              <div
                className={`flex size-10 items-center justify-center rounded-lg ${item.tint}`}
              >
                <Icon className="size-5" />
              </div>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
