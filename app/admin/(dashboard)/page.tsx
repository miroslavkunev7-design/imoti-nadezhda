import type { Metadata } from 'next'
import { formatPrice } from '@/lib/utils'

export const metadata: Metadata = { title: 'Табло' }
export const dynamic = 'force-dynamic'

// Auto-setup new DB tables and columns directly via bridge (safe — uses IF NOT EXISTS)
async function runSetup() {
  const url = process.env.DB_BRIDGE_URL?.trim()
  const key = process.env.DB_BRIDGE_KEY?.trim()
  if (!url || !key) return
  const post = (body: object) => fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ key, ...body }),
    cache: 'no-store',
  }).catch(() => {})
  await Promise.allSettled([
    post({ action: 'create_table', table: 'crm_messages' }),
    post({ action: 'create_table', table: 'broker_restrictions' }),
    post({ action: 'add_avatar_column' }),
  ])
}

async function getStats() {
  try {
    const { query } = await import('@/lib/db')
    const [p, inq, cli] = await Promise.all([
      query<{ total: number }>(`SELECT COUNT(*) as total FROM properties WHERE status = 'available'`),
      query<{ total: number }>(`SELECT COUNT(*) as total FROM inquiries WHERE status = 'new'`),
      query<{ total: number }>(`SELECT COUNT(*) as total FROM crm_clients`),
    ])
    return {
      properties: Number(p[0]?.total  ?? 0),
      unread:     Number(inq[0]?.total ?? 0),
      clients:    Number(cli[0]?.total ?? 0),
    }
  } catch {
    return { properties: 0, unread: 0, clients: 0 }
  }
}

async function getRecentProperties() {
  try {
    const { query } = await import('@/lib/db')
    return query<{ id: number; title: string; price_eur: number; city_name: string; quarter_name: string }>(`
      SELECT p.id, p.title, p.price AS price_eur, p.city AS city_name, p.quarter AS quarter_name
      FROM properties p
      ORDER BY p.created_at DESC LIMIT 5`)
  } catch { return [] }
}

async function getRecentInquiries() {
  try {
    const { query } = await import('@/lib/db')
    return query<{ id: number; name: string; message: string; status: string; created_at: string }>(`
      SELECT id, name, message, status, created_at
      FROM inquiries ORDER BY created_at DESC LIMIT 5`)
  } catch { return [] }
}

export default async function AdminDashboard() {
  void runSetup()
  const [stats, recentProps, inquiries] = await Promise.all([
    getStats(), getRecentProperties(), getRecentInquiries(),
  ])

  const statCards = [
    { label: 'Активни имоти',   value: stats.properties, href: '/admin/properties' },
    { label: 'Нови запитвания', value: stats.unread,     href: '/admin/inquiries'  },
    { label: 'CRM клиенти',     value: stats.clients,    href: '/admin/clients'    },
  ]

  const cardStyle = {
    background: 'rgba(8,6,18,0.80)',
    border: '1.5px solid rgba(196,30,58,0.30)',
    backdropFilter: 'blur(12px)',
    WebkitBackdropFilter: 'blur(12px)',
    borderRadius: 14,
  }

  return (
    <div style={{ maxWidth: 1000 }}>
      <div style={{ marginBottom: 28 }}>
        <h1 className="font-display text-white text-2xl font-bold">Табло</h1>
        <p className="text-[rgba(255,255,255,0.45)] text-sm mt-1">Преглед на всички активности</p>
      </div>

      <div className="grid grid-cols-3 gap-4" style={{ marginBottom: 24 }}>
        {statCards.map(s => (
          <a key={s.label} href={s.href}
            className="block p-5 rounded-xl hover:scale-[1.02] transition-all duration-200"
            style={cardStyle}>
            <p className="text-[10px] text-[rgba(255,255,255,0.45)] uppercase tracking-widest mb-2">{s.label}</p>
            <p className="text-3xl font-bold text-crimson-700 font-display">{s.value}</p>
          </a>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-5">
        <div className="p-5 rounded-xl" style={cardStyle}>
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-display text-white font-semibold">Последни имоти</h2>
            <a href="/admin/properties/new" className="btn-crimson text-xs px-3 py-1.5">+ Добави</a>
          </div>
          {recentProps.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-[rgba(255,255,255,0.4)] text-sm mb-4">Няма добавени имоти</p>
              <a href="/admin/properties/new" className="btn-crimson text-sm px-5 py-2">Добави първия имот</a>
            </div>
          ) : recentProps.map(p => (
            <div key={p.id} className="flex justify-between py-2.5"
              style={{ borderBottom: '1px solid rgba(196,30,58,0.10)' }}>
              <div className="min-w-0">
                <p className="text-sm text-white font-medium truncate">{p.title}</p>
                <p className="text-xs text-[rgba(255,255,255,0.4)]">{p.quarter_name}, {p.city_name}</p>
              </div>
              <span className="text-crimson-700 font-bold text-sm ml-3 whitespace-nowrap">
                {formatPrice(p.price_eur)}
              </span>
            </div>
          ))}
        </div>

        <div className="p-5 rounded-xl" style={cardStyle}>
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-display text-white font-semibold">Последни запитвания</h2>
            <a href="/admin/inquiries"
              className="text-xs text-crimson-700 hover:text-crimson-400 transition-colors">
              Виж всички →
            </a>
          </div>
          {inquiries.length === 0 ? (
            <p className="text-[rgba(255,255,255,0.4)] text-sm text-center py-8">Няма запитвания</p>
          ) : inquiries.map(inq => (
            <div key={inq.id} className="py-2.5"
              style={{ borderBottom: '1px solid rgba(196,30,58,0.10)' }}>
              <div className="flex justify-between mb-1">
                <p className="text-sm text-white font-medium">{inq.name}</p>
                <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${
                  inq.status === 'new' ? 'bg-crimson-700 text-white' : 'text-[rgba(255,255,255,0.4)] border border-[rgba(255,255,255,0.1)]'
                }`}>{inq.status === 'new' ? 'Ново' : 'Прочетено'}</span>
              </div>
              <p className="text-xs text-[rgba(255,255,255,0.4)] truncate">{inq.message}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
