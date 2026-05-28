'use client'

import { resolvePanorama } from '@/lib/design/brand'
import { useCitySelection } from '@/components/providers/CitySelectionProvider'

interface CityPanoramaHeroProps {
  citySlug?: string | null
  height?: string | number
  className?: string
  children?: React.ReactNode
}

export default function CityPanoramaHero({
  citySlug,
  height = 'min(52vh, 520px)',
  className = '',
  children,
}: CityPanoramaHeroProps) {
  const { selectedCity } = useCitySelection()
  const slug = citySlug ?? selectedCity
  const panorama = resolvePanorama(slug)

  return (
    <section className={`lux-panorama ${className}`} style={{ height, minHeight: 280 }}>
      <div
        className="lux-panorama__bg"
        style={{ backgroundImage: `url('${panorama}')` }}
        role="img"
        aria-label="Панорама"
      />
      <div className="lux-panorama__veil" aria-hidden />
      <div className="lux-panorama__gold-line" aria-hidden />
      {children && (
        <div className="relative z-10 h-full flex flex-col justify-end max-w-[1280px] mx-auto px-5 lg:px-8 pb-8">
          {children}
        </div>
      )}
    </section>
  )
}
