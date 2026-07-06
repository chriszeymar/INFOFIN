import { Check, X, Clock, Circle } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { SpendRequest } from '@/lib/mock-data'

export function ApprovalTimeline({
  timeline,
}: {
  timeline: SpendRequest['timeline']
}) {
  return (
    <ol className="flex flex-col">
      {timeline.map((step, i) => {
        const last = i === timeline.length - 1
        return (
          <li key={i} className="flex gap-3">
            <div className="flex flex-col items-center">
              <span
                className={cn(
                  'flex size-7 shrink-0 items-center justify-center rounded-full',
                  step.state === 'done' && 'bg-success text-success-foreground',
                  step.state === 'current' && 'bg-primary text-primary-foreground',
                  step.state === 'declined' &&
                    'bg-destructive text-destructive-foreground',
                  step.state === 'pending' && 'bg-muted text-muted-foreground',
                )}
              >
                {step.state === 'done' && <Check className="size-4" />}
                {step.state === 'current' && <Clock className="size-4" />}
                {step.state === 'declined' && <X className="size-4" />}
                {step.state === 'pending' && <Circle className="size-3" />}
              </span>
              {!last && (
                <span
                  className={cn(
                    'my-1 w-px flex-1',
                    step.state === 'done' ? 'bg-success/40' : 'bg-border',
                  )}
                />
              )}
            </div>
            <div className={cn('pb-5', last && 'pb-0')}>
              <p className="text-sm font-medium leading-tight">{step.step}</p>
              <p className="text-xs text-muted-foreground">
                {step.actor}
                {step.date ? ` • ${step.date}` : ''}
              </p>
              {step.comment && (
                <p className="mt-1 rounded-md bg-muted px-2 py-1 text-xs text-muted-foreground">
                  {step.comment}
                </p>
              )}
            </div>
          </li>
        )
      })}
    </ol>
  )
}
