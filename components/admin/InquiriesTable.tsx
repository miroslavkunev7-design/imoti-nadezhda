'use client'
import { useState } from 'react'
import { cardStyle, PageHeader, StatusBadge, TabBar, tableCellStyle, tableHeaderStyle } from '@/components/admin/AdminCard'

interface Inquiry { id: number; name: string; email: string; phone: string; message: string; status: string; created_at: string; property_title: string }

const TABS = ['Всички','Нови','В разглеждане','Разрешени','Прехвърлени']
const STATUS_MAP: Record<string, string> = {
  'Нови': 'new', 'В разглеждане': 'read', 'Разрешени': 'replied', 'Прехвърлени': 'closed'
}

export default function InquiriesTable({ inquiries }: { inquiries: Inquiry[] }) {
  const [tab, setTab] = useState('Всички')
  const [search, setSearch] = useState('')
  const [showFilters, setShowFilters] = useState(false)
  const unread = inquiries.filter(i => i.status === 'new').length

  let filtered = tab === 'Всички' ? inquiries : inquiries.filter(i => i.status === STATUS_MAP[tab])
  if (search.trim()) {
    const q = search.trim().toLowerCase()
    filtered = filtered.filter(
      i =>
        i.name.toLowerCase().includes(q) ||
        i.email.toLowerCase().includes(q) ||
        (i.property_title ?? '').toLowerCase().includes(q)
    )
  }

  return (
    <div>
      <PageHeader title={`Запитвания ${unread > 0 ? `(${unread} нови)` : ''}`}
        action={
          <button type="button" className="btn-ghost text-sm px-4 py-2" onClick={() => setShowFilters(v => !v)}>
            {showFilters ? 'Скрий филтри' : 'Филтри'}
          </button>
        }
      />
      {showFilters && (
        <div className="mb-4 p-4 rounded-xl flex flex-wrap gap-3 items-end" style={cardStyle}>
          <div className="flex-1 min-w-[200px]">
            <label className="text-[10px] text-white/40 uppercase tracking-wider block mb-1">Търсене</label>
            <input
              className="input-dark text-sm w-full"
              placeholder="Име, имейл, имот…"
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
          <p className="text-xs text-white/45">Показани: {filtered.length} от {inquiries.length}</p>
        </div>
      )}
      <TabBar tabs={TABS} active={tab} onChange={setTab} />

      <div className="rounded-xl overflow-hidden" style={cardStyle}>
        {filtered.length === 0 ? (
          <p className="text-center py-12 text-[rgba(255,255,255,0.4)]">Няма запитвания</p>
        ) : (
          <table className="w-full">
            <thead>
              <tr style={tableHeaderStyle}>
                {['Клиент','Имот','Съобщение','Статус','Дата','Действия'].map(h => (
                  <th key={h} className="text-left px-4 py-3 text-[10px] text-[rgba(255,255,255,0.4)] uppercase tracking-wider font-medium">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map(inq => (
                <tr key={inq.id} className="hover:bg-[rgba(196,30,58,0.05)] transition-colors">
                  <td className="px-4 py-3" style={tableCellStyle}>
                    <p className="text-sm text-white font-medium">{inq.name}</p>
                    <a href={`mailto:${inq.email}`} className="text-[10px] text-crimson-700 hover:text-crimson-400">{inq.email}</a>
                  </td>
                  <td className="px-4 py-3 text-[rgba(255,255,255,0.55)] text-sm" style={tableCellStyle}>
                    {inq.property_title ?? '—'}
                  </td>
                  <td className="px-4 py-3 max-w-[200px]" style={tableCellStyle}>
                    <p className="text-sm text-[rgba(255,255,255,0.6)] truncate">{inq.message}</p>
                  </td>
                  <td className="px-4 py-3" style={tableCellStyle}><StatusBadge status={inq.status} /></td>
                  <td className="px-4 py-3 text-[rgba(255,255,255,0.4)] text-xs" style={tableCellStyle}>
                    {new Date(inq.created_at).toLocaleDateString('bg-BG')}
                  </td>
                  <td className="px-4 py-3" style={tableCellStyle}>
                    <a href={`mailto:${inq.email}?subject=Отговор`}
                      className="text-xs text-crimson-700 hover:text-crimson-400 transition-colors">
                      Отговори →
                    </a>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
