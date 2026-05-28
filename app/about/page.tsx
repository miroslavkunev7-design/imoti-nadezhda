import type { Metadata } from 'next'
import Link from 'next/link'
import LuxuryPageShell from '@/components/layout/LuxuryPageShell'
import CityPanoramaHero from '@/components/layout/CityPanoramaHero'
import { BRAND } from '@/lib/design/brand'

export const metadata: Metadata = { title: 'За нас' }

export default function AboutPage() {
  return (
    <LuxuryPageShell>
      <CityPanoramaHero height="min(38vh, 360px)">
        <h1 className="font-display font-bold" style={{ fontSize: 'clamp(1.75rem, 3.5vw, 2.5rem)', color: '#6B001C' }}>
          За нас
        </h1>
      </CityPanoramaHero>
      <div className="max-w-[800px] mx-auto px-5 lg:px-8 py-12">
        <div
          className="rounded-lg p-8"
          style={{
            background: 'linear-gradient(180deg, #fffefb, #faf7f2)',
            border: '1.5px solid rgba(207, 165, 74, 0.45)',
            boxShadow: '0 8px 32px rgba(107, 0, 28, 0.1)',
          }}
        >
          <p className="uppercase tracking-[0.2em] mb-3" style={{ fontSize: 11, color: '#A97A1F', fontWeight: 600 }}>
            {BRAND.tagline}
          </p>
          <h2 className="font-display font-bold mb-6" style={{ fontSize: '1.75rem', color: '#6B001C' }}>
            {BRAND.logoLine}
          </h2>
          <p style={{ color: '#5c4a52', lineHeight: 1.75, marginBottom: 16 }}>
            Водеща агенция за луксозни недвижими имоти в Североизточна България — Шумен, Варна, Бургас и Нови пазар.
          </p>
          <Link href="/buy" className="lux-btn-gold" style={{ maxWidth: 280, display: 'inline-flex' }}>
            Разгледай имотите
          </Link>
        </div>
      </div>
    </LuxuryPageShell>
  )
}
