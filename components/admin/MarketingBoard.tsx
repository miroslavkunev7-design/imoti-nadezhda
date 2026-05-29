'use client'

import { useEffect, useState } from 'react'
import { cardStyle, PageHeader, StatusBadge, tableCellStyle, tableHeaderStyle } from '@/components/admin/AdminCard'

type Campaign = {
  id: string
  name: string
  channel: string
  budget: number
  status: 'active' | 'completed' | 'cancelled' | 'draft'
  results: string
}

const STORAGE_KEY = 'imoti-marketing-campaigns'

const DEFAULT: Campaign[] = [
  {
    id: '1',
    name: 'Facebook Ads',
    channel: 'Facebook',
    budget: 600,
    status: 'active',
    results: '13,470 импр. / 331 кл.',
  },
  {
    id: '2',
    name: 'Google Ads',
    channel: 'Google',
    budget: 450,
    status: 'active',
    results: '8,220 импр. / 214 кл.',
  },
]

function load(): Campaign[] {
  if (typeof window === 'undefined') return DEFAULT
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return DEFAULT
    const parsed = JSON.parse(raw) as Campaign[]
    return parsed.length ? parsed : DEFAULT
  } catch {
    return DEFAULT
  }
}

function save(list: Campaign[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(list))
}

export default function MarketingBoard() {
  const [campaigns, setCampaigns] = useState<Campaign[]>(DEFAULT)
  const [modal, setModal] = useState(false)
  const [editId, setEditId] = useState<string | null>(null)
  const [form, setForm] = useState({
    name: '',
    channel: 'Google',
    budget: 0,
    status: 'draft' as Campaign['status'],
    results: '',
  })

  useEffect(() => {
    setCampaigns(load())
  }, [])

  function persist(next: Campaign[]) {
    setCampaigns(next)
    save(next)
  }

  function openNew() {
    setEditId(null)
    setForm({ name: '', channel: 'Google', budget: 0, status: 'draft', results: '' })
    setModal(true)
  }

  function openEdit(c: Campaign) {
    setEditId(c.id)
    setForm({
      name: c.name,
      channel: c.channel,
      budget: c.budget,
      status: c.status,
      results: c.results,
    })
    setModal(true)
  }

  function submit() {
    if (!form.name.trim()) return
    if (editId) {
      persist(
        campaigns.map(c =>
          c.id === editId
            ? { ...c, ...form, name: form.name.trim(), results: form.results.trim() || '—' }
            : c
        )
      )
    } else {
      persist([
        ...campaigns,
        {
          id: String(Date.now()),
          name: form.name.trim(),
          channel: form.channel,
          budget: Number(form.budget) || 0,
          status: form.status,
          results: form.results.trim() || 'Нова кампания',
        },
      ])
    }
    setModal(false)
  }

  function remove(id: string) {
    if (!confirm('Изтриване на кампанията?')) return
    persist(campaigns.filter(c => c.id !== id))
  }

  const active = campaigns.filter(c => c.status === 'active').length
  const budget = campaigns.reduce((s, c) => s + (c.budget || 0), 0)

  return (
    <div>
      <PageHeader
        title="Маркетинг"
        action={
          <button type="button" onClick={openNew} className="btn-crimson text-sm px-4 py-2">
            + Нова кампания
          </button>
        }
      />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-5">
        {[
          { label: 'Активни кампании', value: String(active) },
          { label: 'Общ бюджет', value: `€${budget.toLocaleString('bg-BG')}` },
          { label: 'Всички кампании', value: String(campaigns.length) },
          { label: 'Завършени', value: String(campaigns.filter(c => c.status === 'completed').length) },
        ].map(s => (
          <div key={s.label} className="p-4 rounded-xl" style={cardStyle}>
            <p className="text-[10px] text-[rgba(255,255,255,0.4)] uppercase tracking-widest mb-1">
              {s.label}
            </p>
            <p className="text-xl font-bold text-crimson-700 font-display">{s.value}</p>
          </div>
        ))}
      </div>

      <div className="rounded-xl overflow-hidden" style={cardStyle}>
        <table className="w-full">
          <thead>
            <tr style={tableHeaderStyle}>
              {['Кампания', 'Канал', 'Бюджет', 'Статус', 'Резултати', 'Действия'].map(h => (
                <th
                  key={h}
                  className="text-left px-4 py-3 text-[10px] text-[rgba(255,255,255,0.4)] uppercase tracking-wider font-medium"
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {campaigns.map(c => (
              <tr key={c.id} className="hover:bg-[rgba(196,30,58,0.05)] transition-colors">
                <td className="px-4 py-3 text-white text-sm font-medium" style={tableCellStyle}>
                  {c.name}
                </td>
                <td className="px-4 py-3 text-[rgba(255,255,255,0.6)] text-sm" style={tableCellStyle}>
                  {c.channel}
                </td>
                <td className="px-4 py-3 text-crimson-700 font-bold text-sm" style={tableCellStyle}>
                  {c.budget > 0 ? `€${c.budget}` : 'Безплатен'}
                </td>
                <td className="px-4 py-3" style={tableCellStyle}>
                  <StatusBadge status={c.status} />
                </td>
                <td className="px-4 py-3 text-[rgba(255,255,255,0.5)] text-xs" style={tableCellStyle}>
                  {c.results}
                </td>
                <td className="px-4 py-3 flex gap-2" style={tableCellStyle}>
                  <button
                    type="button"
                    onClick={() => openEdit(c)}
                    className="text-xs text-crimson-700 hover:text-crimson-400"
                  >
                    Редактирай
                  </button>
                  <button
                    type="button"
                    onClick={() => remove(c.id)}
                    className="text-xs text-red-400 hover:text-red-300"
                  >
                    Изтрий
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {modal && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/70">
          <div className="w-full max-w-md rounded-xl p-6" style={cardStyle}>
            <h3 className="text-white font-semibold mb-4">
              {editId ? 'Редакция на кампания' : 'Нова кампания'}
            </h3>
            <div className="flex flex-col gap-3">
              <input
                className="input-dark text-sm"
                placeholder="Име"
                value={form.name}
                onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
              />
              <input
                className="input-dark text-sm"
                placeholder="Канал"
                value={form.channel}
                onChange={e => setForm(f => ({ ...f, channel: e.target.value }))}
              />
              <input
                type="number"
                className="input-dark text-sm"
                placeholder="Бюджет €"
                value={form.budget}
                onChange={e => setForm(f => ({ ...f, budget: Number(e.target.value) }))}
              />
              <select
                className="input-dark text-sm"
                value={form.status}
                onChange={e => setForm(f => ({ ...f, status: e.target.value as Campaign['status'] }))}
              >
                <option value="draft">Чернова</option>
                <option value="active">Активна</option>
                <option value="completed">Завършена</option>
                <option value="cancelled">Отменена</option>
              </select>
              <input
                className="input-dark text-sm"
                placeholder="Резултати"
                value={form.results}
                onChange={e => setForm(f => ({ ...f, results: e.target.value }))}
              />
            </div>
            <div className="flex gap-2 mt-5 justify-end">
              <button type="button" className="btn-ghost text-sm" onClick={() => setModal(false)}>
                Отказ
              </button>
              <button type="button" className="btn-crimson text-sm" onClick={submit}>
                Запази
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
