'use client'
import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { cardStyle, PageHeader, StatusBadge, TabBar, tableCellStyle, tableHeaderStyle } from '@/components/admin/AdminCard'
import { formatPrice } from '@/lib/utils'

interface Property { id: number; title: string; type: string; price_eur: number; status: string; city_name: string; quarter_name: string; created_at: string; city_slug: string; quarter_slug: string }

const STATUS_FILTER: Record<string, string> = {
  'Всички': '', 'Активни': 'active', 'Изчакване': 'pending', 'Резервирани': 'reserved',
  'Продадени': 'sold', 'Наети': 'rented', 'Архив': 'draft',
}

export default function PropertiesTable({ properties: initial }: { properties: Property[] }) {
  const router = useRouter()
  const [properties, setProperties] = useState(initial)
  const [tab, setTab] = useState('Всички')
  const tabs = Object.keys(STATUS_FILTER)

  const filtered = STATUS_FILTER[tab]
    ? properties.filter(p => p.status === STATUS_FILTER[tab])
    : properties

  async function deleteProperty(id: number, title: string) {
    if (!confirm(`Изтриване на „${title}"?`)) return
    const res = await fetch(`/api/admin/properties/${id}`, { method: 'DELETE' })
    const json = await res.json()
    if (json.success) {
      setProperties(prev => prev.filter(p => p.id !== id))
    } else {
      alert(json.error ?? 'Грешка при изтриване')
    }
  }

  return (
    <div>
      <PageHeader title={`Имоти (${properties.length})`}
        action={
          <Link href="/admin/properties/new" className="btn-crimson text-sm px-4 py-2">
            + Добави имот
          </Link>
        }
      />
      <TabBar tabs={tabs} active={tab} onChange={setTab} />

      <div className="rounded-xl overflow-hidden" style={cardStyle}>
        {filtered.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-[rgba(255,255,255,0.4)] mb-4">Няма имоти в тази категория</p>
            <Link href="/admin/properties/new" className="btn-crimson text-sm px-5 py-2">Добави имот</Link>
          </div>
        ) : (
          <table className="w-full">
            <thead>
              <tr style={tableHeaderStyle}>
                {['#','Имот','Тип','Квартал','Цена','Статус','Дата','Действия'].map(h => (
                  <th key={h} className="text-left px-4 py-3 text-[10px] text-[rgba(255,255,255,0.4)] uppercase tracking-wider font-medium">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map(p => (
                <tr key={p.id} className="hover:bg-[rgba(196,30,58,0.05)] transition-colors">
                  <td className="px-4 py-3 text-crimson-700 font-mono text-xs" style={tableCellStyle}>#{p.id}</td>
                  <td className="px-4 py-3" style={tableCellStyle}>
                    <p className="text-sm text-white font-medium truncate max-w-[180px]">{p.title}</p>
                    <p className="text-[10px] text-[rgba(255,255,255,0.35)]">{p.city_name}</p>
                  </td>
                  <td className="px-4 py-3 text-[rgba(255,255,255,0.55)] text-sm" style={tableCellStyle}>{p.type}</td>
                  <td className="px-4 py-3 text-[rgba(255,255,255,0.55)] text-sm" style={tableCellStyle}>{p.quarter_name}</td>
                  <td className="px-4 py-3 text-crimson-700 font-bold text-sm" style={tableCellStyle}>{formatPrice(p.price_eur)}</td>
                  <td className="px-4 py-3" style={tableCellStyle}><StatusBadge status={p.status} /></td>
                  <td className="px-4 py-3 text-[rgba(255,255,255,0.4)] text-xs" style={tableCellStyle}>
                    {new Date(p.created_at).toLocaleDateString('bg-BG')}
                  </td>
                  <td className="px-4 py-3" style={tableCellStyle}>
                    <div className="flex items-center gap-2 flex-wrap">
                      <button
                        type="button"
                        onClick={() => router.push(`/admin/properties/${p.id}/edit`)}
                        className="text-xs text-white hover:text-crimson-400 transition-colors"
                      >
                        Редакция
                      </button>
                      {p.city_slug && p.quarter_slug && (
                        <Link href={`/cities/${p.city_slug}/${p.quarter_slug}/property/${p.id}`}
                          target="_blank"
                          className="text-xs text-crimson-700 hover:text-crimson-400 transition-colors">
                          Виж
                        </Link>
                      )}
                      <button
                        type="button"
                        onClick={() => deleteProperty(p.id, p.title)}
                        className="text-xs text-red-400 hover:text-red-300 transition-colors"
                      >
                        Изтрий
                      </button>
                    </div>
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
