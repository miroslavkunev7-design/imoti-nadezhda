'use client'

import type { City } from '@/types'
import SearchWidget from '@/components/search/SearchWidget'
import CityCard from '@/components/cards/CityCard'
import { useTheme } from '@/components/providers/ThemeProvider'

interface HeroSectionProps {
  cities: City[]
}

const NAVBAR_H  = 76
const BOTTOMBAR_H = 60
const CARD_H    = 156
const LABEL_H   = 28

export default function HeroSection({ cities }: HeroSectionProps) {
  const { theme } = useTheme()
  const isLight = theme === 'light'

  return (
    <section
      className="relative w-full overflow-hidden"
      style={{ height: '100dvh', minHeight: 620 }}
    >
      <div
        className="absolute inset-0 bg-center bg-cover bg-no-repeat hero-bg-zoom"
        style={{
          backgroundImage: "url('/images/hero-bg.jpg')",
          backgroundColor: '#0f0a1a',
          filter: isLight ? 'brightness(1.15) saturate(1.05)' : 'none',
          transition: 'filter 0.5s ease',
        }}
      />

      {!isLight && (
        <>
          <div className="absolute inset-0" style={{ background: 'rgba(6,4,14,0.52)' }} />
          <div className="absolute inset-0" style={{ background: 'radial-gradient(ellipse at 50% 40%, transparent 30%, rgba(4,2,12,0.55) 100%)' }} />
          <div className="absolute inset-0" style={{ background: 'linear-gradient(to bottom, transparent 45%, rgba(4,2,12,0.75) 75%, rgba(4,2,12,0.95) 100%)' }} />
        </>
      )}
      {isLight && (
        <div className="absolute inset-0" style={{
          background: 'linear-gradient(to bottom, transparent 70%, rgba(245,240,232,0.35) 88%, rgba(245,240,232,0.75) 100%)',
        }} />
      )}
      <div className="absolute bottom-0 left-0 right-0" style={{
        height: 260,
        background: 'radial-gradient(ellipse at 50% 100%, rgba(196,30,58,0.10) 0%, transparent 70%)',
      }} />

      <div
        className="relative z-10 h-full flex flex-col max-w-[1280px] mx-auto px-5 lg:px-8"
        style={{ paddingTop: NAVBAR_H, paddingBottom: BOTTOMBAR_H + 8 }}
      >
        <div className="flex-1 flex flex-col justify-center items-start gap-2 min-h-0">
          <p className="text-label text-themed-secondary uppercase tracking-[0.25em] page-enter">
            Намери своя имот
          </p>
          <SearchWidget cities={cities} compact />
        </div>

        <div className="flex-shrink-0" style={{ height: CARD_H + LABEL_H + 4 }}>
          <p className="text-label text-themed-secondary uppercase tracking-[0.2em] mb-2 page-enter">
            Избери град
          </p>

          <div
            className="grid gap-3"
            style={{
              gridTemplateColumns: `repeat(${cities.length}, 1fr)`,
              height: CARD_H,
            }}
          >
            {cities.map((city, i) => (
              <CityCard key={city.id} city={city} index={i} cardHeight={CARD_H} />
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
