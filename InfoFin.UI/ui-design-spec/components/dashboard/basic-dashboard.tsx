'use client'

import Link from 'next/link'
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
import { useSession } from '@/components/session-provider'
import { spendRequests, formatCurrency } from '@/lib/mock-data'

export function BasicDashboard() {
  const { name } = useSession()
  const mine = spendRequests.filter((r) => r.requester === name)
  const fallback = mine.length > 0 ? mine : spendRequests.slice(0, 4)

  const pending = fallback.filter((r) =>
    r.status.startsWith('pending'),
  ).length
  const approved = fallback.filter((r) => r.status === 'approved').length
  const declined = fallback.filter((r) => r.status === 'declined').length

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
        <Link href="/requests/new" className={buttonVariants()}>
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
              {fallback.map((r) => (
                <TableRow key={r.id}>
                  <TableCell className="pl-6">
                    <Link
                      href={`/requests/${r.id}`}
                      className="font-mono text-sm font-medium text-primary hover:underline"
                    >
                      {r.ref}
                    </Link>
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {r.category}
                  </TableCell>
                  <TableCell className="text-right font-medium tabular-nums">
                    {formatCurrency(r.amount, r.currency)}
                  </TableCell>
                  <TableCell>
                    <StatusBadge status={r.status} />
                  </TableCell>
                  <TableCell className="pr-6 text-muted-foreground">
                    {r.date}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
