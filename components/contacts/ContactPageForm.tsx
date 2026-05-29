'use client'

import { useState } from 'react'

export default function ContactPageForm() {
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
    return <p style={{ color: 'var(--gold-light)', fontSize: 14 }}>Съобщението е изпратено успешно!</p>
  }

  return (
    <form onSubmit={handleSubmit}>
      <h2 style={{ fontFamily: 'var(--font-playfair)', color: 'var(--gold-light)', margin: '0 0 20px', fontSize: '1.25rem' }}>
        Свържете се с нас
      </h2>
      <input type="text" placeholder="Име" value={name} onChange={e => setName(e.target.value)} required />
      <input type="email" placeholder="Имейл" value={email} onChange={e => setEmail(e.target.value)} required />
      <input type="tel" placeholder="Телефон" value={phone} onChange={e => setPhone(e.target.value)} />
      <textarea placeholder="Съобщение" rows={4} value={message} onChange={e => setMessage(e.target.value)} required />
      <button type="submit" className="collage-contact__submit" disabled={loading}>
        {loading ? 'Изпращане...' : 'Изпрати'}
      </button>
    </form>
  )
}
