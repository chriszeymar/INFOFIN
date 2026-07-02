'use client'

import { Fragment } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { ChevronRight, Home, LogOut } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Select } from '@/components/ui/select'
import { useSession, ROLES, type Role } from '@/components/session-provider'
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
  if (prevSegment === 'requests') {
    const req = spendRequests.find((r) => r.id === segment)
    if (req) return req.ref
  }
  return segment.charAt(0).toUpperCase() + segment.slice(1)
}

export function TopBar({ title }: { title: string }) {
  const router = useRouter()
  const pathname = usePathname()
  const { name, email, role, setRole } = useSession()
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
        <Link
          href="/dashboard"
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

      <div className="flex items-center gap-4">
        <div className="hidden items-center gap-2 sm:flex">
          <span className="text-xs text-muted-foreground">Viewing as</span>
          <Select
            value={role}
            onChange={(e) => setRole(e.target.value as Role)}
            className="h-8 w-44 text-xs"
          >
            {ROLES.map((r) => (
              <option key={r} value={r}>
                {r}
              </option>
            ))}
          </Select>
        </div>

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
          onClick={() => router.push('/')}
          aria-label="Log out"
        >
          <LogOut className="size-5" />
        </Button>
      </div>
    </header>
  )
}
