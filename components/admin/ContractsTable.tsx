'use client'
import { useState } from 'react'
import { cardStyle, PageHeader, StatusBadge, tableCellStyle, tableHeaderStyle } from '@/components/admin/AdminCard'

interface Contract { id: number; type: string; value: number; status: string; created_at: string; client_name: string; property_title: string }

export default function ContractsTable({ contracts: initial }: { contracts: Contract[] }) {
  const [contracts, setContracts] = useState(initial)
  const [showNew, setShowNew] = useState(false)
  const [form, setForm] = useState({ client_name: '', property_title: '', type: 'Покупко-продажба', value: '' })

  return (
    <div>
      <PageHeader title={`Договори (${contracts.length})`}
        action={<button onClick={() => setShowNew(v => !v)} className="btn-crimson text-sm px-4 py-2">+ Нов договор</button>}
      />

      {showNew && (
        <div className="rounded-xl p-4 mb-4" style={cardStyle}>
          <div className="grid grid-cols-2 gap-3 mb-3">
            <input className="input-dark text-sm" placeholder="Клиент" value={form.client_name} onChange={e => setForm(p=>({...p,client_name:e.target.value}))} />
            <input className="input-dark text-sm" placeholder="Имот" value={form.property_title} onChange={e => setForm(p=>({...p,property_title:e.target.value}))} />
            <select className="input-dark text-sm" value={form.type} onChange={e => setForm(p=>({...p,type:e.target.value}))}>
              {['Покупко-продажба','Наем','Резервация','Предварителен'].map(t => <option key={t} value={t}>{t}</option>)}
            </select>
            <input className="input-dark text-sm" placeholder="Стойност (€)" type="number" value={form.value} onChange={e => setForm(p=>({...p,value:e.target.value}))} />
          </div>
          <div className="flex gap-2">
            <button className="btn-crimson text-sm px-5 py-2" onClick={async () => {
              const res  = await fetch('/api/admin/contracts', { method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify(form) })
              const json = await res.json()
              if (json.success) {
                setContracts(prev => [{ ...form, id: json.id, value: Number(form.value), status: 'active', created_at: new Date().toISOString() }, ...prev])
                setShowNew(false)
              }
            }}>Добави</button>
            <button className="btn-ghost text-sm px-4 py-2" onClick={() => setShowNew(false)}>Отказ</button>
          </div>
        </div>
      )}

      <div className="rounded-xl overflow-hidden" style={cardStyle}>
        {contracts.length === 0 ? (
          <p className="text-center py-12 text-[rgba(255,255,255,0.4)]">Няма договори</p>
        ) : (
          <table className="w-full">
            <thead>
              <tr style={tableHeaderStyle}>
                {['#','Клиент','Имот','Тип договор','Стойност','Статус','Дата'].map(h => (
                  <th key={h} className="text-left px-4 py-3 text-[10px] text-[rgba(255,255,255,0.4)] uppercase tracking-wider font-medium">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {contracts.map(c => (
                <tr key={c.id} className="hover:bg-[rgba(196,30,58,0.05)] transition-colors">
                  <td className="px-4 py-3 text-crimson-700 font-mono text-xs" style={tableCellStyle}>ДГ-{c.id.toString().padStart(4,'0')}</td>
                  <td className="px-4 py-3 text-white text-sm font-medium" style={tableCellStyle}>{c.client_name || '—'}</td>
                  <td className="px-4 py-3 text-[rgba(255,255,255,0.6)] text-sm" style={tableCellStyle}>{c.property_title || '—'}</td>
                  <td className="px-4 py-3 text-[rgba(255,255,255,0.6)] text-sm" style={tableCellStyle}>{c.type}</td>
                  <td className="px-4 py-3 text-crimson-700 font-bold text-sm" style={tableCellStyle}>€{Number(c.value).toLocaleString()}</td>
                  <td className="px-4 py-3" style={tableCellStyle}><StatusBadge status={c.status} /></td>
                  <td className="px-4 py-3 text-[rgba(255,255,255,0.4)] text-xs" style={tableCellStyle}>{new Date(c.created_at).toLocaleDateString('bg-BG')}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
