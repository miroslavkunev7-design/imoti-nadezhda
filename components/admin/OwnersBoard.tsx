'use client'
import { useCallback, useEffect, useState } from 'react'
import { adminCardClass, PageHeader, tableCellStyle, tableHeaderStyle } from '@/components/admin/AdminCard'

interface PropertyOwner {
  id: number
  name: string | null
  phone: string
  city: string
  city_slug: string
  district: string
  district_slug: string
  source: string
  source_url: string | null
  notes: string | null
  created_at: string
}

const CITIES = [
  { slug: 'shumen', name: 'Шумен' },
  { slug: 'varna', name: 'Варна' },
  { slug: 'burgas', name: 'Бургас' },
  { slug: 'novi-pazar', name: 'Нови пазар' },
]

const SOURCE_LABELS: Record<string, string> = {
  realistimo: 'Realistimo',
  olx: 'OLX.bg',
  imotibg: 'Imoti.bg',
  bazar: 'Bazar.bg',
  homebg: 'Home.bg',
  manual: 'Ръчно',
}

export default function OwnersBoard() {
  const [owners, setOwners] = useState<PropertyOwner[]>([])
  const [loading, setLoading] = useState(true)
  const [cityFilter, setCityFilter] = useState('')
  const [showAdd, setShowAdd] = useState(false)
  const [form, setForm] = useState({ name: '', phone: '', city: 'Шумен', city_slug: 'shumen', district: '', notes: '' })
  const [saving, setSaving] = useState(false)
  const [msg, setMsg] = useState('')

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const params = cityFilter ? `?city=${cityFilter}` : ''
      const res = await fetch(`/api/admin/owners${params}`)
      const json = await res.json()
      if (json.success) setOwners(json.owners ?? [])
    } finally {
      setLoading(false)
    }
  }, [cityFilter])

  useEffect(() => { load() }, [load])

  async function addOwner() {
    if (!form.phone.trim()) { setMsg('Телефонът е задължителен'); return }
    if (!form.city.trim()) { setMsg('Изберете град'); return }
    setSaving(true); setMsg('')
    try {
      const res = await fetch('/api/admin/owners', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, source: 'manual' }),
      })
      const json = await res.json()
      if (json.success) {
        setMsg('Собственикът е добавен.')
        setShowAdd(false)
        setForm({ name: '', phone: '', city: 'Шумен', city_slug: 'shumen', district: '', notes: '' })
        await load()
      } else {
        setMsg(json.error ?? 'Грешка при добавяне (телефонът вероятно вече съществува за този град).')
      }
    } finally { setSaving(false) }
  }

  async function deleteOwner(id: number) {
    if (!confirm('Изтриване на собственик?')) return
    await fetch(`/api/admin/owners?id=${id}`, { method: 'DELETE' })
    setOwners(prev => prev.filter(o => o.id !== id))
  }

  const cityName = CITIES.find(c => c.slug === cityFilter)?.name ?? 'Всички градове'

  return (
    <div>
      <PageHeader title="Собственици"
        action={
          <button type="button" onClick={() => setShowAdd(v => !v)} className="btn-crimson text-sm px-4 py-1.5">
            + Добави собственик
          </button>
        }
      />
      <p className="admin-text-muted text-sm mb-4 -mt-3">
        Телефони на собственици, извлечени автоматично при синхронизация на пазара или добавени ръчно.
        Филтрирайте по град.
      </p>

      {/* City filter */}
      <div className={`${adminCardClass} mb-5 flex flex-wrap items-center gap-2`}>
        <span className="text-xs admin-text-muted">Град:</span>
        <button onClick={() => setCityFilter('')}
          className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors ${!cityFilter ? 'btn-crimson' : 'btn-ghost'}`}>
          Всички
        </button>
        {CITIES.map(c => (
          <button key={c.slug} onClick={() => setCityFilter(c.slug)}
            className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors ${cityFilter === c.slug ? 'btn-crimson' : 'btn-ghost'}`}>
            {c.name}
          </button>
        ))}
        {msg && <p className="text-xs admin-text-muted flex-1 min-w-[200px]">{msg}</p>}
      </div>

      {/* Add form */}
      {showAdd && (
        <div className={`${adminCardClass} rounded-xl p-5 mb-4`}>
          <h3 className="text-sm font-semibold mb-3" style={{ color: 'var(--gold,#CFA847)' }}>Нов собственик</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 mb-3">
            <input className="input-dark text-sm" placeholder="Име (незадължително)"
              value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} />
            <input required className="input-dark text-sm" placeholder="Телефон *"
              value={form.phone} onChange={e => setForm(p => ({ ...p, phone: e.target.value }))} />
            <select className="input-dark text-sm" value={form.city_slug}
              onChange={e => {
                const c = CITIES.find(x => x.slug === e.target.value)
                setForm(p => ({ ...p, city_slug: e.target.value, city: c?.name ?? '' }))
              }}>
              {CITIES.map(c => <option key={c.slug} value={c.slug}>{c.name}</option>)}
            </select>
            <input className="input-dark text-sm" placeholder="Квартал / адрес"
              value={form.district} onChange={e => setForm(p => ({ ...p, district: e.target.value }))} />
            <input className="input-dark text-sm col-span-2" placeholder="Бележки (имот, цена...)"
              value={form.notes} onChange={e => setForm(p => ({ ...p, notes: e.target.value }))} />
          </div>
          <div className="flex gap-2">
            <button type="button" onClick={addOwner} disabled={saving} className="btn-crimson text-sm px-5 py-2">
              {saving ? 'Добавяне...' : 'Добави'}
            </button>
            <button type="button" onClick={() => { setShowAdd(false); setMsg('') }} className="btn-ghost text-sm px-4 py-2">Отказ</button>
          </div>
        </div>
      )}

      {/* Table */}
      <div className={`${adminCardClass} rounded-xl overflow-hidden`}>
        <div className="px-4 pt-3 pb-1 flex items-center justify-between">
          <h3 className="admin-heading text-sm font-semibold">
            {cityName} ({owners.length})
          </h3>
        </div>
        <table className="w-full">
          <thead>
            <tr style={tableHeaderStyle}>
              {['Телефон', 'Собственик', 'Град', 'Квартал / Имот', 'Източник', 'Дата', 'Действия'].map(h => (
                <th key={h} className="text-left px-4 py-3 text-[10px] admin-table-head uppercase tracking-wider font-medium">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={7} className="px-4 py-10 text-center admin-text-faint text-sm">Зареждане...</td></tr>
            ) : owners.length === 0 ? (
              <tr><td colSpan={7} className="px-4 py-12 text-center admin-text-faint">
                Няма собственици. При извличане на имоти с телефон те се добавят автоматично.
              </td></tr>
            ) : owners.map(o => (
              <tr key={o.id} className="hover:bg-[rgba(207,168,71,0.03)] transition-colors">
                <td className="px-4 py-3" style={tableCellStyle}>
                  <span className="font-mono text-sm admin-text font-semibold">{o.phone}</span>
                </td>
                <td className="px-4 py-3 admin-table-cell text-sm" style={tableCellStyle}>
                  {o.name ?? <span className="admin-text-faint italic">—</span>}
                </td>
                <td className="px-4 py-3 text-sm admin-text" style={tableCellStyle}>{o.city}</td>
                <td className="px-4 py-3 text-xs admin-text-muted" style={tableCellStyle}>
                  <div className="max-w-[180px]">
                    {o.district && <div>{o.district}</div>}
                    {o.notes && <div className="truncate" title={o.notes}>{o.notes}</div>}
                  </div>
                </td>
                <td className="px-4 py-3 text-xs" style={{ ...tableCellStyle, color: 'var(--gold,#CFA847)' }}>
                  {SOURCE_LABELS[o.source] ?? o.source}
                  {o.source_url && (
                    <a href={o.source_url} target="_blank" rel="noreferrer"
                      className="ml-1 text-[10px] opacity-60 hover:opacity-100">↗</a>
                  )}
                </td>
                <td className="px-4 py-3 admin-text-faint text-xs" style={tableCellStyle}>
                  {new Date(o.created_at).toLocaleDateString('bg-BG')}
                </td>
                <td className="px-4 py-3" style={tableCellStyle}>
                  <button type="button" onClick={() => deleteOwner(o.id)}
                    className="text-xs text-red-400 hover:text-red-300 font-medium">Изтрий</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
