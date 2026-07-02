'use client'

import { useState } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import { AppSidebar } from '@/components/app-sidebar'
import { TopBar } from '@/components/top-bar'

function titleFor(pathname: string) {
  if (pathname === '/' || pathname.startsWith('/dashboard')) return 'Dashboard'
  if (pathname === '/expenses') return 'Expense Management'
  if (pathname === '/expenses/requests/new') return 'New Request'
  if (pathname.startsWith('/expenses/requests/')) return 'Request Detail'
  if (pathname.startsWith('/expenses/requests')) return 'Requests'
  if (pathname === '/expenses/requests/new') return 'New Request'
  if (pathname.startsWith('/expenses/requests/')) return 'Request Detail'
  if (pathname.startsWith('/expenses/requests')) return 'Requests'
  if (pathname.startsWith('/budgets')) return 'Budget Management'
  if (pathname.startsWith('/master-data')) return 'Master Data'
  if (pathname.startsWith('/users')) return 'User Management'
  if (pathname.startsWith('/profile')) return 'Profile'
  return 'INFOFIN'
}

export function AppShell() {
  const [collapsed, setCollapsed] = useState(false)
  const { pathname } = useLocation()

  return (
    <div className="flex h-screen overflow-hidden">
      <AppSidebar
        collapsed={collapsed}
        onToggle={() => setCollapsed((c) => !c)}
      />
      <div className="flex flex-1 flex-col overflow-hidden">
        <TopBar title={titleFor(pathname)} />
        <main className="flex-1 overflow-y-auto bg-muted/40 p-6">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
