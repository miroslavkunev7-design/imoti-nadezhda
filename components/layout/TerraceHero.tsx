'use client'

import { resolveCityPanorama } from '@/lib/design/city-panoramas'
import { useCitySelectionOptional } from '@/components/providers/CitySelectionProvider'

interface TerraceHeroProps {
  citySlug?: string | null
  height?: string | number
  className?: string
  children?: React.ReactNode
}

export default function TerraceHero({
  citySlug,
  height = 'min(42vh, 380px)',
  className = '',
  children,
}: TerraceHeroProps) {
  const ctx = useCitySelectionOptional()
  const slug = citySlug ?? ctx?.selectedCity ?? null
  const image = resolveCityPanorama(slug)

  return (
    <section
      className={`lux-terrace-hero ${className}`}
      style={{ height }}
      aria-label="Панорама"
    >
      <div
        className="lux-terrace-hero__bg"
        style={{ backgroundImage: `url('${image}')` }}
      />
      <div className="lux-terrace-hero__shade" />
      <span className="lux-terrace-hero__gold-line" aria-hidden />
      {children && (
        <div className="relative z-10 h-full flex flex-col justify-end">
          {children}
        </div>
      )}
    </section>
  )
}
