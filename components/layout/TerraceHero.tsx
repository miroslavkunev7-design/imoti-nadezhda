'use client'

import { useMemo } from 'react'
import { useSearchParams } from 'next/navigation'
import { getCityPanorama } from '@/lib/design/city-panoramas'
import type { CitySlug } from '@/lib/design/city-panoramas'
import { useCitySelection } from '@/components/providers/CitySelectionProvider'

interface TerraceHeroProps {
  variant?: 'full' | 'band'
  citySlug?: CitySlug | string | null
  children?: React.ReactNode
  className?: string
}

export default function TerraceHero({
  variant = 'full',
  citySlug: citySlugProp,
  children,
  className = '',
}: TerraceHeroProps) {
  const searchParams = useSearchParams()
  const { citySlug: storedCity } = useCitySelection()

  const resolvedSlug = useMemo(() => {
    if (citySlugProp) return citySlugProp
    const fromQuery = searchParams.get('city')
    if (fromQuery) return fromQuery
    return storedCity
  }, [citySlugProp, searchParams, storedCity])

  const panorama = getCityPanorama(resolvedSlug ?? undefined)

  return (
    <section
      className={`lux-terrace lux-terrace--${variant} ${className}`.trim()}
      aria-label="Панорама"
    >
      <div
        className="lux-terrace__bg"
        style={{ backgroundImage: `url('${panorama}')` }}
        role="img"
        aria-hidden
      />
      <div className="lux-terrace__veil" aria-hidden />
      <div className="lux-terrace__gold-line" aria-hidden />
      {children && <div className="lux-terrace__content">{children}</div>}
    </section>
  )
}
