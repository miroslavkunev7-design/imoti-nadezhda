'use client'

import { useState } from 'react'
import LuxuryLogo from '@/components/ui/LuxuryLogo'

interface LuxuryAgentCardProps {
  propertyId: number
  phone?: string
}

export default function LuxuryAgentCard({
  propertyId,
  phone = process.env.NEXT_PUBLIC_CONTACT_PHONE ?? '0877 123 456',
}: LuxuryAgentCardProps) {
  const [showForm, setShowForm] = useState(false)
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [phoneV, setPhoneV] = useState('')
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
        body: JSON.stringify({
          property_id: propertyId,
          name,
          email,
          phone: phoneV,
          message,
        }),
      })
      setSent(true)
      setShowForm(false)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="lux-agent-card lux-shimmer">
      <div className="mb-4 opacity-90 [&_.lux-logo__line1]:text-white/80 [&_.lux-logo__line2]:text-white">
        <LuxuryLogo />
      </div>
      <p className="text-sm font-semibold mb-1">Вашият брокер</p>
      <a
        href={`tel:${phone.replace(/\s/g, '')}`}
        className="text-lg font-bold text-[#CFA54A] block mb-4"
      >
        {phone}
      </a>

      {sent ? (
        <p className="text-sm text-center text-[#CFA54A]">Запитването е изпратено!</p>
      ) : showForm ? (
        <form onSubmit={handleSubmit} className="flex flex-col gap-2">
          <input
            type="text"
            placeholder="Име"
            value={name}
            onChange={e => setName(e.target.value)}
            required
            className="rounded-lg px-3 py-2 text-sm text-[#3d1520] border border-[rgba(207,165,74,0.4)]"
          />
          <input
            type="email"
            placeholder="Имейл"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
            className="rounded-lg px-3 py-2 text-sm text-[#3d1520] border border-[rgba(207,165,74,0.4)]"
          />
          <textarea
            placeholder="Съобщение"
            value={message}
            onChange={e => setMessage(e.target.value)}
            rows={2}
            className="rounded-lg px-3 py-2 text-sm text-[#3d1520] border border-[rgba(207,165,74,0.4)] resize-none"
          />
          <button type="submit" disabled={loading} className="lux-agent-card__btn lux-agent-card__btn--gold">
            {loading ? '...' : 'Изпрати'}
          </button>
          <button
            type="button"
            onClick={() => setShowForm(false)}
            className="text-xs text-white/60 bg-transparent border-0 cursor-pointer"
          >
            Отказ
          </button>
        </form>
      ) : (
        <>
          <button
            type="button"
            className="lux-agent-card__btn lux-agent-card__btn--gold"
            onClick={() => setShowForm(true)}
          >
            Запази час за оглед
          </button>
          <button
            type="button"
            className="lux-agent-card__btn lux-agent-card__btn--outline"
            onClick={() => setShowForm(true)}
          >
            Запитване
          </button>
        </>
      )}
    </div>
  )
}
