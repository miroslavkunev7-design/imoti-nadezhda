'use client'

import { useState } from 'react'
import { ADMIN_PAGE_OPTIONS } from '@/lib/auth/pages'

interface Broker {
  id: number; name: string; email: string; phone: string
  role: string; is_active: number; created_at: string
  total_clients: number; active_clients: number; total_properties: number
  avatar_url?: string | null
  restricted_pages?: string[]
  tasks_done?: number
  deals?: number
}
interface Client { id: number; name: string; email: string; status: string }

interface Props { brokers: Broker[]; unassignedClients: Client[]; isAdmin?: boolean }

export default function BrokersManager({ brokers: initial, unassignedClients, isAdmin = true }: Props) {
  const [brokers, setBrokers] = useState(initial)
  const [showAdd, setShowAdd] = useState(false)
  const [form, setForm] = useState({ name: '', email: '', phone: '', password: '' })
  const [formError, setFormError] = useState('')
  const [saving, setSaving] = useState(false)
  const [assignModal, setAssignModal] = useState<{ brokerId: number; brokerName: string } | null>(null)
  const [editBroker, setEditBroker] = useState<Broker | null>(null)
  const [editForm, setEditForm] = useState({ name: '', email: '', phone: '', password: '' })
  const [permBroker, setPermBroker] = useState<Broker | null>(null)
  const [permPages, setPermPages] = useState<string[]>([])

  async function addBroker() {
    setFormError('')
    if (!form.name.trim() || !form.email.trim()) {
      setFormError('Попълни име и имейл')
      return
    }
    if (!form.password.trim() || form.password.length < 4) {
      setFormError('Задай парола (мин. 4 символа) — брокерът влиза с нея от иконката 👤')
      return
    }
    setSaving(true)
    try {
      const res = await fetch('/api/admin/brokers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      const json = await res.json()
      if (json.success) {
        setBrokers(prev => [...prev, {
          ...form,
          id: json.id,
          role: 'broker',
          is_active: 1,
          created_at: new Date().toISOString(),
          total_clients: 0,
          active_clients: 0,
          total_properties: 0,
          tasks_done: 0,
          deals: 0,
          restricted_pages: [],
        }])
        setShowAdd(false)
        setForm({ name: '', email: '', phone: '', password: '' })
      } else {
        setFormError(json.error ?? 'Грешка при добавяне')
      }
    } finally { setSaving(false) }
  }

  function openEdit(broker: Broker) {
    setEditBroker(broker)
    setEditForm({ name: broker.name, email: broker.email, phone: broker.phone ?? '', password: '' })
  }

  async function saveEdit() {
    if (!editBroker || !editForm.name || !editForm.email) return
    setSaving(true)
    try {
      const body: Record<string, string> = {
        name: editForm.name,
        email: editForm.email,
        phone: editForm.phone,
      }
      if (editForm.password) body.password = editForm.password

      const res = await fetch(`/api/admin/brokers/${editBroker.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      const json = await res.json()
      if (json.success) {
        setBrokers(prev => prev.map(b => b.id === editBroker.id
          ? { ...b, name: editForm.name, email: editForm.email, phone: editForm.phone }
          : b))
        setEditBroker(null)
      }
    } finally { setSaving(false) }
  }

  async function openPermissions(broker: Broker) {
    setPermBroker(broker)
    const res = await fetch(`/api/admin/brokers/${broker.id}/restrictions`)
    const json = await res.json()
    setPermPages(json.pages ?? broker.restricted_pages ?? [])
  }

  async function savePermissions() {
    if (!permBroker) return
    setSaving(true)
    try {
      await fetch(`/api/admin/brokers/${permBroker.id}/restrictions`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pages: permPages }),
      })
      setBrokers(prev => prev.map(b =>
        b.id === permBroker.id ? { ...b, restricted_pages: permPages } : b
      ))
      setPermBroker(null)
    } finally { setSaving(false) }
  }

  async function deleteBroker(id: number, name: string, role: string) {
    if (role === 'admin') {
      alert('Администраторът не може да бъде изтрит.')
      return
    }
    if (!confirm(`Изтриване на брокер „${name}"?`)) return
    const res = await fetch(`/api/admin/brokers/${id}`, { method: 'DELETE' })
    const json = await res.json()
    if (json.success) setBrokers(prev => prev.filter(b => b.id !== id))
    else alert(json.error ?? 'Грешка')
  }

  async function toggleActive(id: number, current: number) {
    await fetch(`/api/admin/brokers/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ is_active: current ? 0 : 1 }),
    })
    setBrokers(prev => prev.map(b => b.id === id ? { ...b, is_active: current ? 0 : 1 } : b))
  }

  async function assignClient(clientId: number, brokerId: number) {
    const res = await fetch(`/api/admin/clients/${clientId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ assigned_agent_id: brokerId }),
    })
    const json = await res.json()
    if (json.success) {
      setAssignModal(null)
      setBrokers(prev => prev.map(b => b.id === brokerId ? { ...b, total_clients: b.total_clients + 1 } : b))
    } else {
      alert(json.error ?? 'Грешка при назначаване')
    }
  }

  return (
    <div>
      {isAdmin && (
        <div className="flex justify-end mb-5">
          <button onClick={() => { setShowAdd(v => !v); setFormError('') }} className="btn-crimson text-sm px-5 py-2">
            + Добави брокер
          </button>
        </div>
      )}

      {showAdd && isAdmin && (
        <div className="property-card-surface p-5 mb-5">
          <h3 className="font-display text-white font-semibold mb-4">Нов брокер</h3>
          {formError && (
            <p className="text-sm text-red-400 mb-3 px-3 py-2 rounded-lg bg-red-900/20">{formError}</p>
          )}
          <div className="grid grid-cols-2 gap-3 mb-3">
            <input className="input-dark" placeholder="Пълно име *" value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} />
            <input className="input-dark" placeholder="Имейл *" value={form.email} onChange={e => setForm(p => ({ ...p, email: e.target.value }))} />
            <input className="input-dark" placeholder="Телефон" value={form.phone} onChange={e => setForm(p => ({ ...p, phone: e.target.value }))} />
            <input className="input-dark" placeholder="Парола * (за вход)" type="password" value={form.password} onChange={e => setForm(p => ({ ...p, password: e.target.value }))} />
          </div>
          <p className="text-xs text-[rgba(255,255,255,0.4)] mb-3">Брокерът влиза от начална → иконка 👤 → /admin/login</p>
          <div className="flex gap-2">
            <button onClick={addBroker} disabled={saving} className="btn-crimson text-sm px-5 py-2">
              {saving ? 'Добавяне...' : 'Добави брокер'}
            </button>
            <button onClick={() => setShowAdd(false)} className="btn-ghost text-sm px-4 py-2">Отказ</button>
          </div>
        </div>
      )}

      {brokers.length === 0 ? (
        <div className="property-card-surface p-12 text-center">
          <p className="text-[rgba(255,255,255,0.5)] mb-4">Няма добавени брокери</p>
          {isAdmin && (
            <button onClick={() => setShowAdd(true)} className="btn-crimson text-sm px-6 py-2.5">Добави брокер</button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {brokers.map(broker => (
            <div key={broker.id} className="property-card-surface p-5"
              style={{ opacity: broker.is_active ? 1 : 0.6 }}>
              <div className="flex items-start justify-between gap-3 mb-4">
                <div className="flex items-center gap-3">
                  {broker.avatar_url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={broker.avatar_url} alt="" className="w-10 h-10 rounded-full object-cover flex-shrink-0"
                      style={{ border: '2px solid rgba(207,168,71,0.4)' }} />
                  ) : (
                    <div className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0"
                      style={{ background: '#4E0B1F', color: '#F5EDD8', border: '2px solid rgba(207,168,71,0.4)' }}>
                      {broker.name.charAt(0).toUpperCase()}
                    </div>
                  )}
                  <div>
                    <p className="font-bold text-sm" style={{ color: '#4E0B1F' }}>{broker.name}</p>
                    <p className="text-xs" style={{ color: 'rgba(78,11,31,0.5)' }}>{broker.role === 'admin' ? 'Администратор' : 'Брокер'}</p>
                  </div>
                </div>
                <span className="text-[10px] px-2 py-0.5 rounded-full font-semibold"
                  style={broker.is_active
                    ? { background: 'rgba(34,197,94,0.12)', color: '#16a34a', border: '1px solid rgba(34,197,94,0.3)' }
                    : { color: 'rgba(78,11,31,0.4)', border: '1px solid rgba(78,11,31,0.15)' }}>
                  {broker.is_active ? 'Активен' : 'Неактивен'}
                </span>
              </div>

              <div className="flex flex-col gap-1 mb-4">
                <a href={`mailto:${broker.email}`} className="text-xs transition-colors" style={{ color: 'rgba(78,11,31,0.6)' }}>{broker.email}</a>
                {broker.phone && <a href={`tel:${broker.phone}`} className="text-xs" style={{ color: 'rgba(78,11,31,0.6)' }}>{broker.phone}</a>}
              </div>

              <div className="grid grid-cols-3 gap-2 mb-2 pt-3" style={{ borderTop: '1px solid rgba(207,168,71,0.18)' }}>
                {[
                  { label: 'Клиенти', value: broker.total_clients },
                  { label: 'Активни', value: broker.active_clients },
                  { label: 'Имоти',   value: broker.total_properties },
                ].map(s => (
                  <div key={s.label} className="text-center">
                    <p className="text-lg font-bold font-display" style={{ color: '#CFA847' }}>{s.value}</p>
                    <p className="text-[10px]" style={{ color: 'rgba(78,11,31,0.5)' }}>{s.label}</p>
                  </div>
                ))}
              </div>
              <div className="grid grid-cols-2 gap-2 mb-4">
                {[
                  { label: 'Задачи ✓', value: broker.tasks_done ?? 0 },
                  { label: 'Сделки', value: broker.deals ?? 0 },
                ].map(s => (
                  <div key={s.label} className="text-center py-1 rounded-lg" style={{ background: 'rgba(78,11,31,0.05)', border: '1px solid rgba(207,168,71,0.15)' }}>
                    <p className="text-base font-bold font-display" style={{ color: '#4E0B1F' }}>{s.value}</p>
                    <p className="text-[10px]" style={{ color: 'rgba(78,11,31,0.5)' }}>{s.label}</p>
                  </div>
                ))}
              </div>

              {isAdmin && broker.role !== 'admin' && (
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => setAssignModal({ brokerId: broker.id, brokerName: broker.name })}
                    className="flex-1 btn-ghost text-xs py-1.5 justify-center min-w-[80px]"
                    disabled={unassignedClients.length === 0}
                  >
                    + Клиент
                  </button>
                  <button onClick={() => openEdit(broker)} className="btn-ghost text-xs py-1.5 px-3">Редакция</button>
                  <button onClick={() => openPermissions(broker)} className="btn-ghost text-xs py-1.5 px-3">Права</button>
                  <button onClick={() => toggleActive(broker.id, broker.is_active)} className="btn-ghost text-xs py-1.5 px-3">
                    {broker.is_active ? 'Off' : 'On'}
                  </button>
                  <button onClick={() => deleteBroker(broker.id, broker.name, broker.role)}
                    className="text-xs py-1.5 px-3 text-red-400 hover:text-red-300">Изтрий</button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {editBroker && (
        <Modal title={`Редакция: ${editBroker.name}`} onClose={() => setEditBroker(null)}>
          <div className="grid grid-cols-1 gap-3 mb-4">
            <input className="input-dark text-sm" placeholder="Име *" value={editForm.name}
              onChange={e => setEditForm(p => ({ ...p, name: e.target.value }))} />
            <input className="input-dark text-sm" placeholder="Имейл *" value={editForm.email}
              onChange={e => setEditForm(p => ({ ...p, email: e.target.value }))} />
            <input className="input-dark text-sm" placeholder="Телефон" value={editForm.phone}
              onChange={e => setEditForm(p => ({ ...p, phone: e.target.value }))} />
            <input className="input-dark text-sm" placeholder="Нова парола (по избор)" type="password"
              value={editForm.password} onChange={e => setEditForm(p => ({ ...p, password: e.target.value }))} />
          </div>
          <div className="flex gap-2">
            <button onClick={saveEdit} disabled={saving} className="btn-crimson text-sm px-5 py-2 flex-1">
              {saving ? 'Запис...' : 'Запази'}
            </button>
            <button onClick={() => setEditBroker(null)} className="btn-ghost text-sm px-4 py-2">Отказ</button>
          </div>
        </Modal>
      )}

      {permBroker && (
        <Modal title={`Права: ${permBroker.name}`} onClose={() => setPermBroker(null)}>
          <p className="text-xs mb-3" style={{ color: 'rgba(78,11,31,0.55)' }}>Отметни страниците, които брокерът НЕ може да вижда:</p>
          <div className="flex flex-col gap-2 max-h-[320px] overflow-y-auto mb-4">
            {ADMIN_PAGE_OPTIONS.filter(p => p.slug !== 'dashboard').map(page => (
              <label key={page.slug} className="flex items-center gap-2 px-3 py-2 rounded-lg cursor-pointer"
                style={{ border: '1px solid rgba(207,168,71,0.2)', background: 'rgba(78,11,31,0.03)' }}>
                <input type="checkbox" checked={permPages.includes(page.slug)}
                  onChange={e => {
                    setPermPages(prev => e.target.checked
                      ? [...prev, page.slug]
                      : prev.filter(s => s !== page.slug))
                  }} />
                <span className="text-sm" style={{ color: '#4E0B1F' }}>{page.label}</span>
              </label>
            ))}
          </div>
          <button onClick={savePermissions} disabled={saving} className="btn-crimson text-sm px-5 py-2 w-full">
            {saving ? 'Запис...' : 'Запази правата'}
          </button>
        </Modal>
      )}

      {assignModal && (
        <Modal title={`Клиент → ${assignModal.brokerName}`} onClose={() => setAssignModal(null)}>
          <div className="flex flex-col gap-2 max-h-[300px] overflow-y-auto">
            {unassignedClients.map(c => (
              <button key={c.id}
                onClick={() => assignClient(c.id, assignModal.brokerId)}
                className="flex items-center justify-between px-4 py-3 rounded-lg text-left transition-colors hover:bg-[rgba(196,30,58,0.08)]"
                style={{ border: '1px solid rgba(196,30,58,0.15)' }}>
                <div>
                  <p className="text-sm text-white font-medium">{c.name}</p>
                  <p className="text-xs text-[rgba(255,255,255,0.5)]">{c.email}</p>
                </div>
                <span className="text-xs text-crimson-700 font-semibold">Назначи →</span>
              </button>
            ))}
          </div>
        </Modal>
      )}
    </div>
  )
}

function Modal({ title, onClose, children }: { title: string; onClose: () => void; children: React.ReactNode }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(4,2,12,0.75)', backdropFilter: 'blur(6px)' }}
      onClick={onClose}>
      <div className="w-full max-w-[420px] rounded-2xl p-6"
        style={{ background: 'var(--bg-surface)', border: '1.5px solid rgba(196,30,58,0.4)' }}
        onClick={e => e.stopPropagation()}>
        <h3 className="font-display text-white font-bold text-lg mb-4">{title}</h3>
        {children}
      </div>
    </div>
  )
}
