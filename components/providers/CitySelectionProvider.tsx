'use client'

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react'
import type { CitySlug } from '@/lib/design/city-panoramas'
import { CITY_SLUGS } from '@/lib/design/city-panoramas'

const STORAGE_KEY = 'ildgia-selected-city'

interface CitySelectionContextValue {
  citySlug: CitySlug | null
  setCitySlug: (slug: CitySlug | null) => void
}

const CitySelectionContext = createContext<CitySelectionContextValue | null>(null)

function readStored(): CitySlug | null {
  if (typeof window === 'undefined') return null
  const raw = localStorage.getItem(STORAGE_KEY)
  if (raw && CITY_SLUGS.includes(raw as CitySlug)) return raw as CitySlug
  return null
}

export function CitySelectionProvider({ children }: { children: React.ReactNode }) {
  const [citySlug, setCitySlugState] = useState<CitySlug | null>(null)

  useEffect(() => {
    setCitySlugState(readStored())
  }, [])

  const setCitySlug = useCallback((slug: CitySlug | null) => {
    setCitySlugState(slug)
    if (typeof window === 'undefined') return
    if (slug) localStorage.setItem(STORAGE_KEY, slug)
    else localStorage.removeItem(STORAGE_KEY)
  }, [])

  const value = useMemo(
    () => ({ citySlug, setCitySlug }),
    [citySlug, setCitySlug]
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
