'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function AdminLoginForm({ redirectTo }: { redirectTo: string }) {
  const router = useRouter()
  const [email,    setEmail]    = useState('')
  const [password, setPassword] = useState('')
  const [error,    setError]    = useState('')
  const [loading,  setLoading]  = useState(false)
  const [showPass, setShowPass] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!email || !password) { setError('Попълни всички полета'); return }
    setLoading(true)
    setError('')
    try {
      const res  = await fetch('/api/auth/admin-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      })
      const json = await res.json()
      if (json.success) {
        router.push(redirectTo)
        router.refresh()
      } else {
        setError(json.error ?? 'Невалиден имейл или парола')
      }
    } catch {
      setError('Грешка при свързване')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">

      {/* Divider + label */}
      <div className="flex items-center gap-3">
        <div className="flex-1 h-px" style={{ background: 'rgba(196,30,58,0.35)' }} />
        <span className="text-[11px] font-semibold uppercase tracking-widest text-crimson-700 whitespace-nowrap">
          Admin Login
        </span>
        <div className="flex-1 h-px" style={{ background: 'rgba(196,30,58,0.35)' }} />
      </div>

      {/* Email */}
      <div className="flex flex-col gap-1.5">
        <label className="filter-label">Имейл адрес</label>
        <input
          type="email"
          className="input-dark"
          placeholder="broker@imotinadejda.bg"
          value={email}
          onChange={e => setEmail(e.target.value)}
          autoComplete="username"
          autoFocus
        />
      </div>

      {/* Password */}
      <div className="flex flex-col gap-1.5">
        <label className="filter-label">Парола</label>
        <div className="relative">
          <input
            type={showPass ? 'text' : 'password'}
            className="input-dark pr-10"
            placeholder="••••••••"
            value={password}
            onChange={e => setPassword(e.target.value)}
            autoComplete="current-password"
          />
          <button
            type="button"
            onClick={() => setShowPass(v => !v)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-themed-muted hover:text-themed-primary transition-colors"
          >
            {showPass ? <EyeOffIcon /> : <EyeIcon />}
          </button>
        </div>
      </div>

      {/* Error */}
      {error && (
        <p className="text-sm text-crimson-700 bg-[rgba(196,30,58,0.08)] border border-[rgba(196,30,58,0.2)] rounded-lg px-4 py-2.5">
          {error}
        </p>
      )}

      {/* Submit */}
      <button
        type="submit"
        disabled={loading}
        className="btn-crimson w-full justify-center py-3 mt-1"
      >
        {loading ? 'Влизане...' : 'Влез в панела'}
      </button>
    </form>
  )
}

function EyeIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>
    </svg>
  )
}
function EyeOffIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/>
    </svg>
  )
}
