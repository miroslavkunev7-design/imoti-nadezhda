'use client'

import { useState } from 'react'
import TerraceHero from '@/components/layout/TerraceHero'
import { BRAND } from '@/lib/design/brand'

export default function ContactPage() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [message, setMessage] = useState('')
  const [sent, setSent] = useState(false)
  const [loading, setLoading] = useState(false)

  const contactPhone = process.env.NEXT_PUBLIC_CONTACT_PHONE ?? '0877 123 456'
  const contactEmail = process.env.NEXT_PUBLIC_CONTACT_EMAIL ?? 'info@imoti-ildjia.bg'

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    try {
      await fetch('/api/inquiries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, phone, message }),
      })
      setSent(true)
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <TerraceHero height={220} />
      <div className="lux-content-page">
        <article className="lux-content-panel">
          <h1>Контакти</h1>
          <p>Свържете се с {BRAND.fullName} за оглед, оценка или консултация.</p>

          <div className="grid sm:grid-cols-2 gap-4 my-6 not-prose">
            <a
              href={`tel:${contactPhone.replace(/\s/g, '')}`}
              className="lux-detail-panel p-4 block text-center no-underline"
              style={{ color: '#6B001C' }}
            >
              <span className="text-xs uppercase tracking-widest block mb-1" style={{ color: '#6b4a52' }}>
                Телефон
              </span>
              <strong className="text-lg">{contactPhone}</strong>
            </a>
            <a
              href={`mailto:${contactEmail}`}
              className="lux-detail-panel p-4 block text-center no-underline"
              style={{ color: '#6B001C' }}
            >
              <span className="text-xs uppercase tracking-widest block mb-1" style={{ color: '#6b4a52' }}>
                Имейл
              </span>
              <strong className="text-lg break-all">{contactEmail}</strong>
            </a>
          </div>

          {sent ? (
            <p className="text-center font-semibold" style={{ color: '#6B001C' }}>
              Съобщението е изпратено. Ще се свържем с вас скоро.
            </p>
          ) : (
            <form onSubmit={handleSubmit} className="lux-search-strip max-w-none mt-4 flex flex-col gap-3">
              <div>
                <label>Име</label>
                <input type="text" value={name} onChange={e => setName(e.target.value)} required />
              </div>
              <div>
                <label>Имейл</label>
                <input type="email" value={email} onChange={e => setEmail(e.target.value)} required />
              </div>
              <div>
                <label>Телефон</label>
                <input type="tel" value={phone} onChange={e => setPhone(e.target.value)} />
              </div>
              <div>
                <label>Съобщение</label>
                <textarea
                  value={message}
                  onChange={e => setMessage(e.target.value)}
                  rows={4}
                  className="w-full resize-none"
                  style={{
                    background: 'rgba(250,247,242,0.85)',
                    border: '1px solid rgba(207,165,74,0.35)',
                    borderRadius: 8,
                    padding: '10px 12px',
                  }}
                />
              </div>
              <button type="submit" disabled={loading} className="lux-btn-burgundy w-full sm:w-auto">
                {loading ? 'Изпращане...' : 'Изпрати запитване'}
              </button>
            </form>
          )}
        </article>
      </div>
    </>
  )
}
