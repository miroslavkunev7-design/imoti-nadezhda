'use client'

import { Suspense, useEffect } from 'react'
import TerraceHero from '@/components/layout/TerraceHero'
import type { CitySlug } from '@/lib/design/city-panoramas'
import { useCitySelection } from '@/components/providers/CitySelectionProvider'

interface PropertyDetailHeroProps {
  citySlug: string
  title: string
}

function HeroInner({ citySlug, title }: PropertyDetailHeroProps) {
  const { setCitySlug } = useCitySelection()

  useEffect(() => {
    if (citySlug) setCitySlug(citySlug as CitySlug)
  }, [citySlug, setCitySlug])

  return (
    <TerraceHero variant="band" citySlug={citySlug}>
      <div className="flex items-end pb-6">
        <h1
          style={{
            fontFamily: 'var(--font-playfair), Georgia, serif',
            fontSize: 'clamp(1.25rem, 3vw, 1.75rem)',
            fontWeight: 700,
            color: '#fff',
            textShadow: '0 2px 12px rgba(0,0,0,0.4)',
            margin: 0,
          }}
        >
          {title}
        </h1>
      </div>
    </TerraceHero>
  )
}

export default function PropertyDetailHero(props: PropertyDetailHeroProps) {
  return (
    <Suspense fallback={<div className="lux-terrace lux-terrace--band" />}>
      <HeroInner {...props} />
    </Suspense>
  )
}
