'use client'

import Link from 'next/link'
import type { City } from '@/types'
import MarbleDissolveOverlay from '@/components/ui/MarbleDissolveOverlay'
import { useCitySelection } from '@/components/providers/CitySelectionProvider'

interface CityCardProps {
  city: City
  index: number
  cardHeight?: number
}

export default function CityCard({ city, index, cardHeight }: CityCardProps) {
  const { setCitySlug } = useCitySelection()

  return (
    <div
      className="relative flex-1 min-w-0 card-enter"
      style={{ '--card-i': index } as React.CSSProperties}
    >
      <Link
        href={`/cities/${city.slug}`}
        onClick={() => setCitySlug(city.slug)}
        className="city-card-luxury group block relative overflow-hidden h-full"
        style={{ height: cardHeight ?? 160 }}
      >
        <div
          className="absolute inset-0 bg-center bg-cover transition-transform duration-500 group-hover:scale-105"
          style={{
            backgroundImage: city.image_url
              ? `url(${city.image_url})`
              : 'linear-gradient(135deg, #6B001C 0%, #7A0D28 100%)',
          }}
        />

        <MarbleDissolveOverlay direction="ltr" intensity="card" />

        <div
          className="absolute top-0 left-0 right-0 h-[3px]"
          style={{
            background: 'linear-gradient(to right, #A97A1F, #CFA54A, #E8C872, #CFA54A, #A97A1F)',
          }}
        />

        <div className="relative z-10 flex flex-col justify-end h-full p-4 pb-5">
          <div className="flex items-start gap-1.5 mb-1">
            <svg
              className="flex-shrink-0 mt-0.5"
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="#CFA54A"
            >
              <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" />
            </svg>
            <h3
              className="font-display font-semibold leading-tight"
              style={{
                fontSize: 'clamp(1.1rem, 2vw, 1.4rem)',
                color: '#6B001C',
              }}
            >
              {city.name}
            </h3>
          </div>

          <div
            className="flex items-center gap-1 transition-colors duration-200"
            style={{ color: '#A97A1F' }}
          >
            <span className="text-xs font-semibold tracking-wider uppercase">
              Разгледай
            </span>
            <svg
              width="12"
              height="12"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="transform group-hover:translate-x-0.5 transition-transform duration-200"
            >
              <path d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </div>
        </div>
      </Link>
    </div>
  )
}
