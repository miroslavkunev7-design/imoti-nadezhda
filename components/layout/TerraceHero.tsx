'use client'

import { CITY_PANORAMAS, DEFAULT_CITY_SLUG } from '@/lib/design/tokens'
import { useCitySelection } from '@/components/providers/CitySelectionProvider'

interface TerraceHeroProps {
  citySlug?: string
  height?: number | string
  overlay?: 'light' | 'medium' | 'strong'
  className?: string
  children?: React.ReactNode
}

export default function TerraceHero({
  citySlug,
  height = 420,
  overlay = 'medium',
  className = '',
  children,
}: TerraceHeroProps) {
  const { citySlug: contextSlug } = useCitySelection()
  const slug = citySlug ?? contextSlug ?? DEFAULT_CITY_SLUG
  const panorama = CITY_PANORAMAS[slug] ?? CITY_PANORAMAS[DEFAULT_CITY_SLUG]

  const overlays = {
    light: 'linear-gradient(to bottom, rgba(250,247,242,0.15) 0%, rgba(250,247,242,0.55) 100%)',
    medium: 'linear-gradient(to bottom, rgba(107,0,28,0.12) 0%, rgba(250,247,242,0.72) 85%, #FAF7F2 100%)',
    strong: 'linear-gradient(to bottom, rgba(107,0,28,0.22) 0%, rgba(250,247,242,0.88) 90%, #FAF7F2 100%)',
  }

  return (
    <section
      className={`relative w-full overflow-hidden ${className}`}
      style={{ height, minHeight: typeof height === 'number' ? height : undefined }}
    >
      <div
        className="absolute inset-0 bg-center bg-cover bg-no-repeat hero-bg-zoom"
        style={{
          backgroundImage: `url('${panorama}')`,
          backgroundColor: '#6B001C',
        }}
      />
      <div
        className="absolute inset-0"
        style={{ background: overlays[overlay] }}
      />
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse 90% 40% at 50% 0%, rgba(207,165,74,0.12) 0%, transparent 70%)',
        }}
      />
      {children && (
        <div className="relative z-10 h-full">
          {children}
        </div>
      )}
    </section>
  )
}
