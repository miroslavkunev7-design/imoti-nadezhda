'use client'
import { useState } from 'react'
import { cardStyle, PageHeader, tableCellStyle, tableHeaderStyle } from '@/components/admin/AdminCard'

interface Client {
  id: number; name: string; email: string; phone: string; source: string
  status: string; budget_min: number; budget_max: number; created_at: string
}

interface Note {
  id: number; note: string; created_at: string; author_name?: string
}

const SOURCE_LABELS: Record<string, string> = {
  website: 'Сайт', referral: 'Препоръка', direct: 'Директен', social: 'Социални'
}

export default function CrmBoard({ clients: initial }: { clients: Client[] }) {
  const [clients, setClients] = useState(initial)
  const [showAdd, setShowAdd] = useState(false)
  const [form, setForm] = useState({ name: '', email: '', phone: '', source: 'website', budget_min: '', budget_max: '' })
  const [saving, setSaving] = useState(false)
  const [view, setView] = useState<'table'|'kanban'>('table')
  const [detailClient, setDetailClient] = useState<Client | null>(null)
  const [editForm, setEditForm] = useState({ name: '', email: '', phone: '', budget_min: '', budget_max: '', status: 'lead' })
  const [notes, setNotes] = useState<Note[]>([])
  const [newNote, setNewNote] = useState('')
  const [notesLoading, setNotesLoading] = useState(false)

  async function addClient() {
    if (!form.name || !form.email) return
    setSaving(true)
    try {
      const res  = await fetch('/api/admin/clients', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) })
      const json = await res.json()
      if (json.success) {
        setClients(prev => [{ ...form, id: json.id, status: 'lead', budget_min: Number(form.budget_min), budget_max: Number(form.budget_max), created_at: new Date().toISOString() }, ...prev])
        setShowAdd(false)
        setForm({ name: '', email: '', phone: '', source: 'website', budget_min: '', budget_max: '' })
      }
    } finally { setSaving(false) }
  }

  async function changeStatus(id: number, status: string) {
    setClients(prev => prev.map(c => c.id === id ? { ...c, status } : c))
    await fetch(`/api/admin/clients/${id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status }) })
  }

  async function openDetail(client: Client) {
    setDetailClient(client)
    setEditForm({
      name: client.name,
      email: client.email,
      phone: client.phone ?? '',
      budget_min: client.budget_min ? String(client.budget_min) : '',
      budget_max: client.budget_max ? String(client.budget_max) : '',
      status: client.status,
    })
    setNewNote('')
    setNotesLoading(true)
    try {
      const res = await fetch(`/api/admin/clients/${client.id}/notes`)
      const json = await res.json()
      setNotes(json.notes ?? [])
    } catch {
      setNotes([])
    } finally {
      setNotesLoading(false)
    }
  }

  async function saveClient() {
    if (!detailClient) return
    setSaving(true)
    try {
      const res = await fetch(`/api/admin/clients/${detailClient.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: editForm.name,
          email: editForm.email,
          phone: editForm.phone,
          budget_min: editForm.budget_min,
          budget_max: editForm.budget_max,
          status: editForm.status,
        }),
      })
      const json = await res.json()
      if (json.success) {
        const updated = {
          ...detailClient,
          name: editForm.name,
          email: editForm.email,
          phone: editForm.phone,
          budget_min: Number(editForm.budget_min) || 0,
          budget_max: Number(editForm.budget_max) || 0,
          status: editForm.status,
        }
        setClients(prev => prev.map(c => c.id === detailClient.id ? updated : c))
        setDetailClient(updated)
      }
    } finally { setSaving(false) }
  }

  async function deleteClient() {
    if (!detailClient) return
    if (!confirm(`Изтриване на клиент „${detailClient.name}"?`)) return
    const res = await fetch(`/api/admin/clients/${detailClient.id}`, { method: 'DELETE' })
    const json = await res.json()
    if (json.success) {
      setClients(prev => prev.filter(c => c.id !== detailClient.id))
      setDetailClient(null)
    } else {
      alert(json.error ?? 'Грешка')
    }
  }

  async function addNote() {
    if (!detailClient || !newNote.trim()) return
    const res = await fetch(`/api/admin/clients/${detailClient.id}/notes`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ note: newNote }),
    })
    const json = await res.json()
    if (json.success) {
      setNotes(prev => [{
        id: json.id,
        note: newNote.trim(),
        created_at: new Date().toISOString(),
        author_name: 'Админ',
      }, ...prev])
      setNewNote('')
    } else {
      alert(json.error ?? 'Грешка при бележка')
    }
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
            <div className="flex rounded-lg overflow-hidden" style={{ border: '1px solid rgba(196,30,58,0.25)' }}>
              {(['table','kanban'] as const).map(v => (
                <button key={v} onClick={() => setView(v)}
                  className={`px-3 py-1.5 text-xs font-medium transition-colors ${view === v ? 'bg-crimson-700 text-white' : 'text-[rgba(255,255,255,0.5)] hover:text-white'}`}>
                  {v === 'table' ? '☰ Таблица' : '⊞ Kanban'}
                </button>
              ))}
            </div>
            <button onClick={() => setShowAdd(v => !v)} className="btn-crimson text-sm px-4 py-1.5">+ Добави клиент</button>
          </div>
        }
      />

      {showAdd && (
        <div className="rounded-xl p-5 mb-4" style={cardStyle}>
          <div className="grid grid-cols-3 gap-3 mb-3">
            <input className="input-dark text-sm" placeholder="Пълно име *" value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} />
            <input className="input-dark text-sm" placeholder="Имейл *" value={form.email} onChange={e => setForm(p => ({ ...p, email: e.target.value }))} />
            <input className="input-dark text-sm" placeholder="Телефон" value={form.phone} onChange={e => setForm(p => ({ ...p, phone: e.target.value }))} />
            <select className="input-dark text-sm" value={form.source} onChange={e => setForm(p => ({ ...p, source: e.target.value }))}>
              {Object.entries(SOURCE_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
            </select>
            <input className="input-dark text-sm" placeholder="Бюджет от (€)" type="number" value={form.budget_min} onChange={e => setForm(p => ({ ...p, budget_min: e.target.value }))} />
            <input className="input-dark text-sm" placeholder="Бюджет до (€)" type="number" value={form.budget_max} onChange={e => setForm(p => ({ ...p, budget_max: e.target.value }))} />
          </div>
          <div className="flex gap-2">
            <button onClick={addClient} disabled={saving} className="btn-crimson text-sm px-5 py-2">{saving ? 'Добавяне...' : 'Добави'}</button>
            <button onClick={() => setShowAdd(false)} className="btn-ghost text-sm px-4 py-2">Отказ</button>
          </div>
        </div>
      )}

      {view === 'table' ? (
        <div className="rounded-xl overflow-hidden" style={cardStyle}>
          <table className="w-full">
            <thead>
              <tr style={tableHeaderStyle}>
                {['Клиент','Телефон','Имейл','Бюджет','Статус','Дата','Действия'].map(h => (
                  <th key={h} className="text-left px-4 py-3 text-[10px] text-[rgba(255,255,255,0.4)] uppercase tracking-wider font-medium">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {clients.length === 0 ? (
                <tr><td colSpan={7} className="px-4 py-12 text-center text-[rgba(255,255,255,0.4)]">Няма клиенти</td></tr>
              ) : clients.map(c => (
                <tr key={c.id} className="hover:bg-[rgba(196,30,58,0.05)] transition-colors">
                  <td className="px-4 py-3" style={tableCellStyle}>
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold text-white flex-shrink-0" style={{ background: '#c41e3a' }}>
                        {c.name[0]}
                      </div>
                      <p className="text-sm text-white font-medium">{c.name}</p>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-[rgba(255,255,255,0.6)] text-sm" style={tableCellStyle}>{c.phone ?? '—'}</td>
                  <td className="px-4 py-3 text-[rgba(255,255,255,0.6)] text-sm" style={tableCellStyle}>{c.email}</td>
                  <td className="px-4 py-3 text-crimson-700 text-sm font-medium" style={tableCellStyle}>
                    {c.budget_min || c.budget_max ? `€${(c.budget_min||0).toLocaleString()} — €${(c.budget_max||0).toLocaleString()}` : '—'}
                  </td>
                  <td className="px-4 py-3" style={tableCellStyle}>
                    <select
                      className="text-xs rounded px-2 py-1 font-medium cursor-pointer"
                      style={{ background: 'transparent', border: '1px solid rgba(196,30,58,0.25)', color: 'rgba(255,255,255,0.7)' }}
                      value={c.status}
                      onChange={e => changeStatus(c.id, e.target.value)}>
                      {['lead','active','closed','lost'].map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </td>
                  <td className="px-4 py-3 text-[rgba(255,255,255,0.4)] text-xs" style={tableCellStyle}>
                    {new Date(c.created_at).toLocaleDateString('bg-BG')}
                  </td>
                  <td className="px-4 py-3" style={tableCellStyle}>
                    <button
                      type="button"
                      onClick={() => openDetail(c)}
                      className="text-xs text-crimson-700 hover:text-crimson-400 font-medium"
                    >
                      Редакция / бележки
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="grid grid-cols-4 gap-3">
          {[{key:'lead',label:'Лийд'},{key:'active',label:'Активен'},{key:'closed',label:'Затворен'},{key:'lost',label:'Загубен'}].map(stage => (
            <div key={stage.key} className="rounded-xl overflow-hidden" style={{ border: '1px solid rgba(196,30,58,0.18)' }}>
              <div className="px-3 py-2.5 flex items-center justify-between"
                style={{ background: 'rgba(196,30,58,0.12)', borderBottom: '1px solid rgba(196,30,58,0.15)' }}>
                <span className="text-xs font-semibold text-white">{stage.label}</span>
                <span className="text-[10px] text-[rgba(255,255,255,0.5)]">{clients.filter(c => c.status === stage.key).length}</span>
              </div>
              <div className="p-2 min-h-[100px] flex flex-col gap-2" style={{ background: 'rgba(4,2,14,0.7)' }}>
                {clients.filter(c => c.status === stage.key).map(c => (
                  <button key={c.id} type="button" onClick={() => openDetail(c)}
                    className="rounded-lg p-2.5 text-left w-full hover:bg-[rgba(196,30,58,0.08)] transition-colors"
                    style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(196,30,58,0.12)' }}>
                    <p className="text-xs text-white font-medium">{c.name}</p>
                    <p className="text-[10px] text-[rgba(255,255,255,0.4)]">{c.email}</p>
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {detailClient && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: 'rgba(4,2,12,0.78)', backdropFilter: 'blur(8px)' }}
          onClick={() => setDetailClient(null)}>
          <div className="w-full max-w-[560px] max-h-[90vh] overflow-y-auto rounded-2xl p-6"
            style={{ background: 'rgba(8,6,18,0.98)', border: '1.5px solid rgba(196,30,58,0.4)' }}
            onClick={e => e.stopPropagation()}>
            <h3 className="font-display text-white font-bold text-lg mb-1">{detailClient.name}</h3>
            <p className="text-xs text-[rgba(255,255,255,0.45)] mb-5">Редакция и бележки за клиента</p>

            <div className="grid grid-cols-2 gap-3 mb-4">
              <input className="input-dark text-sm" placeholder="Име" value={editForm.name}
                onChange={e => setEditForm(p => ({ ...p, name: e.target.value }))} />
              <input className="input-dark text-sm" placeholder="Имейл" value={editForm.email}
                onChange={e => setEditForm(p => ({ ...p, email: e.target.value }))} />
              <input className="input-dark text-sm" placeholder="Телефон" value={editForm.phone}
                onChange={e => setEditForm(p => ({ ...p, phone: e.target.value }))} />
              <select className="input-dark text-sm" value={editForm.status}
                onChange={e => setEditForm(p => ({ ...p, status: e.target.value }))}>
                {['lead','active','closed','lost'].map(s => <option key={s} value={s}>{s}</option>)}
              </select>
              <input className="input-dark text-sm" placeholder="Бюджет от €" type="number" value={editForm.budget_min}
                onChange={e => setEditForm(p => ({ ...p, budget_min: e.target.value }))} />
              <input className="input-dark text-sm" placeholder="Бюджет до €" type="number" value={editForm.budget_max}
                onChange={e => setEditForm(p => ({ ...p, budget_max: e.target.value }))} />
            </div>

            <div className="mb-4">
              <p className="text-xs font-semibold text-white mb-2 uppercase tracking-wider">Бележки</p>
              <div className="flex gap-2 mb-3">
                <textarea
                  className="input-dark text-sm flex-1 min-h-[60px] resize-y"
                  placeholder="Нова бележка — обаждане, среща, предпочитания..."
                  value={newNote}
                  onChange={e => setNewNote(e.target.value)}
                />
                <button type="button" onClick={addNote} className="btn-crimson text-xs px-3 self-end">
                  + Добави
                </button>
              </div>
              {notesLoading ? (
                <p className="text-xs text-[rgba(255,255,255,0.4)]">Зареждане...</p>
              ) : notes.length === 0 ? (
                <p className="text-xs text-[rgba(255,255,255,0.35)] italic">Няма бележки</p>
              ) : (
                <div className="flex flex-col gap-2 max-h-[200px] overflow-y-auto">
                  {notes.map(n => (
                    <div key={n.id} className="rounded-lg px-3 py-2 text-sm"
                      style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(196,30,58,0.12)' }}>
                      <div className="flex justify-between gap-2 mb-1">
                        <span className="text-[10px] text-[rgba(255,255,255,0.4)]">
                          {n.author_name ?? 'Админ'} · {new Date(n.created_at).toLocaleString('bg-BG')}
                        </span>
                        <button type="button" onClick={() => deleteNote(n.id)}
                          className="text-[10px] text-red-400 hover:text-red-300">×</button>
                      </div>
                      <p className="text-[rgba(255,255,255,0.85)] text-xs leading-relaxed whitespace-pre-wrap">{n.note}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="flex flex-wrap gap-2 pt-3" style={{ borderTop: '1px solid rgba(196,30,58,0.15)' }}>
              <button onClick={saveClient} disabled={saving} className="btn-crimson text-sm px-5 py-2">
                {saving ? 'Запис...' : 'Запази'}
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
    </div>
  )
}
