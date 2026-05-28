'use client'

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react'
import { DEFAULT_CITY_SLUG, STORAGE_KEY } from '@/lib/design/tokens'

interface CitySelectionContextValue {
  citySlug: string
  setCitySlug: (slug: string) => void
}

const CitySelectionContext = createContext<CitySelectionContextValue | null>(null)

export function CitySelectionProvider({ children }: { children: React.ReactNode }) {
  const [citySlug, setCitySlugState] = useState(DEFAULT_CITY_SLUG)
  const [hydrated, setHydrated] = useState(false)

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (stored) setCitySlugState(stored)
    } catch {
      /* ignore */
    }
    setHydrated(true)
  }, [])

  const setCitySlug = useCallback((slug: string) => {
    setCitySlugState(slug)
    try {
      localStorage.setItem(STORAGE_KEY, slug)
    } catch {
      /* ignore */
    }
  }, [])

  const value = useMemo(
    () => ({ citySlug: hydrated ? citySlug : DEFAULT_CITY_SLUG, setCitySlug }),
    [citySlug, hydrated, setCitySlug],
  )

  return (
    <CitySelectionContext.Provider value={value}>
      {children}
    </CitySelectionContext.Provider>
  )
}

export function useCitySelection() {
  const ctx = useContext(CitySelectionContext)
  if (!ctx) {
    throw new Error('useCitySelection must be used within CitySelectionProvider')
  }
  return ctx
}
