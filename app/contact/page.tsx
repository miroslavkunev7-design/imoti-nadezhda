import type { Metadata } from 'next'
import LuxuryPageShell from '@/components/layout/LuxuryPageShell'
import CityPanoramaHero from '@/components/layout/CityPanoramaHero'

export const metadata: Metadata = { title: 'Контакти' }

const PHONE = process.env.NEXT_PUBLIC_CONTACT_PHONE ?? '0877 123 456'
const EMAIL = process.env.NEXT_PUBLIC_CONTACT_EMAIL ?? 'info@ildjia.bg'

export default function ContactPage() {
  return (
    <LuxuryPageShell>
      <CityPanoramaHero height="min(32vh, 300px)">
        <h1 className="font-display font-bold" style={{ fontSize: 'clamp(1.75rem, 3.5vw, 2.5rem)', color: '#6B001C' }}>
          Контакти
        </h1>
      </CityPanoramaHero>
      <div className="max-w-[640px] mx-auto px-5 lg:px-8 py-12">
        <div className="lux-agent-panel">
          <h3>Свържете се с нас</h3>
          <a href={`tel:${PHONE.replace(/\s/g, '')}`} style={{ color: '#FAF7F2', display: 'block', marginBottom: 10 }}>
            {PHONE}
          </a>
          <a href={`mailto:${EMAIL}`} style={{ color: '#CFA54A', display: 'block', marginBottom: 20 }}>
            {EMAIL}
          </a>
          <a href={`tel:${PHONE.replace(/\s/g, '')}`} className="lux-btn-gold">Запази час за оглед</a>
          <a href={`mailto:${EMAIL}?subject=Запитване`} className="lux-btn-outline-gold" style={{ marginTop: 10 }}>
            Запитване
          </a>
        </div>
      </div>
    </LuxuryPageShell>
  )
}
