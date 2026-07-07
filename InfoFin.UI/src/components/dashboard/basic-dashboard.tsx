'use client'

import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Plus, Clock, CheckCircle2, XCircle } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { buttonVariants } from '@/components/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { StatusBadge } from '@/components/requests/status-badge'
import { useSession } from '@/auth/AuthContext'
import { getSpendRequests } from '@/api/spendRequestService'
import {
  flattenSpendRequest, formatCurrency, formatDate,
  type SpendRequest, type SpendRequestGridRow,
} from '@/types/spend-request'

export function BasicDashboard() {
  const { name } = useSession()
  const [requests, setRequests] = useState<SpendRequest[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getSpendRequests()
      .then(setRequests)
      .catch(() => setRequests([]))
      .finally(() => setLoading(false))
  }, [])

  const rows: SpendRequestGridRow[] = requests.slice(0, 4).map(flattenSpendRequest)

  const pending = rows.filter((r) => r.status === 'Posted' || r.status === 'UnderReview').length
  const approved = rows.filter((r) => r.status === 'Approved' || r.status === 'Completed').length
  const declined = rows.filter((r) => r.status === 'Declined').length

  const stats = [
    { label: 'Pending', value: pending, icon: Clock, tint: 'bg-warning/15 text-warning-foreground' },
    { label: 'Approved', value: approved, icon: CheckCircle2, tint: 'bg-success/12 text-success' },
    { label: 'Declined', value: declined, icon: XCircle, tint: 'bg-destructive/10 text-destructive' },
  ]

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold tracking-tight">
            Welcome back, {name.split(' ')[0]}
          </h2>
          <p className="text-sm text-muted-foreground">
            Here is the status of your spend requests.
          </p>
        </div>
        <Link to="/expenses/requests/new" className={buttonVariants()}>
          <Plus className="size-4" />
          New Request
        </Link>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {stats.map((s) => {
          const Icon = s.icon
          return (
            <Card key={s.label}>
              <CardContent className="flex items-center justify-between p-5">
                <div className="flex flex-col gap-1">
                  <span className="text-sm text-muted-foreground">{s.label}</span>
                  <span className="text-2xl font-semibold tracking-tight">
                    {s.value}
                  </span>
                </div>
                <div className={`flex size-10 items-center justify-center rounded-lg ${s.tint}`}>
                  <Icon className="size-5" />
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>My Requests</CardTitle>
        </CardHeader>
        <CardContent className="px-0 pb-0">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead className="pl-6">Reference</TableHead>
                <TableHead>Category</TableHead>
                <TableHead className="text-right">Amount</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="pr-6">Date</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((r) => (
                <TableRow key={r.id}>
                  <TableCell className="pl-6">
                    <Link to={`/expenses/requests/${r.id}`}
                      className="font-mono text-sm font-medium text-primary hover:underline"
                    >
                      {r.referenceNumber}
                    </Link>
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {r.categoryName}
                  </TableCell>
                  <TableCell className="text-right font-medium tabular-nums">
                    {formatCurrency(r.amount, r.currencyCode)}
                  </TableCell>
                  <TableCell>
                    <StatusBadge status={r.status} />
                  </TableCell>
                  <TableCell className="pr-6 text-muted-foreground">
                    {formatDate(r.createDT)}
                  </TableCell>
                </TableRow>
              ))}
              {!loading && rows.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} className="py-6 text-center text-muted-foreground">
                    No requests yet. <Link to="/expenses/requests/new" className="text-primary hover:underline">Create one</Link>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
