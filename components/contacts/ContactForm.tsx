'use client'

import { useState } from 'react'

export default function ContactForm() {
  const [form, setForm] = useState({ name: '', phone: '', email: '', message: '' })
  const [status, setStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle')

  function set(k: keyof typeof form) {
    return (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      setForm(prev => ({ ...prev, [k]: e.target.value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setStatus('sending')
    try {
      const res = await fetch('/api/inquiries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, source: 'contact_page' }),
      })
      if (res.ok) {
        setStatus('sent')
        setForm({ name: '', phone: '', email: '', message: '' })
      } else {
        setStatus('error')
      }
    } catch {
      setStatus('error')
    }
  }

  if (status === 'sent') {
    return (
      <div style={{ textAlign: 'center', padding: '40px 20px', border: '1.5px solid rgba(207,165,74,0.35)', borderRadius: 14, background: '#fff' }}>
        <div style={{ fontSize: 32, marginBottom: 12 }}>✓</div>
        <h3 style={{ fontFamily: 'var(--font-playfair),Georgia,serif', color: '#6b001c', margin: '0 0 8px' }}>Съобщението е изпратено!</h3>
        <p style={{ color: 'rgba(107,0,28,0.65)', fontSize: 13 }}>Ще се свържем с вас скоро.</p>
        <button onClick={() => setStatus('idle')} style={{ marginTop: 16, padding: '10px 24px', borderRadius: 8, border: '1.5px solid #CFA54A', background: 'transparent', color: '#6b001c', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>
          Изпрати ново съобщение
        </button>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="rd-contact-form">
      <h2 className="rd-contact-form__title">Изпратете съобщение</h2>

      <input
        type="text"
        className="rd-input"
        placeholder="Вашето име"
        value={form.name}
        onChange={set('name')}
        required
      />
      <input
        type="tel"
        className="rd-input"
        placeholder="Телефон"
        value={form.phone}
        onChange={set('phone')}
        required
      />
      <input
        type="email"
        className="rd-input"
        placeholder="Имейл адрес"
        value={form.email}
        onChange={set('email')}
      />
      <textarea
        className="rd-textarea"
        placeholder="Вашето съобщение..."
        value={form.message}
        onChange={set('message')}
        required
      />

      {status === 'error' && (
        <p style={{ color: '#c0392b', fontSize: 12, margin: 0 }}>Грешка при изпращане. Опитайте отново.</p>
      )}

      <button
        type="submit"
        className="rd-contact-form__submit"
        disabled={status === 'sending'}
      >
        {status === 'sending' ? 'Изпращане...' : 'Прати'}
      </button>
    </form>
  )
}
