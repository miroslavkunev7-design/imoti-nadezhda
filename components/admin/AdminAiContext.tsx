'use client'

import { createContext, useCallback, useContext, useState } from 'react'

type AdminAiContextValue = {
  open: boolean
  setOpen: (open: boolean) => void
  toggle: () => void
}

const AdminAiContext = createContext<AdminAiContextValue | null>(null)

export function AdminAiProvider({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false)
  const toggle = useCallback(() => setOpen(v => !v), [])

  return (
    <AdminAiContext.Provider value={{ open, setOpen, toggle }}>
      {children}
    </AdminAiContext.Provider>
  )
}

export function useAdminAi() {
  const ctx = useContext(AdminAiContext)
  if (!ctx) throw new Error('useAdminAi must be used within AdminAiProvider')
  return ctx
}
