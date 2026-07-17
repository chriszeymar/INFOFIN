import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { formatCurrency } from '@/lib/mock-data'
import type { OverspentItem } from '@/lib/dashboard-data'

export function OverspentTable({ data }: { data: OverspentItem[] }) {
  if (data.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Top Overspent Accounts</CardTitle>
          <p className="text-sm text-muted-foreground">Accounts exceeding their approved budget</p>
        </CardHeader>
        <CardContent>
          <p className="py-8 text-center text-sm text-muted-foreground">No overspent accounts — all within budget.</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Top Overspent Accounts</CardTitle>
        <p className="text-sm text-muted-foreground">
          Accounts exceeding their approved budget
        </p>
      </CardHeader>
      <CardContent className="px-0">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead className="pl-6">Account</TableHead>
              <TableHead>Department</TableHead>
              <TableHead className="text-right">Budget</TableHead>
              <TableHead className="text-right">Spent</TableHead>
              <TableHead className="pr-6 text-right">Overspend</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.map((row) => {
              const over = row.spent - row.budget
              const pct = ((over / row.budget) * 100).toFixed(1)
              return (
                <TableRow key={row.category + row.department} className="bg-destructive/[0.04]">
                  <TableCell className="pl-6 font-medium">
                    {row.category}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {row.department}
                  </TableCell>
                  <TableCell className="text-right tabular-nums">
                    {formatCurrency(row.budget)}
                  </TableCell>
                  <TableCell className="text-right font-medium tabular-nums text-destructive">
                    {formatCurrency(row.spent)}
                  </TableCell>
                  <TableCell className="pr-6 text-right">
                    <Badge variant="danger">
                      +{formatCurrency(over)} ({pct}%)
                    </Badge>
                  </TableCell>
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}
