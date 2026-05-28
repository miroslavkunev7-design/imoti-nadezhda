'use client'

import { useEffect } from 'react'
import { useCitySelection } from '@/components/providers/CitySelectionProvider'

interface CityPanoramaSyncProps {
  citySlug: string
}

export default function CityPanoramaSync({ citySlug }: CityPanoramaSyncProps) {
  const { setCitySlug } = useCitySelection()

  useEffect(() => {
    if (citySlug) setCitySlug(citySlug)
  }, [citySlug, setCitySlug])

  return null
}
