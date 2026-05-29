'use client'

import { useState } from 'react'
import Link from 'next/link'
import Logo from '@/components/ui/Logo'

interface ContactSidebarProps {
  propertyId: number
  phone?: string
  email?: string
  compact?: boolean
  variant?: 'default' | 'detail'
}

export default function ContactSidebar({
  propertyId,
  phone = process.env.NEXT_PUBLIC_CONTACT_PHONE ?? '0877 123 456',
  email = process.env.NEXT_PUBLIC_CONTACT_EMAIL ?? 'info@imotinadejda.bg',
  compact = false,
  variant = 'default',
}: ContactSidebarProps) {
  const [showForm, setShowForm] = useState(false)
  const [name, setName] = useState('')
  const [emailV, setEmailV] = useState('')
  const [phoneV, setPhoneV] = useState('')
  const [message, setMessage] = useState('')
  const [sent, setSent] = useState(false)
  const [loading, setLoading] = useState(false)

  const isDetail = variant === 'detail'

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    try {
      await fetch('/api/inquiries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ property_id: propertyId, name, email: emailV, phone: phoneV, message }),
      })
      setSent(true)
      setShowForm(false)
    } finally {
      setLoading(false)
    }
  }

  if (isDetail) {
    return (
      <>
        <div className="pd-card pd-contact collage-agent-card">
          <div
            style={{
              width: 72,
              height: 72,
              borderRadius: '50%',
              margin: '0 auto 12px',
              border: '2px solid var(--gold-border)',
              background: 'linear-gradient(135deg, var(--burgundy-secondary), var(--burgundy-primary))',
            }}
          />
          <h3 style={{ textAlign: 'center' }}>Вашият консултант</h3>
          <p style={{ textAlign: 'center', fontSize: 13, margin: '0 0 12px', color: 'var(--gold-light)' }}>
            Имоти Надежда
          </p>

          <a href={`tel:${phone.replace(/\s/g, '')}`} className="pd-contact-row">
            <span className="pd-contact-icon"><PhoneIcon /></span>
            {phone}
          </a>

          <a href={`mailto:${email}`} className="pd-contact-row">
            <span className="pd-contact-icon"><MailIcon /></span>
            <span>{email}</span>
          </a>

          {sent ? (
            <p style={{ fontSize: 12, color: 'var(--gold-light)', textAlign: 'center' }}>Запитването е изпратено!</p>
          ) : showForm ? (
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <input type="text" placeholder="Име" value={name} onChange={e => setName(e.target.value)} required className="input-dark text-sm" />
              <input type="email" placeholder="Имейл" value={emailV} onChange={e => setEmailV(e.target.value)} required className="input-dark text-sm" />
              <input type="tel" placeholder="Телефон" value={phoneV} onChange={e => setPhoneV(e.target.value)} className="input-dark text-sm" />
              <textarea placeholder="Съобщение" value={message} onChange={e => setMessage(e.target.value)} rows={2} className="input-dark text-sm resize-none" />
              <button type="submit" disabled={loading} className="pd-btn-gold">{loading ? '...' : 'Изпрати'}</button>
              <button type="button" onClick={() => setShowForm(false)} style={{ fontSize: 11, color: 'var(--gold-light)', background: 'none', border: 'none', cursor: 'pointer' }}>Отказ</button>
            </form>
          ) : (
            <>
              <button type="button" className="pd-btn-gold" onClick={() => setShowForm(true)}>
                Запази час за оглед
              </button>
              <button type="button" className="pd-btn-outline" onClick={() => setShowForm(true)}>
                Запитване
              </button>
            </>
          )}
        </div>

        <div className="pd-card pd-agency">
          <Logo size="sm" />
          <div className="pd-stars">
            {[1, 2, 3, 4, 5].map(i => (
              <svg key={i} width="12" height="12" viewBox="0 0 24 24" fill="#d4a017">
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
              </svg>
            ))}
            <strong style={{ marginLeft: 4, color: 'var(--pd-text)' }}>4.9</strong>
            <span style={{ color: 'var(--pd-text-muted)' }}>(128 отзива)</span>
          </div>
          <Link href="/buy" className="pd-agency-link">Виж всички обяви на агенцията →</Link>
        </div>
      </>
    )
  }

  if (compact) {
    return (
      <div className="h-full rounded-xl p-3 flex flex-col gap-2" style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)' }}>
        <h3 className="text-[11px] font-semibold uppercase">Свържи се</h3>
        <a href={`tel:${phone}`}>{phone}</a>
        {sent ? <p className="text-xs text-crimson-700">Изпратено!</p> : (
          <form onSubmit={handleSubmit} className="flex flex-col gap-1.5">
            <input type="text" placeholder="Име" value={name} onChange={e => setName(e.target.value)} required className="input-dark text-[11px]" />
            <button type="submit" className="btn-crimson text-[11px] py-2">Запази оглед</button>
          </form>
        )}
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="rounded-xl p-5" style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)' }}>
        <h3 className="text-sm font-semibold mb-4 uppercase">Свържи се с нас</h3>
        <a href={`tel:${phone}`} className="block mb-3 text-sm">{phone}</a>
        <a href={`mailto:${email}`} className="block mb-5 text-sm text-themed-secondary">{email}</a>
        {sent ? (
          <p className="text-crimson-700 text-sm">Запитването е изпратено!</p>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col gap-2.5">
            <input type="text" placeholder="Вашето име" value={name} onChange={e => setName(e.target.value)} required className="input-dark text-sm" />
            <button type="submit" className="btn-crimson w-full py-3">{loading ? '...' : 'Запази оглед'}</button>
          </form>
        )}
      </div>
    </div>
  )
}

function PhoneIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 9.81a19.79 19.79 0 01-3.07-8.67A2 2 0 012 .89h3a2 2 0 012 1.72 12.84 12.84 0 00.7 2.81 2 2 0 01-.45 2.11L6.09 8.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45 12.84 12.84 0 002.81.7A2 2 0 0122 16.92z" />
    </svg>
  )
}

function MailIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
      <polyline points="22,6 12,13 2,6" />
    </svg>
  )
}
