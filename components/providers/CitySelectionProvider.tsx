'use client'

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react'
import { isCitySlug, type CitySlug } from '@/lib/design/brand'

const STORAGE_KEY = 'ildjia-selected-city'

interface CitySelectionContextValue {
  selectedCity: CitySlug | null
  setSelectedCity: (slug: CitySlug | null) => void
}

const CitySelectionContext = createContext<CitySelectionContextValue | null>(null)

function readStoredCity(): CitySlug | null {
  if (typeof window === 'undefined') return null
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw && isCitySlug(raw)) return raw
  } catch {
    /* ignore */
  }
  return null
}

export function CitySelectionProvider({ children }: { children: React.ReactNode }) {
  const [selectedCity, setSelectedCityState] = useState<CitySlug | null>(null)

  useEffect(() => {
    setSelectedCityState(readStoredCity())
  }, [])

  const setSelectedCity = useCallback((slug: CitySlug | null) => {
    setSelectedCityState(slug)
    try {
      if (slug) localStorage.setItem(STORAGE_KEY, slug)
      else localStorage.removeItem(STORAGE_KEY)
      document.cookie = slug
        ? `ildjia_city=${slug};path=/;max-age=31536000;SameSite=Lax`
        : 'ildjia_city=;path=/;max-age=0'
    } catch {
      /* ignore */
    }
  }, [])

  const value = useMemo(
    () => ({ selectedCity, setSelectedCity }),
    [selectedCity, setSelectedCity],
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

export function useCitySelectionOptional() {
  return useContext(CitySelectionContext)
}
