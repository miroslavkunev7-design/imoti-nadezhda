// Shared card style for admin pages
export const cardStyle = {
  background: 'rgba(4,2,14,0.82)',
  border: '1px solid rgba(196,30,58,0.28)',
  backdropFilter: 'blur(12px)',
  WebkitBackdropFilter: 'blur(12px)',
  borderRadius: 10,
} as const

export const tableHeaderStyle = {
  borderBottom: '1px solid rgba(196,30,58,0.20)',
} as const

export const tableCellStyle = {
  borderBottom: '1px solid rgba(196,30,58,0.08)',
} as const

export function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { label: string; bg: string; color: string }> = {
    available:   { label: 'Активен',      bg: 'rgba(34,197,94,0.15)',   color: '#4ade80' },
    active:      { label: 'Активен',      bg: 'rgba(34,197,94,0.15)',   color: '#4ade80' },
    reserved:    { label: 'Резервиран',   bg: 'rgba(234,179,8,0.15)',   color: '#facc15' },
    sold:        { label: 'Продаден',     bg: 'rgba(99,102,241,0.15)',  color: '#818cf8' },
    rented:      { label: 'Наем',         bg: 'rgba(14,165,233,0.15)',  color: '#38bdf8' },
    new:         { label: 'Нов',          bg: 'rgba(196,30,58,0.20)',   color: '#f87171' },
    passive:     { label: 'Пасивен',      bg: 'rgba(100,100,100,0.20)', color: '#9ca3af' },
    lead:        { label: 'Лийд',         bg: 'rgba(196,30,58,0.15)',   color: '#fca5a5' },
    pending:     { label: 'Изчакване',    bg: 'rgba(234,179,8,0.15)',   color: '#facc15' },
    completed:   { label: 'Завършен',     bg: 'rgba(34,197,94,0.15)',   color: '#4ade80' },
    cancelled:   { label: 'Отказан',      bg: 'rgba(100,100,100,0.15)', color: '#9ca3af' },
    high:        { label: 'Висок',        bg: 'rgba(239,68,68,0.15)',   color: '#f87171' },
    medium:      { label: 'Среден',       bg: 'rgba(234,179,8,0.15)',   color: '#facc15' },
    low:         { label: 'Нисък',        bg: 'rgba(34,197,94,0.15)',   color: '#4ade80' },
  }
  const s = map[status] ?? { label: status, bg: 'rgba(100,100,100,0.15)', color: '#9ca3af' }
  return (
    <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full whitespace-nowrap"
      style={{ background: s.bg, color: s.color }}>
      {s.label}
    </span>
  )
}

export function PageHeader({ title, action }: { title: string; action?: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between mb-5">
      <h1 className="font-display text-white text-xl font-bold">{title}</h1>
      {action}
    </div>
  )
}

export function TabBar({ tabs, active, onChange }: { tabs: string[]; active: string; onChange: (t: string) => void }) {
  return (
    <div className="flex gap-1 mb-4 p-1 rounded-lg" style={{ background: 'rgba(0,0,0,0.3)', width: 'fit-content' }}>
      {tabs.map(t => (
        <button key={t} onClick={() => onChange(t)}
          className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all duration-150 ${
            active === t ? 'bg-crimson-700 text-white' : 'text-[rgba(255,255,255,0.5)] hover:text-white'
          }`}>
          {t}
        </button>
      ))}
    </div>
  )
}
