'use client'

import { Fragment } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { ChevronRight, Home } from 'lucide-react'
import { spendRequests } from '@/lib/mock-data'

const LABELS: Record<string, string> = {
  dashboard: 'Dashboard',
  requests: 'Requests',
  new: 'New Request',
  budgets: 'Budget Management',
  'master-data': 'Master Data',
  users: 'User Management',
  profile: 'Profile',
}

function labelFor(segment: string, prevSegment?: string) {
  if (LABELS[segment]) return LABELS[segment]
  // Dynamic request id -> show its reference
  if (prevSegment === 'requests') {
    const req = spendRequests.find((r) => r.id === segment)
    if (req) return req.ref
  }
  return segment.charAt(0).toUpperCase() + segment.slice(1)
}

export function Breadcrumb() {
  const pathname = usePathname()
  const segments = pathname.split('/').filter(Boolean)

  const crumbs = segments.map((segment, i) => ({
    label: labelFor(segment, segments[i - 1]),
    href: '/' + segments.slice(0, i + 1).join('/'),
    isLast: i === segments.length - 1,
  }))

  return (
    <nav
      aria-label="Breadcrumb"
      className="flex h-11 items-center gap-1.5 border-b border-border bg-card px-6 text-sm"
    >
      <Link
        href="/dashboard"
        className="flex items-center text-muted-foreground transition-colors hover:text-foreground"
        aria-label="Home"
      >
        <Home className="size-4" />
      </Link>
      {crumbs.map((crumb) => (
        <Fragment key={crumb.href}>
          <ChevronRight className="size-4 text-muted-foreground/50" />
          {crumb.isLast ? (
            <span className="font-medium text-foreground">{crumb.label}</span>
          ) : (
            <Link
              href={crumb.href}
              className="text-muted-foreground transition-colors hover:text-foreground"
            >
              {crumb.label}
            </Link>
          )}
        </Fragment>
      ))}
    </nav>
  )
}
