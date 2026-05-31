import { notFound, redirect } from 'next/navigation'
import type { Metadata } from 'next'
import { cache } from 'react'
import Link from 'next/link'
import { FALLBACK_CITIES, getQuartersForCity } from '@/lib/data/fallback'
import { countLocalPropertiesForQuarter } from '@/lib/properties/merge-local'
import type { City, Quarter } from '@/types'
import CityHeroBand from '@/components/city/CityHeroBand'

export const revalidate = 120

interface PageProps { params: { slug: string } }

const getData = cache(async (slug: string): Promise<{ city: City; quarters: Quarter[] } | null> => {
  const city = FALLBACK_CITIES.find(c => c.slug === slug)
  if (!city) return null
  const baseQuarters = getQuartersForCity(slug)
  const quarters = await Promise.all(
    baseQuarters.map(async q => ({
      ...q,
      property_count: await countLocalPropertiesForQuarter(slug, q.slug),
    }))
  )
  return { city, quarters }
})

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const data = await getData(params.slug)
  if (!data) return { title: 'Град не е намерен' }
  return { title: `Имоти в ${data.city.name} — Имоти Надежда` }
}

export async function generateStaticParams() {
  return FALLBACK_CITIES.filter(c => c.slug !== 'burgas').map(c => ({ slug: c.slug }))
}

export default async function CityPage({ params }: PageProps) {
  if (params.slug === 'burgas') redirect('/cities/burgas')

  const data = await getData(params.slug)
  if (!data) notFound()
  const { city, quarters } = data

  return (
    <div className="rd-page-shell">
      <CityHeroBand city={city} />

      <div className="rd-body">
        {/* Breadcrumb */}
        <nav className="rd-breadcrumb" aria-label="Навигация">
          <Link href="/">Начало</Link>
          <span className="rd-breadcrumb__sep">/</span>
          <Link href="/buy">Градове</Link>
          <span className="rd-breadcrumb__sep">/</span>
          <span className="rd-breadcrumb__current">{city.name}</span>
        </nav>

        <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 24, flexWrap: 'wrap', gap: 12 }}>
          <h1 style={{ fontFamily: 'var(--font-playfair),Georgia,serif', fontSize: 'clamp(1.4rem,2.5vw,1.9rem)', fontWeight: 700, color: '#6b001c', margin: 0 }}>
            Квартали в {city.name}
          </h1>
          <Link href={`/buy?city=${city.slug}`} style={{ fontSize: 13, fontWeight: 600, color: '#6b001c', textDecoration: 'none', border: '1.5px solid rgba(107,0,28,0.28)', borderRadius: 8, padding: '8px 16px' }}>
            Всички имоти →
          </Link>
        </div>

        <div className="rd-quarters-grid">
          {quarters.map((q, i) => {
            const bg = q.image_url ? `url(${q.image_url})` : `linear-gradient(135deg,#1a0a0f,#2d0f1a)`
            return (
              <Link
                key={q.id}
                href={`/cities/${city.slug}/${q.slug}`}
                className="rd-quarter-card"
              >
                <div className="rd-quarter-card__photo" style={{ backgroundImage: bg }} />
                <div className="rd-quarter-card__body">
                  <h3 className="rd-quarter-card__name">{q.name}</h3>
                  {q.property_count != null && q.property_count > 0 && (
                    <p className="rd-quarter-card__count">{q.property_count} обяви</p>
                  )}
                  <span className="rd-quarter-card__cta">
                    Виж имоти →
                  </span>
                </div>
              </Link>
            )
          })}
        </div>
      </div>
    </div>
  )
}
