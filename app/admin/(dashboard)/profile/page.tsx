'use client'

import { useEffect, useRef, useState } from 'react'
import { uploadAvatarImage } from '@/lib/upload-client'

interface Stats {
  clients: number
  active_clients: number
  properties: number
  tasks_done: number
  deals: number
}

export default function ProfilePage() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null)
  const [role, setRole] = useState('')
  const [stats, setStats] = useState<Stats | null>(null)
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [message, setMessage] = useState('')
  const fileRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    fetch('/api/admin/me')
      .then(r => r.json())
      .then(json => {
        if (json.success && json.user) {
          setName(json.user.name ?? '')
          setEmail(json.user.email ?? '')
          setPhone(json.user.phone ?? '')
          setAvatarUrl(json.user.avatar_url ?? null)
          setRole(json.user.role ?? '')
          setStats(json.stats ?? null)
        }
      })
  }, [])

  async function handleAvatar(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    setMessage('')
    try {
      const url = await uploadAvatarImage(file, file.name)
      const res = await fetch('/api/admin/me', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ avatar_url: url }),
      })
      const json = await res.json()
      if (json.success) {
        setAvatarUrl(url)
        setMessage('Аватарът е обновен')
      } else {
        setMessage(json.error ?? 'Грешка')
      }
    } catch (err) {
      setMessage(err instanceof Error ? err.message : 'Грешка при качване')
    } finally {
      setUploading(false)
      if (fileRef.current) fileRef.current.value = ''
    }
  }

  async function saveProfile() {
    setSaving(true)
    setMessage('')
    try {
      const res = await fetch('/api/admin/me', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, phone }),
      })
      const json = await res.json()
      setMessage(json.success ? 'Профилът е запазен' : (json.error ?? 'Грешка'))
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="max-w-[640px]">
      <h1 className="font-display text-white text-2xl font-bold mb-6">Моят профил</h1>

      <div className="property-card-surface p-6 mb-5">
        <div className="flex items-center gap-5 mb-6">
          <div className="relative">
            {avatarUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={avatarUrl} alt="" className="w-20 h-20 rounded-full object-cover" />
            ) : (
              <div className="w-20 h-20 rounded-full flex items-center justify-center text-2xl font-bold text-white"
                style={{ background: '#A86B3D' }}>
                {name.charAt(0).toUpperCase() || '?'}
              </div>
            )}
          </div>
          <div>
            <p className="text-white font-semibold">{name || 'Потребител'}</p>
            <p className="text-sm text-[rgba(255,255,255,0.5)]">{role === 'admin' ? 'Администратор' : 'Брокер'}</p>
            <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleAvatar} />
            <button onClick={() => fileRef.current?.click()} disabled={uploading}
              className="btn-ghost text-xs mt-2 py-1.5 px-3">
              {uploading ? 'Качване...' : 'Смени аватар от компютъра'}
            </button>
          </div>
        </div>

        {stats && role !== 'admin' && (
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mb-6">
            {[
              { label: 'Клиенти', value: stats.clients },
              { label: 'Активни', value: stats.active_clients },
              { label: 'Имоти', value: stats.properties },
              { label: 'Задачи ✓', value: stats.tasks_done },
              { label: 'Сделки', value: stats.deals },
            ].map(s => (
              <div key={s.label} className="text-center p-3 rounded-lg" style={{ background: 'rgba(196,30,58,0.08)' }}>
                <p className="text-xl font-bold text-crimson-700 font-display">{s.value}</p>
                <p className="text-[10px] text-[rgba(255,255,255,0.45)]">{s.label}</p>
              </div>
            ))}
          </div>
        )}

        <div className="grid grid-cols-1 gap-3 mb-4">
          <input className="input-dark" placeholder="Име" value={name} onChange={e => setName(e.target.value)} />
          <input className="input-dark" placeholder="Имейл" value={email} disabled />
          <input className="input-dark" placeholder="Телефон" value={phone} onChange={e => setPhone(e.target.value)} />
        </div>

        {message && (
          <p className="text-sm text-crimson-400 mb-3">{message}</p>
        )}

        <button onClick={saveProfile} disabled={saving} className="btn-crimson text-sm px-5 py-2">
          {saving ? 'Запис...' : 'Запази профила'}
        </button>
      </div>
    </div>
  )
}
