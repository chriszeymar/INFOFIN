'use client'

import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { Plus, Search, Eye, Pencil, ChevronLeft, ChevronRight, Loader2, Download, FileSpreadsheet, FileText } from 'lucide-react'
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
import { getSpendRequests } from '@/api/spendRequestService'
import {
  flattenSpendRequest,
  formatCurrency,
  formatDate,
  STATUS_META,
  type SpendRequest,
  type SpendRequestGridRow,
  type SpendRequestStatus,
} from '@/types/spend-request'
import { exportSpendRequestsToExcel } from '@/lib/export/spend-requests-export-excel'
import { exportSpendRequestsToPdf } from '@/lib/export/spend-requests-export-pdf'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

const PAGE_SIZE = 5

export default function RequestsPage() {
  const [allRequests, setAllRequests] = useState<SpendRequest[]>([])
  const [loading, setLoading] = useState(true)
  const [query, setQuery] = useState('')
  const [status, setStatus] = useState<SpendRequestStatus | 'all'>('all')
  const [page, setPage] = useState(1)
  const [selected, setSelected] = useState<SpendRequest | null>(null)
  const [exporting, setExporting] = useState(false)

  useEffect(() => {
    setLoading(true)
    getSpendRequests(status === 'all' ? undefined : status)
      .then(setAllRequests)
      .catch(() => setAllRequests([]))
      .finally(() => setLoading(false))
  }, [status])

  const filtered = useMemo(() => {
    return allRequests.filter((r) => {
      const row = flattenSpendRequest(r)
      const q = query.toLowerCase()
      return (
        row.referenceNumber.toLowerCase().includes(q) ||
        row.departmentName.toLowerCase().includes(q) ||
        (row.assignedToEmail ?? '').toLowerCase().includes(q)
      )
    })
  }, [allRequests, query])

  const handleExport = async (format: 'xlsx' | 'pdf') => {
    setExporting(true)
    try {
      const exportRows: SpendRequestGridRow[] = filtered.map(flattenSpendRequest)
      const exportOptions = { status, searchQuery: query }
      if (format === 'xlsx') {
        await exportSpendRequestsToExcel(exportRows, exportOptions)
      } else {
        await exportSpendRequestsToPdf(exportRows, exportOptions)
      }
    } catch (err) {
      console.error('Export failed:', err)
    } finally {
      setExporting(false)
    }
  }

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const current = Math.min(page, totalPages)
  const rows: SpendRequestGridRow[] = filtered
    .slice((current - 1) * PAGE_SIZE, current * PAGE_SIZE)
    .map(flattenSpendRequest)

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
            placeholder="Search reference, department, assignee…"
            className="pl-9 sm:w-72"
          />
        </div>
        <Select
          value={status}
          onChange={(e) => {
            setStatus(e.target.value as SpendRequestStatus | 'all')
            setPage(1)
          }}
          className="h-10 w-48"
        >
          <option value="all">All statuses</option>
          {(Object.keys(STATUS_META) as SpendRequestStatus[]).map((s) => (
            <option key={s} value={s}>
              {STATUS_META[s].label}
            </option>
          ))}
        </Select>
        <div className="ml-auto flex items-center gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="gap-1.5" disabled={exporting || filtered.length === 0}>
                {exporting ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : (
                  <Download className="size-4" />
                )}
                Export
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-44">
              <DropdownMenuItem onClick={() => handleExport('xlsx')} className="gap-2">
                <FileSpreadsheet className="size-4 text-green-600" />
                Export to Excel
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleExport('pdf')} className="gap-2">
                <FileText className="size-4 text-red-500" />
                Export to PDF
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <Link to="/expenses/requests/new"
            className={buttonVariants({ className: '' })}
          >
            <Plus className="size-4" />
            New Request
          </Link>
        </div>
      </div>

      <Card>
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="size-6 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <>
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <TableHead className="pl-6">Actions</TableHead>
                  <TableHead>Reference</TableHead>
                  <TableHead>Department</TableHead>
                  <TableHead>Account</TableHead>
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
                    onClick={() => {
                      const full = allRequests.find((x) => x.id === r.id)
                      if (full) setSelected(full)
                    }}
                  >
                    <TableCell className="pl-6">
                      <div className="flex items-center gap-1">
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          aria-label="View"
                          onClick={(e) => {
                            e.stopPropagation()
                            const full = allRequests.find((x) => x.id === r.id)
                            if (full) setSelected(full)
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
                      {r.referenceNumber}
                    </TableCell>
                    <TableCell>{r.departmentName}</TableCell>
                    <TableCell className="text-muted-foreground">
                      {r.categoryName}
                    </TableCell>
                    <TableCell className="text-right font-medium tabular-nums">
                      {formatCurrency(r.amount, r.currencyCode)}
                    </TableCell>
                    <TableCell>
                      <StatusBadge status={r.status} />
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-[10px] font-semibold text-primary">
                          {(r.assignedToEmail ?? '?')[0].toUpperCase()}
                        </span>
                        <span className="text-sm">
                          {r.assignedToEmail ?? '\u2014'}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="pr-6 text-muted-foreground">
                      {formatDate(r.createDT)}
                    </TableCell>
                  </TableRow>
                ))}
                {rows.length === 0 && !loading && (
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
          </>
        )}
      </Card>

      <RequestSlideover request={selected} onClose={() => setSelected(null)} />
    </div>
  )
}
