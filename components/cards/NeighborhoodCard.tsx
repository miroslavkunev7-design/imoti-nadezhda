import Link from 'next/link'
import type { Quarter } from '@/types'

interface NeighborhoodCardProps {
  quarter: Quarter
  index?: number
}

export default function NeighborhoodCard({ quarter, index = 0 }: NeighborhoodCardProps) {
  const count = quarter.property_count ?? 0

  return (
    <div className="h-full card-enter" style={{ '--card-i': index } as React.CSSProperties}>
      <Link href={`/cities/${quarter.city_slug}/${quarter.slug}`} className="luxury-quarter-card marble-dispersion marble-dispersion--burgundy group">
        <div
          className="luxury-quarter-card__thumb"
          style={{
            backgroundImage: quarter.image_url
              ? `url(${quarter.image_url})`
              : 'linear-gradient(135deg, #3a1020 0%, #1a0812 100%)',
          }}
        />
        <div className="luxury-quarter-card__body">
          <h3 className="luxury-quarter-card__title">{quarter.name}</h3>
          <p className="luxury-quarter-card__count">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor" className="text-[var(--gold)]"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" /></svg>
            <span>{count} {count === 1 ? 'имот' : 'имота'}</span>
          </p>
          <span className="luxury-quarter-card__arrow" aria-hidden>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 12h14M12 5l7 7-7 7" /></svg>
          </span>
        </div>
      </Link>
    </div>
  )
}
