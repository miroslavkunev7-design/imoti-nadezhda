'use client'

import { useState } from 'react'
import Logo from '@/components/ui/Logo'

interface ContactSidebarProps {
  propertyId: number
  phone?: string
  email?: string
}

export default function ContactSidebar({
  propertyId,
  phone = process.env.NEXT_PUBLIC_CONTACT_PHONE ?? '0877 123 456',
  email = process.env.NEXT_PUBLIC_CONTACT_EMAIL ?? 'info@imotinadejda.bg',
}: ContactSidebarProps) {
  const [name,    setName]    = useState('')
  const [emailV,  setEmailV]  = useState('')
  const [phoneV,  setPhoneV]  = useState('')
  const [message, setMessage] = useState('')
  const [sent,    setSent]    = useState(false)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    try {
      await fetch('/api/inquiries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          property_id: propertyId,
          name,
          email: emailV,
          phone: phoneV,
          message,
        }),
      })
      setSent(true)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Contact card */}
      <div
        className="rounded-xl p-5"
        style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)' }}
      >
        <h3 className="text-sm font-semibold text-themed-primary mb-4 uppercase tracking-wider">
          Свържи се с нас
        </h3>

        {/* Phone */}
        <a
          href={`tel:${phone}`}
          className="flex items-center gap-3 mb-3 group"
        >
          <div
            className="w-8 h-8 rounded-full flex items-center justify-center text-crimson-700 flex-shrink-0"
            style={{ background: 'rgba(196,30,58,0.1)' }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 9.81a19.79 19.79 0 01-3.07-8.67A2 2 0 012 .89h3a2 2 0 012 1.72 12.84 12.84 0 00.7 2.81 2 2 0 01-.45 2.11L6.09 8.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45 12.84 12.84 0 002.81.7A2 2 0 0122 16.92z" />
            </svg>
          </div>
          <span className="text-sm text-themed-primary font-medium group-hover:text-crimson-700 transition-colors">
            {phone}
          </span>
        </a>

        {/* Email */}
        <a
          href={`mailto:${email}`}
          className="flex items-center gap-3 mb-5 group"
        >
          <div
            className="w-8 h-8 rounded-full flex items-center justify-center text-crimson-700 flex-shrink-0"
            style={{ background: 'rgba(196,30,58,0.1)' }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
              <polyline points="22,6 12,13 2,6" />
            </svg>
          </div>
          <span className="text-sm text-themed-secondary group-hover:text-crimson-700 transition-colors truncate">
            {email}
          </span>
        </a>

        {/* Inquiry form */}
        {sent ? (
          <div
            className="rounded-lg p-4 text-center"
            style={{ background: 'rgba(196,30,58,0.1)', border: '1px solid rgba(196,30,58,0.2)' }}
          >
            <p className="text-crimson-700 text-sm font-medium">
              Запитването е изпратено успешно!
            </p>
            <p className="text-xs text-themed-secondary mt-1">
              Ще се свържем с вас скоро.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col gap-2.5">
            <input
              type="text"
              placeholder="Вашето име"
              value={name}
              onChange={e => setName(e.target.value)}
              required
              className="input-dark text-sm"
            />
            <input
              type="email"
              placeholder="Имейл адрес"
              value={emailV}
              onChange={e => setEmailV(e.target.value)}
              required
              className="input-dark text-sm"
            />
            <input
              type="tel"
              placeholder="Телефон"
              value={phoneV}
              onChange={e => setPhoneV(e.target.value)}
              className="input-dark text-sm"
            />
            <textarea
              placeholder="Съобщение (по желание)"
              value={message}
              onChange={e => setMessage(e.target.value)}
              rows={3}
              className="input-dark text-sm resize-none"
            />
            <button
              type="submit"
              disabled={loading}
              className="btn-crimson w-full justify-center py-3"
            >
              {loading ? 'Изпращане...' : 'Запази оглед'}
            </button>
          </form>
        )}
      </div>

      {/* Agency card */}
      <div
        className="rounded-xl p-5"
        style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)' }}
      >
        <div className="flex items-start gap-3 mb-4">
          <Logo size="sm" className="flex-shrink-0" />
        </div>

        {/* Rating */}
        <div className="flex items-center gap-2 mb-4">
          <div className="flex gap-0.5">
            {[1,2,3,4,5].map(n => (
              <svg
                key={n}
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill={n <= 4 ? '#c41e3a' : 'none'}
                stroke="#c41e3a"
                strokeWidth="1.5"
              >
                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
              </svg>
            ))}
          </div>
          <span className="text-sm text-themed-primary font-semibold">4.9</span>
          <span className="text-xs text-themed-muted">(128 отзива)</span>
        </div>

        <a
          href="/buy"
          className="flex items-center gap-1.5 text-sm text-crimson-700 hover:text-crimson-400 transition-colors font-medium"
        >
          Виж всички обяви на агенцията
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M5 12h14M12 5l7 7-7 7" />
          </svg>
        </a>
      </div>
    </div>
  )
}
