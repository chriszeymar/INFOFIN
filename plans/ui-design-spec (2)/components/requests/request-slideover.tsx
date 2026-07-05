'use client'

import Link from 'next/link'
import { X, Paperclip, ArrowRight } from 'lucide-react'
import { Button, buttonVariants } from '@/components/ui/button'
import { StatusBadge } from '@/components/requests/status-badge'
import { ApprovalTimeline } from '@/components/requests/approval-timeline'
import { formatCurrency, type SpendRequest } from '@/lib/mock-data'

export function RequestSlideover({
  request,
  onClose,
}: {
  request: SpendRequest | null
  onClose: () => void
}) {
  if (!request) return null

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <button
        className="absolute inset-0 bg-foreground/30"
        onClick={onClose}
        aria-label="Close panel"
      />
      <div className="relative flex h-full w-full max-w-md flex-col overflow-y-auto bg-card shadow-xl">
        <div className="flex items-center justify-between border-b border-border p-5">
          <div className="flex flex-col gap-1">
            <span className="font-mono text-sm font-semibold">
              {request.ref}
            </span>
            <StatusBadge status={request.status} />
          </div>
          <Button variant="ghost" size="icon" onClick={onClose} aria-label="Close">
            <X className="size-5" />
          </Button>
        </div>

        <div className="flex flex-col gap-5 p-5">
          <dl className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <dt className="text-xs text-muted-foreground">Department</dt>
              <dd className="font-medium">{request.department}</dd>
            </div>
            <div>
              <dt className="text-xs text-muted-foreground">Category</dt>
              <dd className="font-medium">{request.category}</dd>
            </div>
            <div>
              <dt className="text-xs text-muted-foreground">Vendor</dt>
              <dd className="font-medium">{request.vendor}</dd>
            </div>
            <div>
              <dt className="text-xs text-muted-foreground">Amount</dt>
              <dd className="font-semibold">
                {formatCurrency(request.amount, request.currency)}
              </dd>
            </div>
          </dl>

          <div>
            <p className="mb-1 text-xs text-muted-foreground">Description</p>
            <p className="text-sm leading-relaxed">{request.description}</p>
          </div>

          {request.attachments.length > 0 && (
            <div>
              <p className="mb-2 text-xs text-muted-foreground">Attachments</p>
              <ul className="flex flex-col gap-2">
                {request.attachments.map((a) => (
                  <li
                    key={a.name}
                    className="flex items-center gap-2 rounded-md border border-border px-3 py-2 text-sm"
                  >
                    <Paperclip className="size-4 text-muted-foreground" />
                    <span className="flex-1 truncate">{a.name}</span>
                    <span className="text-xs text-muted-foreground">
                      {a.size}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div>
            <p className="mb-3 text-xs text-muted-foreground">
              Approval Timeline
            </p>
            <ApprovalTimeline timeline={request.timeline} />
          </div>

          <Link
            href={`/requests/${request.id}`}
            className={buttonVariants({ className: 'w-full' })}
          >
            Open full view
            <ArrowRight className="size-4" />
          </Link>
        </div>
      </div>
    </div>
  )
}
