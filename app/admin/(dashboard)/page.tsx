import type { Metadata } from 'next'
import { formatPrice } from '@/lib/utils'

export const metadata: Metadata = { title: 'Табло' }
export const dynamic = 'force-dynamic'

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
  const [stats, recentProps, inquiries] = await Promise.all([
    getStats(), getRecentProperties(), getRecentInquiries(),
  ])

  const statCards = [
    { label: 'Активни имоти',   value: stats.properties, href: '/admin/properties' },
    { label: 'Нови запитвания', value: stats.unread,     href: '/admin/inquiries'  },
    { label: 'CRM клиенти',     value: stats.clients,    href: '/admin/clients'    },
  ]

  const MC = {
    backgroundImage: "url('/images/texture-marble-white-gold.png')",
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    border: '1px solid rgba(207,168,71,0.38)',
    borderRadius: 16,
    boxShadow: '0 6px 28px rgba(0,0,0,0.22), 0 1px 0 rgba(255,255,255,0.9) inset',
  }

  return (
    <div style={{ maxWidth: 1000 }}>
      <div style={{ marginBottom: 28 }}>
        <h1 className="font-display text-2xl font-bold" style={{ color: '#FAF7F2', textShadow: '0 2px 12px rgba(0,0,0,0.4)' }}>Табло</h1>
        <p className="text-sm mt-1" style={{ color: 'rgba(250,247,242,0.55)' }}>Преглед на всички активности</p>
      </div>

      <div className="grid grid-cols-3 gap-4" style={{ marginBottom: 24 }}>
        {statCards.map(s => (
          <a key={s.label} href={s.href}
            className="block p-5 rounded-2xl hover:scale-[1.02] transition-all duration-200"
            style={MC}>
            <p className="text-[10px] uppercase tracking-widest mb-2" style={{ color: 'rgba(78,11,31,0.55)' }}>{s.label}</p>
            <p className="text-3xl font-bold font-display" style={{ color: '#4E0B1F' }}>{s.value}</p>
          </a>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-5">
        <div className="p-5 rounded-2xl" style={MC}>
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-display font-bold text-base" style={{ color: '#4E0B1F' }}>Последни имоти</h2>
            <a href="/admin/properties/new" className="btn-crimson text-xs px-3 py-1.5">+ Добави</a>
          </div>
          {recentProps.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-sm mb-4" style={{ color: 'rgba(78,11,31,0.45)' }}>Няма добавени имоти</p>
              <a href="/admin/properties/new" className="btn-crimson text-sm px-5 py-2">Добави първия имот</a>
            </div>
          ) : recentProps.map(p => (
            <div key={p.id} className="flex justify-between py-2.5"
              style={{ borderBottom: '1px solid rgba(207,168,71,0.15)' }}>
              <div className="min-w-0">
                <p className="text-sm font-semibold truncate" style={{ color: '#4E0B1F' }}>{p.title}</p>
                <p className="text-xs" style={{ color: 'rgba(78,11,31,0.5)' }}>{p.quarter_name}, {p.city_name}</p>
              </div>
              <span className="font-bold text-sm ml-3 whitespace-nowrap" style={{ color: '#CFA847' }}>
                {formatPrice(p.price_eur)}
              </span>
            </div>
          ))}
        </div>

        <div className="p-5 rounded-2xl" style={MC}>
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-display font-bold text-base" style={{ color: '#4E0B1F' }}>Последни запитвания</h2>
            <a href="/admin/inquiries" className="text-xs font-semibold transition-colors" style={{ color: '#CFA847' }}>
              Виж всички →
            </a>
          </div>
          {inquiries.length === 0 ? (
            <p className="text-sm text-center py-8" style={{ color: 'rgba(78,11,31,0.45)' }}>Няма запитвания</p>
          ) : inquiries.map(inq => (
            <div key={inq.id} className="py-2.5"
              style={{ borderBottom: '1px solid rgba(207,168,71,0.15)' }}>
              <div className="flex justify-between mb-1">
                <p className="text-sm font-semibold" style={{ color: '#4E0B1F' }}>{inq.name}</p>
                <span className="text-[10px] px-2 py-0.5 rounded-full font-semibold"
                  style={inq.status === 'new'
                    ? { background: '#4E0B1F', color: '#F5EDD8' }
                    : { color: 'rgba(78,11,31,0.4)', border: '1px solid rgba(78,11,31,0.15)' }}>
                  {inq.status === 'new' ? 'Ново' : 'Прочетено'}
                </span>
              </div>
              <p className="text-xs truncate" style={{ color: 'rgba(78,11,31,0.5)' }}>{inq.message}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
