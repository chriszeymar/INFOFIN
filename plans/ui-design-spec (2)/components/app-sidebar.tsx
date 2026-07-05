'use client'

import Image from 'next/image'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutGrid,
  FileText,
  BarChart3,
  Settings,
  Users,
  UserCircle,
  PanelLeftClose,
  PanelLeftOpen,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useSession } from '@/components/session-provider'

const primaryNav = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutGrid },
  { href: '/requests', label: 'Requests', icon: FileText },
  { href: '/budgets', label: 'Budgets', icon: BarChart3 },
  { href: '/master-data', label: 'Master Data', icon: Settings, adminOnly: true },
]

const secondaryNav = [
  { href: '/users', label: 'User Management', icon: Users, adminOnly: true },
  { href: '/profile', label: 'Profile', icon: UserCircle },
]

export function AppSidebar({
  collapsed,
  onToggle,
}: {
  collapsed: boolean
  onToggle: () => void
}) {
  const pathname = usePathname()
  const { role } = useSession()

  const renderItem = (item: {
    href: string
    label: string
    icon: typeof LayoutGrid
  }) => {
    const active =
      pathname === item.href || pathname.startsWith(item.href + '/')
    const Icon = item.icon
    return (
      <Link
        key={item.href}
        href={item.href}
        title={collapsed ? item.label : undefined}
        className={cn(
          'flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium transition-colors',
          active
            ? 'bg-sidebar-accent text-sidebar-accent-foreground'
            : 'text-sidebar-foreground/70 hover:bg-sidebar-foreground/10 hover:text-sidebar-foreground',
          collapsed && 'justify-center px-0',
        )}
      >
        <Icon className="size-5 shrink-0" />
        {!collapsed && <span>{item.label}</span>}
      </Link>
    )
  }

  return (
    <aside
      className={cn(
        'flex flex-col bg-[linear-gradient(160deg,var(--sidebar-gradient-from),var(--sidebar-gradient-to))] text-sidebar-foreground transition-[width] duration-200',
        collapsed ? 'w-16' : 'w-64',
      )}
    >
      <div className="flex h-16 items-center justify-center border-b border-sidebar-border px-3">
        <div
          className={cn(
            'flex items-center justify-center rounded-md bg-white',
            collapsed ? 'h-9 w-9' : 'h-11 w-full',
          )}
        >
          <Image
            src="/infoset-logo.png"
            alt="INFOSET"
            width={160}
            height={62}
            className={cn('w-auto', collapsed ? 'h-6' : 'h-8')}
            priority
          />
        </div>
      </div>

      <nav className="flex flex-1 flex-col gap-1 p-3">
        {primaryNav
          .filter((item) => !item.adminOnly || role === 'Admin')
          .map(renderItem)}
      </nav>

      <nav className="flex flex-col gap-1 border-t border-sidebar-border p-3">
        {secondaryNav
          .filter((item) => !item.adminOnly || role === 'Admin')
          .map(renderItem)}
      </nav>

      <button
        onClick={onToggle}
        className="flex items-center gap-3 border-t border-sidebar-border px-4 py-3 text-sm text-sidebar-foreground/70 transition-colors hover:text-sidebar-foreground"
        aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
      >
        {collapsed ? (
          <PanelLeftOpen className="size-5" />
        ) : (
          <>
            <PanelLeftClose className="size-5" />
            <span>Collapse</span>
          </>
        )}
      </button>
    </aside>
  )
}
