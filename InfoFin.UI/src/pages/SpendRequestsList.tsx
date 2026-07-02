'use client'

import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { Plus, Search, Eye, Pencil, ChevronLeft, ChevronRight } from 'lucide-react'
import { Button, buttonVariants } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { StatusBadge } from '@/components/requests/status-badge'
import { RequestSlideover } from '@/components/requests/request-slideover'
import {
  spendRequests,
  formatCurrency,
  STATUS_META,
  type RequestStatus,
  type SpendRequest,
} from '@/lib/mock-data'

const PAGE_SIZE = 5

export default function RequestsPage() {
  const [query, setQuery] = useState('')
  const [status, setStatus] = useState<RequestStatus | 'all'>('all')
  const [page, setPage] = useState(1)
  const [selected, setSelected] = useState<SpendRequest | null>(null)

  const filtered = useMemo(() => {
    return spendRequests.filter((r) => {
      const matchesQuery =
        r.ref.toLowerCase().includes(query.toLowerCase()) ||
        r.vendor.toLowerCase().includes(query.toLowerCase()) ||
        r.department.toLowerCase().includes(query.toLowerCase())
      const matchesStatus = status === 'all' || r.status === status
      return matchesQuery && matchesStatus
    })
  }, [query, status])

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const current = Math.min(page, totalPages)
  const rows = filtered.slice((current - 1) * PAGE_SIZE, current * PAGE_SIZE)

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 sm:min-w-64 sm:flex-none">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={query}
            onChange={(e) => {
              setQuery(e.target.value)
              setPage(1)
            }}
            placeholder="Search reference, vendor, department…"
            className="pl-9 sm:w-72"
          />
        </div>
        <Select
          value={status}
          onChange={(e) => {
            setStatus(e.target.value as RequestStatus | 'all')
            setPage(1)
          }}
          className="h-10 w-48"
        >
          <option value="all">All statuses</option>
          {(Object.keys(STATUS_META) as RequestStatus[]).map((s) => (
            <option key={s} value={s}>
              {STATUS_META[s].label}
            </option>
          ))}
        </Select>
        <Link to="/expenses/requests/new"
          className={buttonVariants({ className: 'ml-auto' })}
        >
          <Plus className="size-4" />
          New Request
        </Link>
      </div>

      <Card>
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead className="pl-6">Actions</TableHead>
              <TableHead>Reference</TableHead>
              <TableHead>Department</TableHead>
              <TableHead>Category</TableHead>
              <TableHead className="text-right">Amount</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Assigned To</TableHead>
              <TableHead className="pr-6">Date</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((r) => (
              <TableRow
                key={r.id}
                className="cursor-pointer"
                onClick={() => setSelected(r)}
              >
                <TableCell className="pl-6">
                  <div className="flex items-center gap-1">
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      aria-label="View"
                      onClick={(e) => {
                        e.stopPropagation()
                        setSelected(r)
                      }}
                    >
                      <Eye className="size-4 text-blue-500" />
                    </Button>
                    <Link to={`/expenses/requests/new?id=${r.id}`}
                      onClick={(e) => e.stopPropagation()}
                      className={buttonVariants({
                        variant: 'ghost',
                        size: 'icon-sm',
                      })}
                      aria-label="Edit"
                    >
                      <Pencil className="size-4 text-amber-500" />
                    </Link>
                  </div>
                </TableCell>
                <TableCell className="font-mono text-sm font-medium">
                  {r.ref}
                </TableCell>
                <TableCell>{r.department}</TableCell>
                <TableCell className="text-muted-foreground">
                  {r.category}
                </TableCell>
                <TableCell className="text-right font-medium tabular-nums">
                  {formatCurrency(r.amount, r.currency)}
                </TableCell>
                <TableCell>
                  <StatusBadge status={r.status} />
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-[10px] font-semibold text-primary">
                      {r.assignedTo.split(' ').map((n) => n[0]).join('')}
                    </span>
                    <span className="text-sm">{r.assignedTo}</span>
                  </div>
                </TableCell>
                <TableCell className="pr-6 text-muted-foreground">
                  {r.date}
                </TableCell>
              </TableRow>
            ))}
            {rows.length === 0 && (
              <TableRow className="hover:bg-transparent">
                <TableCell
                  colSpan={8}
                  className="py-10 text-center text-muted-foreground"
                >
                  No requests match your filters.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>

        <div className="flex items-center justify-between border-t border-border px-6 py-3">
          <p className="text-sm text-muted-foreground">
            Showing {rows.length} of {filtered.length} requests
          </p>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="icon-sm"
              disabled={current <= 1}
              onClick={() => setPage(current - 1)}
              aria-label="Previous page"
            >
              <ChevronLeft className="size-4" />
            </Button>
            <span className="text-sm">
              Page {current} of {totalPages}
            </span>
            <Button
              variant="outline"
              size="icon-sm"
              disabled={current >= totalPages}
              onClick={() => setPage(current + 1)}
              aria-label="Next page"
            >
              <ChevronRight className="size-4" />
            </Button>
          </div>
        </div>
      </Card>

      <RequestSlideover request={selected} onClose={() => setSelected(null)} />
    </div>
  )
}
