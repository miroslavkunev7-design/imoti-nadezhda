import Link from 'next/link'
import type { City } from '@/types'

const CITY_GRADIENTS: Record<string, string> = {
  shumen:     'linear-gradient(135deg, #1a0a0f 0%, #2d0f1a 50%, #0f0a1a 100%)',
  varna:      'linear-gradient(135deg, #0a1a2d 0%, #0f2040 50%, #091525 100%)',
  burgas:     'linear-gradient(135deg, #0a1820 0%, #0f2530 50%, #071015 100%)',
  'novi-pazar': 'linear-gradient(135deg, #0f1a0a 0%, #162010 50%, #0a1208 100%)',
}

interface CityCardProps {
  city: City
  index: number
  cardHeight?: number
}

export default function CityCard({ city, index, cardHeight }: CityCardProps) {
  return (
    <div
      className="relative flex-1 min-w-0 card-enter"
      style={{ '--card-i': index } as React.CSSProperties}
    >
      <Link
        href={`/cities/${city.slug}`}
        className="city-card-link group block relative overflow-hidden rounded-xl h-full"
        style={{ height: cardHeight ?? 160 }}
      >
        <div
          className="absolute inset-0 bg-center bg-cover transition-transform duration-300 group-hover:scale-105"
          style={{
            backgroundImage: city.image_url
              ? `url(${city.image_url})`
              : CITY_GRADIENTS[city.slug] ?? CITY_GRADIENTS.shumen,
          }}
        />

        <div
          className="absolute inset-0"
          style={{
            background:
              'linear-gradient(to top, rgba(4,2,12,0.92) 0%, rgba(4,2,12,0.55) 45%, rgba(4,2,12,0.18) 100%)',
          }}
        />

        <div
          className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
          style={{
            background: 'radial-gradient(ellipse at bottom center, rgba(196,30,58,0.22) 0%, transparent 70%)',
          }}
        />

        <div
          className="absolute top-0 left-0 right-0 h-[3px]"
          style={{
            background: 'linear-gradient(to right, #7b0d1e, #c41e3a, #e85472, #c41e3a, #7b0d1e)',
          }}
        />

        <div className="relative z-10 flex flex-col justify-end h-full p-4 pb-5">
          <div className="flex items-start gap-1.5 mb-1.5">
            <svg
              className="text-crimson-700 flex-shrink-0 mt-0.5"
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="currentColor"
            >
              <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" />
            </svg>
            <h3
              className="font-display font-semibold text-white leading-tight"
              style={{ fontSize: 'clamp(1.1rem, 2vw, 1.4rem)' }}
            >
              {city.name}
            </h3>
          </div>

          <div className="flex items-center gap-1 text-crimson-700 group-hover:text-crimson-400 transition-colors duration-200">
            <span className="text-xs font-semibold tracking-wider uppercase">
              Neighborhoods
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
