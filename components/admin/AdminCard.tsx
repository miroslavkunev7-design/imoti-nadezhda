// Shared marble card style for admin — white/ivory with gold borders
export const MARBLE_CARD = {
  backgroundImage: "url('/images/texture-marble-white-gold.png')",
  backgroundSize: 'cover' as const,
  backgroundPosition: 'center' as const,
  border: '1px solid rgba(207,168,71,0.38)',
  borderRadius: 16,
  boxShadow: '0 6px 28px rgba(0,0,0,0.22), 0 1px 0 rgba(255,255,255,0.9) inset',
} as const

export const cardStyle = MARBLE_CARD

export const adminCardClass = 'admin-card'

export const tableHeaderStyle = {
  borderBottom: '1px solid rgba(207,168,71,0.18)',
} as const

export const tableCellStyle = {
  borderBottom: '1px solid rgba(207,168,71,0.10)',
} as const

// Bordeaux text color for use inside marble cards
export const BORDEAUX = '#4E0B1F'
export const GOLD = '#CFA847'
export const MUTED = 'rgba(78,11,31,0.5)'

export function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { label: string; bg: string; color: string }> = {
    available:   { label: 'Активен',      bg: 'rgba(34,197,94,0.12)',   color: '#16a34a' },
    active:      { label: 'Активен',      bg: 'rgba(34,197,94,0.12)',   color: '#16a34a' },
    reserved:    { label: 'Резервиран',   bg: 'rgba(234,179,8,0.12)',   color: '#ca8a04' },
    sold:        { label: 'Продаден',     bg: 'rgba(99,102,241,0.12)',  color: '#6366f1' },
    rented:      { label: 'Наем',         bg: 'rgba(14,165,233,0.12)',  color: '#0284c7' },
    new:         { label: 'Нов',          bg: 'rgba(78,11,31,0.12)',    color: '#4E0B1F' },
    passive:     { label: 'Пасивен',      bg: 'rgba(100,100,100,0.12)', color: '#6b7280' },
    lead:        { label: 'Лийд',         bg: 'rgba(207,168,71,0.15)',  color: '#CFA847' },
    pending:     { label: 'Изчакване',    bg: 'rgba(234,179,8,0.12)',   color: '#ca8a04' },
    completed:   { label: 'Завършен',     bg: 'rgba(34,197,94,0.12)',   color: '#16a34a' },
    cancelled:   { label: 'Отказан',      bg: 'rgba(100,100,100,0.12)', color: '#6b7280' },
    draft:       { label: 'Чернова',      bg: 'rgba(148,163,184,0.12)', color: '#64748b' },
    high:        { label: 'Висок',        bg: 'rgba(239,68,68,0.12)',   color: '#dc2626' },
    medium:      { label: 'Среден',       bg: 'rgba(234,179,8,0.12)',   color: '#ca8a04' },
    low:         { label: 'Нисък',        bg: 'rgba(34,197,94,0.12)',   color: '#16a34a' },
  }
  const s = map[status] ?? { label: status, bg: 'rgba(100,100,100,0.12)', color: '#6b7280' }
  return (
    <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full whitespace-nowrap"
      style={{ background: s.bg, color: s.color, border: `1px solid ${s.color}22` }}>
      {s.label}
    </span>
  )
}

export function PageHeader({ title, action }: { title: string; action?: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between mb-5">
      <h1 className="font-display text-xl font-bold" style={{ color: '#FAF7F2', textShadow: '0 2px 12px rgba(0,0,0,0.4)' }}>
        {title}
      </h1>
      {action}
    </div>
  )
}

export function TabBar({ tabs, active, onChange }: { tabs: string[]; active: string; onChange: (t: string) => void }) {
  return (
    <div className="flex gap-1 mb-4 p-1 rounded-lg" style={{ background: 'rgba(250,247,242,0.15)', width: 'fit-content', border: '1px solid rgba(207,168,71,0.2)' }}>
      {tabs.map(t => (
        <button key={t} onClick={() => onChange(t)}
          className="px-3 py-1.5 rounded-md text-xs font-medium transition-all duration-150"
          style={active === t
            ? { background: '#4E0B1F', color: '#F5EDD8' }
            : { color: 'rgba(250,247,242,0.6)' }}>
          {t}
        </button>
      ))}
    </div>
  )
}
