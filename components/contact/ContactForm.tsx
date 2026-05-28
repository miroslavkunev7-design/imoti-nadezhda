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

  return (
    <div className="marble-property-card p-6 md:p-8">
      <h2 className="font-display mb-6" style={{ fontSize: '1.35rem', color: '#6B001C' }}>
        Изпратете запитване
      </h2>

      {sent ? (
        <p className="text-center py-8" style={{ color: '#CFA54A' }}>
          Благодарим ви! Ще се свържем с вас скоро.
        </p>
      ) : (
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label className="filter-label block mb-1.5">Име</label>
            <input
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              required
              className="input-luxury"
              placeholder="Вашето име"
            />
          </div>
          <div>
            <label className="filter-label block mb-1.5">Имейл</label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              className="input-luxury"
              placeholder="email@example.com"
            />
          </div>
          <div>
            <label className="filter-label block mb-1.5">Телефон</label>
            <input
              type="tel"
              value={phone}
              onChange={e => setPhone(e.target.value)}
              className="input-luxury"
              placeholder="08XX XXX XXX"
            />
          </div>
          <div>
            <label className="filter-label block mb-1.5">Съобщение</label>
            <textarea
              value={message}
              onChange={e => setMessage(e.target.value)}
              rows={4}
              className="input-luxury resize-none"
              placeholder="Опишете какво търсите..."
            />
          </div>
          <button type="submit" disabled={loading} className="btn-gold w-full mt-2">
            {loading ? 'Изпращане...' : 'Изпрати запитване'}
          </button>
        </form>
      )}
    </div>
  )
}
