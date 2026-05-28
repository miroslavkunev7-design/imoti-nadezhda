'use client'

import { useState } from 'react'

export default function ContactForm() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [message, setMessage] = useState('')
  const [sent, setSent] = useState(false)
  const [loading, setLoading] = useState(false)

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

  if (sent) {
    return (
      <p style={{ color: 'var(--lux-burgundy)', fontWeight: 600 }}>
        Благодарим ви! Ще се свържем скоро.
      </p>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="lux-search-strip" style={{ boxShadow: 'none' }}>
      <div className="flex flex-col gap-4">
        <div>
          <label className="lux-field-label">Име</label>
          <input type="text" value={name} onChange={e => setName(e.target.value)} required />
        </div>
        <div>
          <label className="lux-field-label">Имейл</label>
          <input type="email" value={email} onChange={e => setEmail(e.target.value)} required />
        </div>
        <div>
          <label className="lux-field-label">Телефон</label>
          <input type="tel" value={phone} onChange={e => setPhone(e.target.value)} />
        </div>
        <div>
          <label className="lux-field-label">Съобщение</label>
          <textarea
            value={message}
            onChange={e => setMessage(e.target.value)}
            rows={4}
            style={{
              width: '100%',
              padding: 10,
              borderRadius: 8,
              border: '1px solid rgba(207,165,74,0.35)',
              background: 'rgba(255,255,255,0.85)',
            }}
          />
        </div>
        <button type="submit" className="lux-btn-burgundy lux-shimmer w-full" disabled={loading}>
          {loading ? 'Изпращане...' : 'Изпрати запитване'}
        </button>
      </div>
    </form>
  )
}
