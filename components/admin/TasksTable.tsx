'use client'
import { useState } from 'react'
import { cardStyle, PageHeader, StatusBadge, TabBar, tableCellStyle, tableHeaderStyle } from '@/components/admin/AdminCard'

interface Task { id: number; title: string; description: string; due_date: string; priority: string; status: string; assigned_name: string; client_name: string }

export default function TasksTable({ tasks: initial }: { tasks: Task[] }) {
  const [tasks, setTasks] = useState(initial)
  const [tab, setTab]     = useState('Всички')
  const [showAdd, setShowAdd] = useState(false)
  const [form, setForm] = useState({ title: '', due_date: '', priority: 'normal' })

  const tabs = ['Всички','Активни','Завършени','Просрочени']
  const today = new Date().toISOString().split('T')[0]

  const filtered = tab === 'Всички' ? tasks
    : tab === 'Активни'   ? tasks.filter(t => t.status === 'pending' || t.status === 'in_progress')
    : tab === 'Завършени' ? tasks.filter(t => t.status === 'done')
    : tasks.filter(t => t.due_date && t.due_date < today && t.status !== 'done')

  async function addTask() {
    if (!form.title) return
    const res  = await fetch('/api/admin/tasks', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) })
    const json = await res.json()
    if (json.success) {
      setTasks(prev => [{ ...form, id: json.id, description: '', status: 'pending', assigned_name: '', client_name: '' }, ...prev])
      setShowAdd(false)
      setForm({ title: '', due_date: '', priority: 'normal' })
    }
  }

  async function toggleDone(id: number, current: string) {
    const next = current === 'done' ? 'pending' : 'done'
    setTasks(prev => prev.map(t => t.id === id ? { ...t, status: next } : t))
    await fetch(`/api/admin/tasks/${id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status: next }) })
  }

  return (
    <div>
      <PageHeader title={`Задачи (${tasks.length})`}
        action={<button onClick={() => setShowAdd(v => !v)} className="btn-crimson text-sm px-4 py-2">+ Нова задача</button>}
      />

      {showAdd && (
        <div className="rounded-xl p-4 mb-4" style={cardStyle}>
          <div className="grid grid-cols-3 gap-3 mb-3">
            <input className="input-dark text-sm col-span-2" placeholder="Заглавие на задачата *" value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))} />
            <input type="date" className="input-dark text-sm" value={form.due_date} onChange={e => setForm(p => ({ ...p, due_date: e.target.value }))} />
          </div>
          <div className="flex gap-2">
            {['low','normal','high','urgent'].map(p => (
              <button key={p} onClick={() => setForm(f => ({ ...f, priority: p }))}
                className={`text-xs px-3 py-1.5 rounded-lg transition-colors ${form.priority === p ? 'bg-crimson-700 text-white' : 'text-[rgba(255,255,255,0.5)] hover:text-white'}`}
                style={{ border: '1px solid rgba(196,30,58,0.25)' }}>
                {p === 'urgent' ? 'Спешно' : p === 'high' ? 'Висок' : p === 'normal' ? 'Среден' : 'Нисък'}
              </button>
            ))}
            <button onClick={addTask} className="btn-crimson text-sm px-5 py-1.5 ml-auto">Добави</button>
          </div>
        </div>
      )}

      <TabBar tabs={tabs} active={tab} onChange={setTab} />

      <div className="rounded-xl overflow-hidden" style={cardStyle}>
        {filtered.length === 0 ? (
          <p className="text-center py-12 text-[rgba(255,255,255,0.4)]">Няма задачи</p>
        ) : (
          <table className="w-full">
            <thead>
              <tr style={tableHeaderStyle}>
                {['Задача','Отговорник','Клиент','Краен срок','Приоритет','Статус'].map(h => (
                  <th key={h} className="text-left px-4 py-3 text-[10px] text-[rgba(255,255,255,0.4)] uppercase tracking-wider font-medium">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map(t => (
                <tr key={t.id} className="hover:bg-[rgba(196,30,58,0.05)] transition-colors">
                  <td className="px-4 py-3" style={tableCellStyle}>
                    <div className="flex items-center gap-2">
                      <input type="checkbox" className="accent-crimson-700" checked={t.status === 'done'}
                        onChange={() => toggleDone(t.id, t.status)} />
                      <span className={`text-sm ${t.status === 'done' ? 'text-[rgba(255,255,255,0.3)] line-through' : 'text-white'}`}>{t.title}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-[rgba(255,255,255,0.55)] text-sm" style={tableCellStyle}>{t.assigned_name || '—'}</td>
                  <td className="px-4 py-3 text-[rgba(255,255,255,0.55)] text-sm" style={tableCellStyle}>{t.client_name || '—'}</td>
                  <td className="px-4 py-3 text-[rgba(255,255,255,0.5)] text-sm" style={tableCellStyle}>
                    {t.due_date ? new Date(t.due_date).toLocaleDateString('bg-BG') : '—'}
                  </td>
                  <td className="px-4 py-3" style={tableCellStyle}><StatusBadge status={t.priority} /></td>
                  <td className="px-4 py-3" style={tableCellStyle}><StatusBadge status={t.status} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
