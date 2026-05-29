'use client'

import { useEffect, useState } from 'react'
import { cardStyle } from '@/components/admin/AdminCard'

export default function MilenaConfigPanel() {
  const [ready, setReady] = useState<boolean | null>(null)
  const [canConfigure, setCanConfigure] = useState(false)
  const [apiKey, setApiKey] = useState('')
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState<string | null>(null)

  useEffect(() => {
    fetch('/api/admin/milena-config')
      .then(r => r.json())
      .then(j => {
        if (j.success) {
          setReady(Boolean(j.milenaReady))
          setCanConfigure(Boolean(j.canConfigure))
        }
      })
      .catch(() => setReady(null))
  }, [])

  async function save() {
    if (!apiKey.trim()) return
    setSaving(true)
    setMessage(null)
    try {
      const res = await fetch('/api/admin/milena-config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ apiKey: apiKey.trim() }),
      })
      const j = await res.json()
      if (j.success) {
        setReady(Boolean(j.milenaReady))
        setApiKey('')
        setMessage(j.message ?? 'Запазено.')
      } else {
        setMessage(j.error ?? 'Грешка')
      }
    } catch {
      setMessage('Грешка при запис.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="mt-5 rounded-xl p-6" style={cardStyle}>
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h2 className="font-display text-white font-semibold mb-1">Милена AI</h2>
          <p className="text-[rgba(255,255,255,0.45)] text-sm max-w-xl">
            На Vercel Милена се активира автоматично чрез AI Gateway (без OpenAI акаунт). По избор
            можете да добавите собствен OpenAI ключ по-долу.
          </p>
        </div>
        <span
          className="text-xs font-medium px-2 py-1 rounded-full"
          style={
            ready
              ? { background: 'rgba(34,197,94,0.15)', color: '#86efac' }
              : { background: 'rgba(234,179,8,0.12)', color: '#fde047' }
          }
        >
          {ready === null ? '…' : ready ? 'AI активен' : 'Нужен OpenAI ключ'}
        </span>
      </div>

      {canConfigure ? (
        <div className="mt-4 flex flex-col gap-2 max-w-lg">
          <label className="text-xs text-white/50">
            OpenAI API ключ (от platform.openai.com → API keys)
          </label>
          <input
            type="password"
            className="input-dark text-sm"
            placeholder="sk-proj-..."
            value={apiKey}
            onChange={e => setApiKey(e.target.value)}
            autoComplete="off"
          />
          <button
            type="button"
            className="btn-crimson text-sm w-fit disabled:opacity-50"
            disabled={saving || !apiKey.trim()}
            onClick={save}
          >
            {saving ? 'Запис…' : 'Активирай Милена'}
          </button>
          {message && <p className="text-xs text-white/70">{message}</p>}
        </div>
      ) : (
        <p className="mt-3 text-xs text-white/45">Само администратор може да зададе ключа.</p>
      )}
    </div>
  )
}
