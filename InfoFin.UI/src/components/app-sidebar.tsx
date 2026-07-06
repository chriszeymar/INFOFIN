import { Link, useLocation } from 'react-router-dom'
import {
  LayoutGrid,
  BarChart3,
  Settings,
  Users,
  UserCircle,
  PanelLeftClose,
  PanelLeftOpen,
  CreditCard,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useSession } from '@/auth/AuthContext'

type NavItem = {
  href?: string
  label: string
  icon: typeof LayoutGrid
  adminOnly?: boolean
  subItems?: { href: string; label: string; icon: typeof LayoutGrid }[]
}

const primaryNav: NavItem[] = [
  { href: '/', label: 'Dashboard', icon: LayoutGrid },
  { href: '/expenses', label: 'Expenses', icon: CreditCard },
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
  const { pathname } = useLocation()
  const { role } = useSession()

  const iconCls = 'size-5 shrink-0'

  function renderLink(href: string, label: string, Icon: typeof LayoutGrid) {
    const active = pathname === href || (href !== '/' && pathname.startsWith(href + '/'))
    return (
      <Link
        key={href}
        to={href}
        title={collapsed ? label : undefined}
        className={cn(
          'flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium transition-colors',
          active
            ? 'bg-sidebar-accent text-sidebar-accent-foreground'
            : 'text-sidebar-foreground/70 hover:bg-sidebar-foreground/10 hover:text-sidebar-foreground',
          collapsed && 'justify-center px-0',
        )}
      >
        <Icon className={iconCls} />
        {!collapsed && <span>{label}</span>}
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
      {/* Logo */}
      <div className="flex items-center justify-center border-b border-sidebar-border px-2 py-3">
        <div className={cn(
          'flex items-center justify-center rounded-lg bg-white shadow-sm',
          collapsed ? 'h-10 w-10 p-1' : 'w-full py-1.5',
        )}>
          <img
            src="/infoset-logo.png"
            alt="INFOSET"
            className={cn('w-3/5 h-auto', collapsed ? 'h-6' : '')}
          />
        </div>
      </div>

      {/* Primary nav */}
      <nav className="flex flex-1 flex-col gap-1 p-3">
        {primaryNav
          .filter((item) => !item.adminOnly || role === 'Admin')
          .map((item) => renderLink(item.href!, item.label, item.icon))}
      </nav>

      {/* Secondary nav */}
      <nav className="flex flex-col gap-1 border-t border-sidebar-border p-3">
        {secondaryNav
          .filter((item) => !item.adminOnly || role === 'Admin')
          .map((item) => renderLink(item.href!, item.label, item.icon))}
      </nav>

      {/* Collapse toggle */}
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
