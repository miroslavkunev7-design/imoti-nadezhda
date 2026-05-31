'use client'

import Link from 'next/link'
import type { Quarter } from '@/types'

interface Props {
  quarter: Quarter
  index?: number
}

export default function MarbleQuarterCard({ quarter, index = 0 }: Props) {
  const count = quarter.property_count ?? 0
  const countLabel = count > 0 ? `${count} ${count === 1 ? 'имот' : 'имота'}` : 'Виж обяви'

  const quarterHref =
    quarter.city_slug === 'burgas'
      ? `/cities/burgas/${quarter.slug}`
      : `/cities/${quarter.city_slug}/${quarter.slug}`

  return (
    <Link
      href={quarterHref}
      className="mq-card"
      style={{ '--mq-i': index } as React.CSSProperties}
      aria-label={`Квартал ${quarter.name}`}
    >
      <div className="mq-card__media">
        <div
          className="mq-card__photo"
          style={{
            backgroundImage: quarter.image_url
              ? `url(${quarter.image_url})`
              : 'linear-gradient(135deg, #3a1020, #1a0812)',
          }}
        />
        <div className="mq-card__shade" aria-hidden />
        <div className="mq-card__wave mq-card__wave--tl" aria-hidden />
        <div className="mq-card__wave mq-card__wave--br" aria-hidden />
        <div className="mq-card__peel mq-card__peel--tr" aria-hidden />
        <div className="mq-card__dust" aria-hidden>
          {Array.from({ length: 15 }).map((_, i) => (
            <span key={i} className="mq-card__spark" style={{ '--si': i } as React.CSSProperties} />
          ))}
        </div>
      </div>
      <div className="mq-card__body">
        <h3 className="mq-card__name">{quarter.name}</h3>
        <p className="mq-card__count">
          <PinIcon />
          <span>{countLabel}</span>
        </p>
        <span className="mq-card__arrow" aria-hidden>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M7 17L17 7M17 7H9M17 7v8" />
          </svg>
        </span>
      </div>
    </Link>
  )
}

function PinIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" />
    </svg>
  )
}
