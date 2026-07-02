'use client'

import { Fragment } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { ChevronRight, Home, LogOut } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useSession } from '@/auth/AuthContext'
import { spendRequests } from '@/lib/mock-data'

const LABELS: Record<string, string> = {
  dashboard: 'Dashboard',
  expenses: 'Expenses',
  'spend-requests': 'Requests',
  requests: 'Requests',
  new: 'New Request',
  budgets: 'Budget Management',
  'master-data': 'Master Data',
  users: 'User Management',
  profile: 'Profile',
}

function labelFor(segment: string, prevSegment?: string) {
  if (LABELS[segment]) return LABELS[segment]
  if (prevSegment === 'spend-requests' || prevSegment === 'requests' || prevSegment === 'expenses') {
    const req = spendRequests.find((r) => r.id === segment)
    if (req) return req.ref
  }
  return segment.charAt(0).toUpperCase() + segment.slice(1)
}

export function TopBar({ title }: { title: string }) {
  const navigate = useNavigate()
  const { pathname } = useLocation()
  const { name, email, role, logout } = useSession()
  const initials = name
    .split(' ')
    .map((n) => n[0])
    .join('')

  const segments = pathname.split('/').filter(Boolean)
  const crumbs = segments.map((segment, i) => ({
    label: labelFor(segment, segments[i - 1]),
    href: '/' + segments.slice(0, i + 1).join('/'),
    isLast: i === segments.length - 1,
  }))

  return (
    <header className="flex h-14 items-center justify-between border-b border-border bg-card px-6">
      <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-sm">
        <Link to="/"
          className="flex items-center text-muted-foreground transition-colors hover:text-foreground"
          aria-label="Home"
        >
          <Home className="size-4" />
        </Link>
        {crumbs.map((crumb) => (
          <Fragment key={crumb.href}>
            <ChevronRight className="size-3.5 text-muted-foreground/50" />
            {crumb.isLast ? (
              <span className="font-semibold text-foreground">{crumb.label}</span>
            ) : (
              <Link to={crumb.href}
                className="text-muted-foreground transition-colors hover:text-foreground"
              >
                {crumb.label}
              </Link>
            )}
          </Fragment>
        ))}
      </nav>

      <div className="flex items-center gap-4">
        <div className="flex items-center gap-3">
          <div className="flex size-9 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary">
            {initials}
          </div>
          <div className="hidden flex-col leading-tight md:flex">
            <span className="text-sm font-medium">{name}</span>
            <span className="text-xs text-muted-foreground">{email}</span>
          </div>
          <Badge variant="default">{role}</Badge>
        </div>

        <Button
          variant="ghost"
          size="icon"
          onClick={() => { logout(); navigate('/login'); }}
          aria-label="Log out"
        >
          <LogOut className="size-5" />
        </Button>
      </div>
    </header>
  )
}
