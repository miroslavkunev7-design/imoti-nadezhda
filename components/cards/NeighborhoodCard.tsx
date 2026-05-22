import Link from 'next/link'
import type { Quarter } from '@/types'

interface NeighborhoodCardProps {
  quarter: Quarter
  index?: number
}

export default function NeighborhoodCard({ quarter, index = 0 }: NeighborhoodCardProps) {
  return (
    <div
      className="h-full card-enter"
      style={{ '--card-i': index } as React.CSSProperties}
    >
      <Link
        href={`/cities/${quarter.city_slug}/${quarter.slug}`}
        className="group flex flex-col relative overflow-hidden rounded-xl h-full"
        style={{ minHeight: 160 }}
      >
        <div
          className="absolute inset-0 bg-center bg-cover transition-transform duration-300 group-hover:scale-105"
          style={{
            backgroundImage: quarter.image_url
              ? `url(${quarter.image_url})`
              : 'linear-gradient(135deg, #0f0a1a 0%, #1a0f28 100%)',
          }}
        />

        <div
          className="absolute inset-0"
          style={{
            background: 'linear-gradient(to top, rgba(4,2,12,0.95) 0%, rgba(4,2,12,0.5) 50%, rgba(4,2,12,0.15) 100%)',
          }}
        />

        <div
          className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
          style={{ background: 'radial-gradient(ellipse at bottom, rgba(196,30,58,0.18) 0%, transparent 70%)' }}
        />

        <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-crimson-700 origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-300" />

        <div className="relative z-10 flex flex-col justify-end flex-1 p-4">
          <div className="flex items-center gap-1.5 mb-1">
            <svg className="text-crimson-700 flex-shrink-0" width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" />
            </svg>
            <h3 className="font-display text-[0.95rem] font-semibold text-white leading-tight">
              {quarter.name}
            </h3>
          </div>

          <p className="text-[11px] text-[#9b8f82] mb-3">
            Имоти в квартала: <span className="text-[#f5f0e8] font-medium">{quarter.property_count ?? 0}</span>
          </p>

          <div className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-crimson-700 group-hover:text-crimson-400 uppercase tracking-wider transition-colors duration-200">
            Виж имоти
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="group-hover:translate-x-0.5 transition-transform duration-200">
              <path d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </div>
        </div>
      </Link>
    </div>
  )
}
