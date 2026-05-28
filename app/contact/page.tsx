import type { Metadata } from 'next'
import { Suspense } from 'react'
import TerraceHero from '@/components/layout/TerraceHero'
import ContactForm from '@/components/contact/ContactForm'

export const metadata: Metadata = {
  title: 'Контакти',
  description: 'Свържете се с Имоти ИЛДЖ.ИА за огледи и консултации.',
}

export default function ContactPage() {
  return (
    <>
      <Suspense fallback={<div className="lux-terrace lux-terrace--band" />}>
        <TerraceHero variant="band" />
      </Suspense>

      <div className="max-w-[640px] mx-auto px-5 lg:px-8 py-12 pb-20">
        <div className="lux-content-card">
          <h1 className="lux-section-title">Контакти</h1>
          <p style={{ color: 'var(--lux-text-muted)', marginBottom: 24, lineHeight: 1.6 }}>
            Свържете се с нас за оглед, оценка или консултация. Отговаряме в рамките на един работен ден.
          </p>

          <div className="grid gap-3 mb-8" style={{ fontSize: 15 }}>
            <a href="tel:+359877123456" style={{ color: 'var(--lux-burgundy)', fontWeight: 600 }}>
              0877 123 456
            </a>
            <a href="mailto:info@ildgia.bg" style={{ color: 'var(--lux-gold-deep)' }}>
              info@ildgia.bg
            </a>
          </div>

          <ContactForm />
        </div>
      </div>
    </>
  )
}
