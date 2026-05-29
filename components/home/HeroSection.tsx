'use client'

import type { City } from '@/types'
import SearchWidget from '@/components/search/SearchWidget'
import CityCard from '@/components/cards/CityCard'
import { useTheme } from '@/components/providers/ThemeProvider'
import Link from 'next/link'

interface HeroSectionProps {
  cities: City[]
}

const BOTTOMBAR_H = 68

export default function HeroSection({ cities }: HeroSectionProps) {
  const { theme } = useTheme()
  const isLight = theme === 'light'

  return (
    <section
      className="hero-home relative w-full overflow-hidden"
      style={{ height: '100dvh', minHeight: 640 }}
    >
      <picture className="hero-home__bg" aria-hidden>
        <source srcSet="/images/hero-bg.webp" type="image/webp" />
        <img
          src="/images/hero-bg.jpg"
          alt=""
          className="hero-home__bg-img"
          fetchPriority="high"
          decoding="async"
        />
      </picture>

      {!isLight && (
        <>
          <div className="absolute inset-0 z-[1]" style={{ background: 'rgba(6,4,14,0.22)' }} />
          <div
            className="absolute inset-0 z-[1]"
            style={{
              background:
                'radial-gradient(ellipse 90% 65% at 50% 45%, transparent 42%, rgba(4,2,12,0.32) 100%)',
            }}
          />
          <div
            className="absolute inset-0 z-[1]"
            style={{
              background:
                'linear-gradient(to bottom, transparent 48%, rgba(4,2,12,0.5) 72%, rgba(4,2,12,0.85) 100%)',
            }}
          />
        </>
      )}
      {isLight && (
        <div
          className="absolute inset-0 z-[1]"
          style={{
            background:
              'linear-gradient(to bottom, transparent 65%, rgba(245,240,232,0.4) 88%, rgba(245,240,232,0.78) 100%)',
          }}
        />
      )}

      <div
        className="hero-home__content relative z-10 h-full w-full"
        style={{ paddingBottom: BOTTOMBAR_H + 8, paddingTop: 'var(--site-header-offset)' }}
      >
        <div className="hero-home__cities-band">
          <div className="hero-home__cities-intro">
            <h2 className="hero-home__cities-title">Избери град</h2>
            <Link href="/buy" className="luxury-outline-btn hero-home__cities-btn">
              Виж всички градове
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </Link>
          </div>

          <div className="hero-home__cities-stack">
            {/* Real floating search panel */}
            <div className="hero-home__search-slot">
              <SearchWidget cities={cities} luxuryBar homeLayout marbleSearch />
            </div>
            <div className="hero-home__cities-row">
              {cities.map((city, i) => (
                <CityCard key={city.id} city={city} index={i} variant="home" />
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
