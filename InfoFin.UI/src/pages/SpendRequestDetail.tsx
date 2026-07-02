'use client'

import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import {
  ArrowLeft,
  Paperclip,
  Download,
  Check,
  X,
  Building2,
  Tag,
  Store,
  CalendarDays,
  UserCircle,
  UserCheck,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { StatusBadge } from '@/components/requests/status-badge'
import { ApprovalTimeline } from '@/components/requests/approval-timeline'
import { APPROVAL_STEPS, spendRequests, formatCurrency } from '@/lib/mock-data'

export default function RequestDetailPage() {
  const { id } = useParams<{ id: string }>()
  const request = spendRequests.find((r) => r.id === id)
  const [action, setAction] = useState<'approve' | 'decline' | null>(null)
  const [comment, setComment] = useState('')
  const [resolved, setResolved] = useState<'approve' | 'decline' | null>(null)

  if (!request) {
    return (
      <div className="flex flex-col items-center gap-4 py-20 text-center">
        <p className="text-muted-foreground">Request not found.</p>
        <Link to="/expenses/requests">
          <Button variant="outline">Back to requests</Button>
        </Link>
      </div>
    )
  }

  const currentStep = request.timeline.find((t) => t.state === 'current')
  const canAct =
    !resolved &&
    request.status !== 'completed' &&
    request.status !== 'declined'

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center gap-4">
        <Link to="/expenses/requests">
          <Button variant="ghost" size="icon-sm" aria-label="Back">
            <ArrowLeft className="size-4" />
          </Button>
        </Link>
        <div className="flex items-center gap-3">
          <h2 className="font-mono text-lg font-semibold">{request.ref}</h2>
          <StatusBadge status={request.status} />
        </div>
        {currentStep && (
          <span className="text-sm text-muted-foreground">
            Awaiting: {currentStep.step} ({currentStep.actor})
          </span>
        )}
      </div>

      {/* step indicator */}
      <div className="flex items-center gap-2 overflow-x-auto rounded-lg border border-border bg-card p-4">
        {APPROVAL_STEPS.map((step, i) => {
          const t = request.timeline[i]
          const done = t?.state === 'done'
          const active = t?.state === 'current'
          const declined = t?.state === 'declined'
          return (
            <div key={step} className="flex items-center gap-2">
              <span
                className={`flex size-7 items-center justify-center rounded-full text-xs font-semibold ${
                  done
                    ? 'bg-success text-success-foreground'
                    : declined
                      ? 'bg-destructive text-destructive-foreground'
                      : active
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted text-muted-foreground'
                }`}
              >
                {done ? <Check className="size-4" /> : i + 1}
              </span>
              <span
                className={`whitespace-nowrap text-sm ${active ? 'font-medium' : 'text-muted-foreground'}`}
              >
                {step}
              </span>
              {i < APPROVAL_STEPS.length - 1 && (
                <span className="mx-1 h-px w-8 bg-border" />
              )}
            </div>
          )
        })}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="flex flex-col gap-6 lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Request Details</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 gap-5 sm:grid-cols-2">
              <Detail icon={Building2} label="Department" value={request.department} />
              <Detail icon={Tag} label="Category" value={request.category} />
              <Detail icon={Store} label="Vendor" value={request.vendor} />
              <Detail icon={CalendarDays} label="Date submitted" value={request.date} />
              <Detail icon={UserCircle} label="Reported by" value={request.reportedBy} />
              <Detail icon={UserCheck} label="Assigned to" value={request.assignedTo} />
              <div className="sm:col-span-2">
                <p className="text-xs text-muted-foreground">Amount</p>
                <p className="text-lg font-semibold">
                  {formatCurrency(request.amount, request.currency)}
                  <span className="ml-2 text-sm font-normal text-muted-foreground">
                    ≈ {formatCurrency(request.fcAmount, 'USD')} @ {request.exchangeRate}
                  </span>
                </p>
              </div>
              <div className="sm:col-span-2">
                <p className="mb-1 text-xs text-muted-foreground">
                  Description / Justification
                </p>
                <p className="text-sm leading-relaxed">{request.description}</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Attachments</CardTitle>
            </CardHeader>
            <CardContent>
              {request.attachments.length === 0 ? (
                <p className="text-sm text-muted-foreground">No attachments.</p>
              ) : (
                <ul className="flex flex-col gap-2">
                  {request.attachments.map((a) => (
                    <li
                      key={a.name}
                      className="flex items-center gap-3 rounded-md border border-border px-3 py-2.5 text-sm"
                    >
                      <Paperclip className="size-4 text-muted-foreground" />
                      <span className="flex-1 truncate font-medium">{a.name}</span>
                      <span className="text-xs text-muted-foreground">{a.size}</span>
                      <Button variant="ghost" size="icon-sm" aria-label="Download">
                        <Download className="size-4" />
                      </Button>
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="flex flex-col gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Approval History</CardTitle>
            </CardHeader>
            <CardContent>
              <ApprovalTimeline timeline={request.timeline} />
            </CardContent>
          </Card>

          {canAct && (
            <Card>
              <CardHeader>
                <CardTitle>Your Decision</CardTitle>
              </CardHeader>
              <CardContent className="flex gap-3">
                <Button
                  className="flex-1 bg-success text-success-foreground hover:bg-success/90"
                  onClick={() => setAction('approve')}
                >
                  <Check className="size-4" />
                  Approve
                </Button>
                <Button
                  variant="destructive"
                  className="flex-1 bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  onClick={() => setAction('decline')}
                >
                  <X className="size-4" />
                  Decline
                </Button>
              </CardContent>
            </Card>
          )}

          {resolved && (
            <Card>
              <CardContent className="pt-5">
                <p className="text-sm">
                  You{' '}
                  <span
                    className={
                      resolved === 'approve'
                        ? 'font-medium text-success'
                        : 'font-medium text-destructive'
                    }
                  >
                    {resolved === 'approve' ? 'approved' : 'declined'}
                  </span>{' '}
                  this request.
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {action && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <button
            className="absolute inset-0 bg-foreground/40"
            onClick={() => setAction(null)}
            aria-label="Close"
          />
          <Card className="relative w-full max-w-md">
            <CardHeader>
              <CardTitle>
                {action === 'approve' ? 'Approve request' : 'Decline request'}
              </CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
              <div className="flex flex-col gap-2">
                <Label htmlFor="comment">
                  Comment {action === 'decline' && '(required)'}
                </Label>
                <Textarea
                  id="comment"
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="Add a note for the record…"
                />
              </div>
              <div className="flex justify-end gap-3">
                <Button variant="outline" onClick={() => setAction(null)}>
                  Cancel
                </Button>
                <Button
                  disabled={action === 'decline' && !comment.trim()}
                  className={
                    action === 'approve'
                      ? 'bg-success text-success-foreground hover:bg-success/90'
                      : 'bg-destructive text-destructive-foreground hover:bg-destructive/90'
                  }
                  onClick={() => {
                    setResolved(action)
                    setAction(null)
                    setComment('')
                  }}
                >
                  Confirm
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}

function Detail({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ComponentType<{ className?: string }>
  label: string
  value: string
}) {
  return (
    <div className="flex items-start gap-3">
      <div className="flex size-9 items-center justify-center rounded-md bg-muted text-muted-foreground">
        <Icon className="size-4" />
      </div>
      <div>
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="text-sm font-medium">{value}</p>
      </div>
    </div>
  )
}
