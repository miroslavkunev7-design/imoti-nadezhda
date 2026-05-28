'use client'

import CityPanoramaHero from './CityPanoramaHero'
import LuxuryPageShell from './LuxuryPageShell'

export default function ListingPageLayout({
  citySlug,
  title,
  subtitle,
  children,
}: {
  citySlug?: string | null
  title: string
  subtitle?: string
  children: React.ReactNode
}) {
  return (
    <LuxuryPageShell>
      <CityPanoramaHero citySlug={citySlug} height="min(42vh, 400px)">
        <div className="pb-2">
          <h1
            className="font-display font-bold"
            style={{ fontSize: 'clamp(1.5rem, 3vw, 2.25rem)', color: '#6B001C' }}
          >
            {title}
          </h1>
          {subtitle && (
            <p style={{ fontSize: 13, color: '#7A0D28', marginTop: 4 }}>{subtitle}</p>
          )}
        </div>
      </CityPanoramaHero>
      <div className="max-w-[1280px] mx-auto px-5 lg:px-8 py-8">{children}</div>
    </LuxuryPageShell>
  )
}
