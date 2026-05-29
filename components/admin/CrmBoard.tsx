'use client'
import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { adminCardClass, cardStyle, PageHeader, tableCellStyle, tableHeaderStyle } from '@/components/admin/AdminCard'
import MortgageApplicationModal from '@/components/admin/MortgageApplicationModal'

interface Client {
  id: number
  name: string
  email: string
  phone: string
  source: string
  status: string
  budget_min: number
  budget_max: number
  created_at: string
  city?: string
  property_type?: string
  search_description?: string
}

interface Note {
  id: number
  note: string
  created_at: string
  author_name?: string
}

interface PropertyMatch {
  id: number
  title: string
  price: number
  city: string
  quarter: string
  property_type: string
}

const SOURCE_LABELS: Record<string, string> = {
  website: 'Сайт', referral: 'Препоръка', direct: 'Директен', social: 'Социални'
}

const PROPERTY_TYPES = ['Апартамент', 'Къща', 'Парцел', 'Офис', 'Магазин', 'Друго']
const CITIES = ['Шумен', 'Варна', 'Бургас', 'Нови пазар']

function MatchBanner({ matches }: { matches: PropertyMatch[] }) {
  if (!matches.length) return null
  return (
    <div className="rounded-xl p-3 mt-3 border" style={{
      background: 'rgba(207,168,71,0.08)',
      borderColor: 'rgba(207,168,71,0.35)',
    }}>
      <p className="text-xs font-semibold mb-2" style={{ color: 'var(--gold,#CFA847)' }}>
        ✦ {matches.length} съвпадащ{matches.length === 1 ? 'ия имот' : 'и имота'} по критерии
      </p>
      <div className="flex flex-col gap-1.5">
        {matches.map(m => (
          <a key={m.id} href={`/admin/properties/${m.id}/edit`} target="_blank" rel="noreferrer"
            className="flex items-center justify-between rounded-lg px-3 py-2 text-xs transition-colors hover:opacity-90"
            style={{ background: 'rgba(207,168,71,0.07)', border: '1px solid rgba(207,168,71,0.18)' }}>
            <span className="admin-text font-medium">{m.title} — {m.city}/{m.quarter}</span>
            <span style={{ color: 'var(--gold,#CFA847)' }} className="font-semibold flex-shrink-0 ml-2">
              {Number(m.price).toLocaleString('bg-BG')} €
            </span>
          </a>
        ))}
      </div>
    </div>
  )
}

export default function CrmBoard({ clients: initial }: { clients: Client[] }) {
  const router = useRouter()
  const [clients, setClients] = useState(initial)
  const [showAdd, setShowAdd] = useState(false)
  const [form, setForm] = useState({
    name: '', email: '', phone: '', source: 'website',
    budget_min: '', budget_max: '',
    city: '', property_type: '', search_description: '',
  })
  const [saving, setSaving] = useState(false)
  const [formError, setFormError] = useState('')
  const [view, setView] = useState<'table' | 'kanban'>('table')
  const [detailClient, setDetailClient] = useState<Client | null>(null)
  const [mortgageClient, setMortgageClient] = useState<Client | null>(null)
  const [editForm, setEditForm] = useState({
    name: '', email: '', phone: '', budget_min: '', budget_max: '', status: 'lead',
    city: '', property_type: '', search_description: '',
  })
  const [notes, setNotes] = useState<Note[]>([])
  const [newNote, setNewNote] = useState('')
  const [notesLoading, setNotesLoading] = useState(false)

  // Matching state
  const [matches, setMatches] = useState<PropertyMatch[]>([])
  const matchTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Debounced matching search as user fills in the form
  useEffect(() => {
    if (matchTimer.current) clearTimeout(matchTimer.current)
    const { city, property_type, budget_min, budget_max } = form
    if (!city && !property_type && !budget_min) {
      setMatches([])
      return
    }
    matchTimer.current = setTimeout(async () => {
      try {
        const params = new URLSearchParams()
        if (city) params.set('match_city', city)
        if (property_type) params.set('match_type', property_type)
        if (budget_min) params.set('match_budget_min', budget_min)
        if (budget_max) params.set('match_budget_max', budget_max)
        const res = await fetch(`/api/admin/clients?${params}`)
        const json = await res.json()
        setMatches(json.matches ?? [])
      } catch {
        setMatches([])
      }
    }, 600)
    return () => { if (matchTimer.current) clearTimeout(matchTimer.current) }
  }, [form.city, form.property_type, form.budget_min, form.budget_max])

  async function addClient() {
    if (!form.name.trim()) { setFormError('Въведете пълно име на клиента'); return }
    setSaving(true); setFormError('')
    try {
      const res = await fetch('/api/admin/clients', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: form.name.trim(),
          email: form.email.trim(),
          phone: form.phone.trim(),
          source: form.source,
          budget_min: form.budget_min,
          budget_max: form.budget_max,
          city: form.city,
          property_type: form.property_type,
          search_description: form.search_description,
        }),
      })
      let json: { success?: boolean; id?: number; error?: string; local?: boolean }
      try { json = await res.json() } catch { setFormError('Невалиден отговор от сървъра'); return }
      if (!res.ok) { setFormError(json.error ?? `Грешка (${res.status})`); return }
      const newId = Number(json.id)
      if (!newId) { setFormError(json.error ?? 'Клиентът не беше записан — липсва ID'); return }
      setClients(prev => [{
        name: form.name.trim(), email: form.email.trim(), phone: form.phone.trim(),
        source: form.source, id: newId, status: 'lead',
        budget_min: Number(form.budget_min) || 0, budget_max: Number(form.budget_max) || 0,
        created_at: new Date().toISOString(),
        city: form.city, property_type: form.property_type, search_description: form.search_description,
      }, ...prev])
      setShowAdd(false)
      setForm({ name: '', email: '', phone: '', source: 'website', budget_min: '', budget_max: '', city: '', property_type: '', search_description: '' })
      setMatches([])
      router.refresh()
    } catch { setFormError('Мрежова грешка — опитайте отново') }
    finally { setSaving(false) }
  }

  async function changeStatus(id: number, status: string) {
    setClients(prev => prev.map(c => c.id === id ? { ...c, status } : c))
    await fetch(`/api/admin/clients/${id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status }) })
  }

  async function openDetail(client: Client) {
    setDetailClient(client)
    setEditForm({
      name: client.name, email: client.email, phone: client.phone ?? '',
      budget_min: client.budget_min ? String(client.budget_min) : '',
      budget_max: client.budget_max ? String(client.budget_max) : '',
      status: client.status,
      city: client.city ?? '', property_type: client.property_type ?? '',
      search_description: client.search_description ?? '',
    })
    setNewNote(''); setNotesLoading(true)
    try {
      const res = await fetch(`/api/admin/clients/${client.id}/notes`)
      const json = await res.json()
      setNotes(json.notes ?? [])
    } catch { setNotes([]) }
    finally { setNotesLoading(false) }
  }

  async function saveClient() {
    if (!detailClient) return
    setSaving(true)
    try {
      const res = await fetch(`/api/admin/clients/${detailClient.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: editForm.name, email: editForm.email, phone: editForm.phone,
          budget_min: editForm.budget_min, budget_max: editForm.budget_max, status: editForm.status,
          city: editForm.city, property_type: editForm.property_type,
          search_description: editForm.search_description,
        }),
      })
      const json = await res.json()
      if (json.success) {
        const updated = {
          ...detailClient,
          name: editForm.name, email: editForm.email, phone: editForm.phone,
          budget_min: Number(editForm.budget_min) || 0, budget_max: Number(editForm.budget_max) || 0,
          status: editForm.status, city: editForm.city,
          property_type: editForm.property_type, search_description: editForm.search_description,
        }
        setClients(prev => prev.map(c => c.id === detailClient.id ? updated : c))
        setDetailClient(updated)
      }
    } finally { setSaving(false) }
  }

  async function deleteClient() {
    if (!detailClient) return
    if (!confirm(`Изтриване на клиент "${detailClient.name}"?`)) return
    const res = await fetch(`/api/admin/clients/${detailClient.id}`, { method: 'DELETE' })
    const json = await res.json()
    if (json.success) { setClients(prev => prev.filter(c => c.id !== detailClient.id)); setDetailClient(null) }
    else alert(json.error ?? 'Грешка')
  }

  async function addNote() {
    if (!detailClient || !newNote.trim()) return
    const res = await fetch(`/api/admin/clients/${detailClient.id}/notes`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ note: newNote }),
    })
    const json = await res.json()
    if (json.success) {
      setNotes(prev => [{ id: json.id, note: newNote.trim(), created_at: new Date().toISOString(), author_name: 'Админ' }, ...prev])
      setNewNote('')
    } else alert(json.error ?? 'Грешка при бележка')
  }

  async function deleteNote(noteId: number) {
    if (!detailClient || !confirm('Изтриване на бележката?')) return
    await fetch(`/api/admin/clients/${detailClient.id}/notes/${noteId}`, { method: 'DELETE' })
    setNotes(prev => prev.filter(n => n.id !== noteId))
  }

  return (
    <div>
      <PageHeader title={`Клиенти (${clients.length})`}
        action={
          <div className="flex gap-2">
            <div className="flex rounded-lg overflow-hidden" style={{ border: '1px solid rgba(207,168,71,0.22)' }}>
              {(['table', 'kanban'] as const).map(v => (
                <button key={v} onClick={() => setView(v)}
                  className={`px-3 py-1.5 text-xs font-medium transition-colors ${view === v ? 'bg-crimson-700 text-white' : 'admin-text-muted hover:opacity-90'}`}>
                  {v === 'table' ? '☰ Таблица' : '⊞ Kanban'}
                </button>
              ))}
            </div>
            <button type="button" onClick={() => { setShowAdd(v => !v); setFormError(''); setMatches([]) }}
              className="btn-crimson text-sm px-4 py-1.5">
              + Добави клиент
            </button>
          </div>
        }
      />

      {/* Mortgage banner */}
      <div className={`${adminCardClass} rounded-xl p-4 mb-4 flex flex-wrap items-center justify-between gap-3`}
        style={{ ...cardStyle, border: '1px solid rgba(207,168,71,0.18)' }}>
        <div>
          <p className="text-sm admin-text font-medium">Ипотечна кандидатура</p>
          <p className="text-xs admin-text-muted">Избери клиент от таблицата и пусни документи към ОББ или ИБанк</p>
        </div>
        <button type="button" disabled={clients.length === 0}
          onClick={() => { if (clients.length === 1) setMortgageClient(clients[0]); else if (detailClient) setMortgageClient(detailClient); else alert('Отвори клиент (Редакция) или избери ред с бутона „Ипотека"') }}
          className="btn-ghost text-sm px-4 py-2 disabled:opacity-40">
          Пусни кандидатура за ипотека
        </button>
      </div>

      {/* Add client form */}
      {showAdd && (
        <form className={`${adminCardClass} rounded-xl p-5 mb-4`} style={cardStyle}
          onSubmit={e => { e.preventDefault(); addClient() }}>
          <h3 className="text-sm font-semibold admin-text mb-3" style={{ color: 'var(--gold,#CFA847)' }}>
            Нов клиент
          </h3>
          {formError && <p className="text-sm text-red-300 mb-3" role="alert">{formError}</p>}

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 mb-3">
            <input required className="input-dark text-sm" placeholder="Пълно име *"
              value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} />
            <input className="input-dark text-sm" placeholder="Имейл (незадължителен)"
              type="email" value={form.email} onChange={e => setForm(p => ({ ...p, email: e.target.value }))} />
            <input className="input-dark text-sm" placeholder="Телефон"
              value={form.phone} onChange={e => setForm(p => ({ ...p, phone: e.target.value }))} />
            <select className="input-dark text-sm" value={form.city}
              onChange={e => setForm(p => ({ ...p, city: e.target.value }))}>
              <option value="">— Град —</option>
              {CITIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
            <select className="input-dark text-sm" value={form.property_type}
              onChange={e => setForm(p => ({ ...p, property_type: e.target.value }))}>
              <option value="">— Тип имот —</option>
              {PROPERTY_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
            <select className="input-dark text-sm" value={form.source}
              onChange={e => setForm(p => ({ ...p, source: e.target.value }))}>
              {Object.entries(SOURCE_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
            </select>
            <input className="input-dark text-sm" placeholder="Бюджет от (€)" type="number" min={0}
              value={form.budget_min} onChange={e => setForm(p => ({ ...p, budget_min: e.target.value }))} />
            <input className="input-dark text-sm" placeholder="Бюджет до (€)" type="number" min={0}
              value={form.budget_max} onChange={e => setForm(p => ({ ...p, budget_max: e.target.value }))} />
          </div>

          {/* Description of what client is looking for */}
          <textarea className="input-dark text-sm w-full min-h-[70px] resize-y mb-3"
            placeholder="Какво търси клиентът — квартал, етаж, характеристики, бележки от разговора..."
            value={form.search_description}
            onChange={e => setForm(p => ({ ...p, search_description: e.target.value }))} />

          {/* Inline matching */}
          <MatchBanner matches={matches} />

          <div className="flex gap-2 mt-3">
            <button type="submit" disabled={saving} className="btn-crimson text-sm px-5 py-2">
              {saving ? 'Добавяне...' : 'Добави клиент'}
            </button>
            <button type="button" onClick={() => { setShowAdd(false); setFormError(''); setMatches([]) }}
              className="btn-ghost text-sm px-4 py-2">Отказ</button>
          </div>
        </form>
      )}

      {/* Table / Kanban */}
      {view === 'table' ? (
        <div className={`${adminCardClass} rounded-xl overflow-hidden`} style={cardStyle}>
          <table className="w-full">
            <thead>
              <tr style={tableHeaderStyle}>
                {['Клиент', 'Телефон', 'Имейл', 'Град / Тип', 'Бюджет', 'Статус', 'Дата', 'Действия'].map(h => (
                  <th key={h} className="text-left px-4 py-3 text-[10px] admin-table-head uppercase tracking-wider font-medium">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {clients.length === 0 ? (
                <tr><td colSpan={8} className="px-4 py-12 text-center admin-text-faint">Няма клиенти</td></tr>
              ) : clients.map(c => (
                <tr key={c.id} className="hover:bg-[rgba(207,168,71,0.03)] transition-colors">
                  <td className="px-4 py-3" style={tableCellStyle}>
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold text-white flex-shrink-0"
                        style={{ background: 'rgba(78,11,31,0.8)', border: '1px solid rgba(207,168,71,0.3)' }}>
                        {c.name[0]}
                      </div>
                      <p className="text-sm admin-text font-medium">{c.name}</p>
                    </div>
                  </td>
                  <td className="px-4 py-3 admin-table-cell text-sm" style={tableCellStyle}>{c.phone || '—'}</td>
                  <td className="px-4 py-3 admin-table-cell text-sm" style={tableCellStyle}>{c.email || '—'}</td>
                  <td className="px-4 py-3 text-xs" style={tableCellStyle}>
                    <div className="flex flex-col gap-0.5">
                      {c.city && <span className="admin-text">{c.city}</span>}
                      {c.property_type && <span className="admin-text-muted">{c.property_type}</span>}
                      {!c.city && !c.property_type && <span className="admin-text-faint">—</span>}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm font-medium" style={{ ...tableCellStyle, color: 'var(--gold,#CFA847)' }}>
                    {c.budget_min || c.budget_max
                      ? `€${(c.budget_min || 0).toLocaleString()} — €${(c.budget_max || 0).toLocaleString()}`
                      : '—'}
                  </td>
                  <td className="px-4 py-3" style={tableCellStyle}>
                    <select className="text-xs rounded px-2 py-1 font-medium cursor-pointer"
                      style={{ background: 'transparent', border: '1px solid rgba(207,168,71,0.22)', color: 'rgba(245,237,216,0.75)' }}
                      value={c.status} onChange={e => changeStatus(c.id, e.target.value)}>
                      {['lead', 'active', 'closed', 'lost'].map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </td>
                  <td className="px-4 py-3 admin-text-faint text-xs" style={tableCellStyle}>
                    {new Date(c.created_at).toLocaleDateString('bg-BG')}
                  </td>
                  <td className="px-4 py-3" style={tableCellStyle}>
                    <div className="flex flex-col gap-1">
                      <button type="button" onClick={() => openDetail(c)}
                        className="text-xs font-medium text-left" style={{ color: 'var(--gold,#CFA847)' }}>
                        Редакция / бележки
                      </button>
                      <button type="button" onClick={() => setMortgageClient(c)}
                        className="text-xs text-blue-400 hover:text-blue-300 font-medium text-left">
                        Ипотека →
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="grid grid-cols-4 gap-3">
          {[{ key: 'lead', label: 'Лийд' }, { key: 'active', label: 'Активен' }, { key: 'closed', label: 'Затворен' }, { key: 'lost', label: 'Загубен' }].map(stage => (
            <div key={stage.key} className="rounded-xl overflow-hidden" style={{ border: '1px solid rgba(207,168,71,0.15)' }}>
              <div className="px-3 py-2.5 flex items-center justify-between"
                style={{ background: 'rgba(78,11,31,0.25)', borderBottom: '1px solid rgba(207,168,71,0.12)' }}>
                <span className="text-xs font-semibold admin-text">{stage.label}</span>
                <span className="text-[10px] admin-text-muted">{clients.filter(c => c.status === stage.key).length}</span>
              </div>
              <div className="p-2 min-h-[100px] flex flex-col gap-2 admin-kanban-bg">
                {clients.filter(c => c.status === stage.key).map(c => (
                  <button key={c.id} type="button" onClick={() => openDetail(c)}
                    className="admin-kanban-card rounded-lg p-2.5 text-left w-full transition-colors">
                    <p className="text-xs admin-text font-medium">{c.name}</p>
                    {c.city && <p className="text-[10px] admin-text-faint">{c.city}{c.property_type ? ` · ${c.property_type}` : ''}</p>}
                    {c.budget_min ? <p className="text-[10px]" style={{ color: 'var(--gold,#CFA847)' }}>€{c.budget_min.toLocaleString()}</p> : null}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Detail modal */}
      {detailClient && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 admin-modal-backdrop"
          style={{ backdropFilter: 'blur(10px)' }} onClick={() => setDetailClient(null)}>
          <div className="w-full max-w-[600px] max-h-[92vh] overflow-y-auto rounded-2xl p-6 admin-modal-panel"
            onClick={e => e.stopPropagation()}>
            <h3 className="font-display admin-heading font-bold text-lg mb-1">{detailClient.name}</h3>
            <p className="text-xs admin-text-muted mb-5">Редакция и бележки</p>

            <div className="grid grid-cols-2 gap-3 mb-3">
              <input className="input-dark text-sm" placeholder="Име" value={editForm.name}
                onChange={e => setEditForm(p => ({ ...p, name: e.target.value }))} />
              <input className="input-dark text-sm" placeholder="Имейл (незадължителен)" value={editForm.email}
                onChange={e => setEditForm(p => ({ ...p, email: e.target.value }))} />
              <input className="input-dark text-sm" placeholder="Телефон" value={editForm.phone}
                onChange={e => setEditForm(p => ({ ...p, phone: e.target.value }))} />
              <select className="input-dark text-sm" value={editForm.status}
                onChange={e => setEditForm(p => ({ ...p, status: e.target.value }))}>
                {['lead', 'active', 'closed', 'lost'].map(s => <option key={s} value={s}>{s}</option>)}
              </select>
              <select className="input-dark text-sm" value={editForm.city}
                onChange={e => setEditForm(p => ({ ...p, city: e.target.value }))}>
                <option value="">— Град —</option>
                {CITIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
              <select className="input-dark text-sm" value={editForm.property_type}
                onChange={e => setEditForm(p => ({ ...p, property_type: e.target.value }))}>
                <option value="">— Тип имот —</option>
                {PROPERTY_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
              <input className="input-dark text-sm" placeholder="Бюджет от €" type="number" value={editForm.budget_min}
                onChange={e => setEditForm(p => ({ ...p, budget_min: e.target.value }))} />
              <input className="input-dark text-sm" placeholder="Бюджет до €" type="number" value={editForm.budget_max}
                onChange={e => setEditForm(p => ({ ...p, budget_max: e.target.value }))} />
            </div>

            {/* Search description */}
            <div className="mb-4">
              <p className="text-xs font-semibold mb-1.5 uppercase tracking-wider" style={{ color: 'var(--gold,#CFA847)' }}>
                Какво търси
              </p>
              <textarea className="input-dark text-sm w-full min-h-[60px] resize-y"
                placeholder="Квартал, характеристики, предпочитания, бележки от разговора..."
                value={editForm.search_description}
                onChange={e => setEditForm(p => ({ ...p, search_description: e.target.value }))} />
            </div>

            {/* Notes */}
            <div className="mb-4">
              <p className="text-xs font-semibold admin-text mb-2 uppercase tracking-wider">Бележки</p>
              <div className="flex gap-2 mb-3">
                <textarea className="input-dark text-sm flex-1 min-h-[60px] resize-y"
                  placeholder="Нова бележка — обаждане, среща, предпочитания..."
                  value={newNote} onChange={e => setNewNote(e.target.value)} />
                <button type="button" onClick={addNote} className="btn-crimson text-xs px-3 self-end">+ Добави</button>
              </div>
              {notesLoading ? (
                <p className="text-xs admin-text-faint">Зареждане...</p>
              ) : notes.length === 0 ? (
                <p className="text-xs admin-text-faint italic">Няма бележки</p>
              ) : (
                <div className="flex flex-col gap-2 max-h-[200px] overflow-y-auto">
                  {notes.map(n => (
                    <div key={n.id} className="rounded-lg px-3 py-2 text-sm"
                      style={{ background: 'rgba(207,168,71,0.04)', border: '1px solid rgba(207,168,71,0.12)' }}>
                      <div className="flex justify-between gap-2 mb-1">
                        <span className="text-[10px] admin-text-faint">
                          {n.author_name ?? 'Админ'} · {new Date(n.created_at).toLocaleString('bg-BG')}
                        </span>
                        <button type="button" onClick={() => deleteNote(n.id)}
                          className="text-[10px] text-red-400 hover:text-red-300">×</button>
                      </div>
                      <p className="admin-text text-xs leading-relaxed whitespace-pre-wrap">{n.note}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="flex flex-wrap gap-2 pt-3" style={{ borderTop: '1px solid rgba(207,168,71,0.15)' }}>
              <button onClick={saveClient} disabled={saving} className="btn-crimson text-sm px-5 py-2">
                {saving ? 'Запис...' : 'Запази'}
              </button>
              <button type="button" onClick={() => setMortgageClient(detailClient)}
                className="text-sm px-4 py-2 rounded-lg text-blue-300 hover:text-white"
                style={{ border: '1px solid rgba(96,165,250,0.4)', background: 'rgba(37,99,235,0.15)' }}>
                Пусни ипотечна кандидатура
              </button>
              <button onClick={() => setDetailClient(null)} className="btn-ghost text-sm px-4 py-2">Затвори</button>
              <button onClick={deleteClient} className="ml-auto text-sm px-4 py-2 text-red-400 hover:text-red-300"
                style={{ border: '1px solid rgba(248,113,113,0.3)', borderRadius: 8 }}>
                Изтрий клиента
              </button>
            </div>
          </div>
        </div>
      )}

      {mortgageClient && (
        <MortgageApplicationModal client={mortgageClient} onClose={() => setMortgageClient(null)} onSent={() => router.refresh()} />
      )}
    </div>
  )
}
