'use client'

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react'
import { SELECTED_CITY_KEY } from '@/lib/design/brand'

interface CitySelectionContextValue {
  selectedCity: string | null
  setSelectedCity: (slug: string | null) => void
}

const CitySelectionContext = createContext<CitySelectionContextValue | null>(null)

export function CitySelectionProvider({ children }: { children: React.ReactNode }) {
  const [selectedCity, setSelectedCityState] = useState<string | null>(null)

  useEffect(() => {
    try {
      const stored = sessionStorage.getItem(SELECTED_CITY_KEY)
      if (stored) setSelectedCityState(stored)
    } catch {
      /* ignore */
    }
  }, [])

  const setSelectedCity = useCallback((slug: string | null) => {
    setSelectedCityState(slug)
    try {
      if (slug) sessionStorage.setItem(SELECTED_CITY_KEY, slug)
      else sessionStorage.removeItem(SELECTED_CITY_KEY)
    } catch {
      /* ignore */
    }
  }, [])

  const value = useMemo(
    () => ({ selectedCity, setSelectedCity }),
    [selectedCity, setSelectedCity]
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
