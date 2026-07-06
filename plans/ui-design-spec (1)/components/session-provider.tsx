'use client'

import { createContext, useContext, useState } from 'react'

export type Role =
  | 'Admin'
  | 'Requester'
  | 'Director'
  | 'FP&A'
  | 'Managing Director'

type SessionContextValue = {
  name: string
  email: string
  role: Role
  isElevated: boolean
  setRole: (role: Role) => void
}

const SessionContext = createContext<SessionContextValue | null>(null)

export const ROLES: Role[] = [
  'Admin',
  'Requester',
  'Director',
  'FP&A',
  'Managing Director',
]

const ELEVATED_ROLES: Role[] = [
  'Admin',
  'Director',
  'FP&A',
  'Managing Director',
]

export function SessionProvider({ children }: { children: React.ReactNode }) {
  const [role, setRole] = useState<Role>('Admin')

  return (
    <SessionContext.Provider
      value={{
        name: 'Dana Whitfield',
        email: 'dana.whitfield@infoset.com',
        role,
        isElevated: ELEVATED_ROLES.includes(role),
        setRole,
      }}
    >
      {children}
    </SessionContext.Provider>
  )
}

export function useSession() {
  const ctx = useContext(SessionContext)
  if (!ctx) throw new Error('useSession must be used within SessionProvider')
  return ctx
}
