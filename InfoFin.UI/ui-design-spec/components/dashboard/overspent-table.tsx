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
import { overspentCategories, formatCurrency } from '@/lib/mock-data'

export function OverspentTable() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Top Overspent Categories</CardTitle>
        <p className="text-sm text-muted-foreground">
          Categories exceeding their approved budget
        </p>
      </CardHeader>
      <CardContent className="px-0">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead className="pl-6">Category</TableHead>
              <TableHead>Department</TableHead>
              <TableHead className="text-right">Budget</TableHead>
              <TableHead className="text-right">Spent</TableHead>
              <TableHead className="pr-6 text-right">Overspend</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {overspentCategories.map((row) => {
              const over = row.spent - row.budget
              const pct = ((over / row.budget) * 100).toFixed(1)
              return (
                <TableRow key={row.category} className="bg-destructive/[0.04]">
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
