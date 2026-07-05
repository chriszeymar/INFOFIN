import { Wallet, TrendingDown, PiggyBank, LineChart } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { kpis, formatCompact } from '@/lib/mock-data'

const items = [
  {
    label: 'Total Budget',
    value: kpis.totalBudget,
    icon: Wallet,
    tint: 'bg-primary/10 text-primary',
    delta: 'FY 2026 approved',
  },
  {
    label: 'Total Spent',
    value: kpis.totalSpent,
    icon: TrendingDown,
    tint: 'bg-warning/15 text-warning-foreground',
    delta: '64% of budget',
  },
  {
    label: 'Remaining',
    value: kpis.remaining,
    icon: PiggyBank,
    tint: 'bg-success/12 text-success',
    delta: '36% available',
  },
  {
    label: 'EBIT',
    value: kpis.ebit,
    icon: LineChart,
    tint: 'bg-accent text-accent-foreground',
    delta: '+8.2% vs forecast',
  },
]

export function KpiCards() {
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
                  {formatCompact(item.value)}
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
