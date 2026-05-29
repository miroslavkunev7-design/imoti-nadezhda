'use client'

import { useCallback, useEffect, useState } from 'react'
import { MARKETPLACE_CITIES } from '@/lib/marketplace/districts'
import { QUARTERS_BY_CITY } from '@/lib/data/quarters'
import type { MarketplaceLead } from '@/lib/marketplace/types'
import { adminCardClass, PageHeader } from '@/components/admin/AdminCard'

type EditForm = {
  title: string
  description: string
  phone: string
  price: string
  city_slug: string
  district: string
  district_slug: string
  property_type: string
  area_sqm: string
  imagesText: string
}

function leadToForm(lead: MarketplaceLead): EditForm {
  return {
    title: lead.title,
    description: lead.description ?? '',
    phone: lead.phone ?? '',
    price: lead.price != null ? String(lead.price) : '',
    city_slug: lead.city_slug ?? 'shumen',
    district: lead.district,
    district_slug: lead.district_slug ?? '',
    property_type: lead.property_type ?? 'Апартамент',
    area_sqm: lead.area_sqm != null ? String(lead.area_sqm) : '',
    imagesText: lead.images.join('\n'),
  }
}

function statusLabel(s: string): string {
  const map: Record<string, string> = {
    pending_review: 'Чака преглед',
    editing: 'Редакция',
    duplicate: 'Дубликат',
    published: 'Публикуван',
    rejected: 'Отхвърлен',
  }
  return map[s] ?? s
}

export default function MarketplaceLeadsBoard() {
  const [leads, setLeads] = useState<MarketplaceLead[]>([])
  const [loading, setLoading] = useState(true)
  const [syncing, setSyncing] = useState(false)
  const [syncMsg, setSyncMsg] = useState('')
  const [selectedId, setSelectedId] = useState<number | null>(null)
  const [form, setForm] = useState<EditForm | null>(null)
  const [saving, setSaving] = useState(false)
  const [filter, setFilter] = useState<string>('pending_review')

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/admin/marketplace/leads')
      const json = await res.json()
      if (json.success) setLeads(json.leads ?? [])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    load()
  }, [load])

  const filtered = filter === 'all' ? leads : leads.filter(l => l.status === filter)

  async function syncMarket() {
    setSyncing(true)
    setSyncMsg('')
    try {
      const res = await fetch('/api/admin/marketplace/sync', { method: 'POST' })
      const json = await res.json()
      if (json.success) {
        const bySrc = json.bySource
          ? Object.entries(json.bySource as Record<string, number>)
              .map(([k, v]) => `${k}: ${v}`)
              .join(', ')
          : ''
        setSyncMsg(
          `Добавени (непубликувани): ${json.added}, дубликати: ${json.duplicates}, пропуснати: ${json.skipped}. Сканирани: ${json.scanned}.${bySrc ? ` Източници: ${bySrc}` : ''} ${json.note ? `— ${json.note}` : ''}`
        )
        if (json.errors?.length) {
          setSyncMsg(prev => `${prev} ${json.errors.join(' ')}`)
        }
        await load()
      } else {
        setSyncMsg(json.error ?? 'Грешка при синхронизация')
      }
    } catch {
      setSyncMsg('Грешка при връзка')
    } finally {
      setSyncing(false)
    }
  }

  function openEdit(lead: MarketplaceLead) {
    setSelectedId(lead.id)
    setForm(leadToForm(lead))
  }

  function patchForm(patch: Partial<EditForm>) {
    setForm(prev => (prev ? { ...prev, ...patch } : prev))
  }

  function onCityChange(slug: string) {
    const city = MARKETPLACE_CITIES.find(c => c.slug === slug)
    patchForm({
      city_slug: slug,
      district: '',
      district_slug: '',
    })
    if (city && form) {
      patchForm({ city_slug: slug })
    }
  }

  function onDistrictChange(slug: string) {
    const quarters = QUARTERS_BY_CITY[form?.city_slug ?? 'shumen'] ?? []
    const q = quarters.find(x => x.slug === slug)
    patchForm({
      district_slug: slug,
      district: q?.name ?? slug,
    })
  }

  async function saveEdit() {
    if (!selectedId || !form) return
    setSaving(true)
    try {
      const res = await fetch(`/api/admin/marketplace/leads/${selectedId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: form.title,
          description: form.description,
          phone: form.phone,
          price: Number(form.price),
          city_slug: form.city_slug,
          city: MARKETPLACE_CITIES.find(c => c.slug === form.city_slug)?.name,
          district: form.district,
          district_slug: form.district_slug,
          property_type: form.property_type,
          area_sqm: form.area_sqm ? Number(form.area_sqm) : null,
          images: form.imagesText.split('\n').map(s => s.trim()).filter(Boolean),
          status: 'editing',
        }),
      })
      const json = await res.json()
      if (json.success) {
        await load()
        setSyncMsg('Записът е запазен.')
      } else {
        setSyncMsg(json.error ?? 'Грешка при запис')
      }
    } finally {
      setSaving(false)
    }
  }

  async function publish() {
    if (!selectedId || !form) return
    setSaving(true)
    try {
      const payload = {
        title: form.title,
        description: form.description,
        phone: form.phone,
        price: Number(form.price),
        city_slug: form.city_slug,
        city: MARKETPLACE_CITIES.find(c => c.slug === form.city_slug)?.name,
        district: form.district,
        district_slug: form.district_slug,
        property_type: form.property_type,
        area_sqm: form.area_sqm ? Number(form.area_sqm) : null,
        images: form.imagesText.split('\n').map(s => s.trim()).filter(Boolean),
      }
      const res = await fetch(`/api/admin/marketplace/leads/${selectedId}/publish`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      const json = await res.json()
      if (json.success) {
        setSyncMsg(`Публикувано! Имот #${json.propertyId}`)
        setSelectedId(null)
        setForm(null)
        await load()
        if (json.redirectUrl) window.open(json.redirectUrl, '_blank')
      } else {
        setSyncMsg(json.error ?? 'Грешка при публикуване')
      }
    } finally {
      setSaving(false)
    }
  }

  const quarters = QUARTERS_BY_CITY[form?.city_slug ?? 'shumen'] ?? []

  return (
    <div>
      <PageHeader title="Извлечени имоти" />
      <p className="admin-text-muted text-sm mb-3 -mt-3">
        Извличане от Realistimo, Imoti.bg, OLX (само частни), Bazar.bg и Home.bg — <strong>само обяви от собственик / частни</strong>.
        Записват се като <strong>непубликувани чернови</strong> — редактирайте телефон, цена, снимки, после „Публикувай на сайта“.
      </p>
      <div
        className="mb-5 px-4 py-2.5 rounded-xl text-xs border border-amber-500/35 bg-amber-950/25 text-amber-100/90"
      >
        Нищо не отива автоматично на сайта. Публикувате само след преглед в CRM редактора.
      </div>

      <div className={`${adminCardClass} mb-6 flex flex-wrap items-center gap-3`}>
        <button
          type="button"
          onClick={syncMarket}
          disabled={syncing}
          className="btn-crimson px-5 py-2.5 text-sm font-semibold disabled:opacity-60"
        >
          {syncing ? 'Извличане...' : 'Извлечи имоти (всички сайтове)'}
        </button>
        <select
          className="input-dark text-sm"
          value={filter}
          onChange={e => setFilter(e.target.value)}
        >
          <option value="pending_review">Чакащи преглед</option>
          <option value="editing">В редакция</option>
          <option value="duplicate">Дубликати</option>
          <option value="published">Публикувани</option>
          <option value="all">Всички</option>
        </select>
        {syncMsg && <p className="admin-text-muted text-xs flex-1 min-w-[200px]">{syncMsg}</p>}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <div className={adminCardClass}>
          <h3 className="admin-heading text-sm mb-3">Списък ({filtered.length})</h3>
          {loading ? (
            <p className="admin-text-muted text-sm">Зареждане...</p>
          ) : filtered.length === 0 ? (
            <p className="admin-text-muted text-sm">
              Няма извлечени имоти. Натиснете „Синхронизирай пазара“.
            </p>
          ) : (
            <ul className="flex flex-col gap-2 max-h-[520px] overflow-y-auto">
              {filtered.map(lead => (
                <li
                  key={lead.id}
                  className={`rounded-xl p-3 cursor-pointer transition-colors border ${
                    selectedId === lead.id
                      ? 'border-crimson-500/60 bg-white/5'
                      : 'border-white/10 hover:bg-white/5'
                  }`}
                  onClick={() => openEdit(lead)}
                >
                  <div className="flex justify-between gap-2">
                    <p className="admin-text text-sm font-medium line-clamp-2">{lead.title}</p>
                    <span className="text-[10px] uppercase tracking-wide text-crimson-400 flex-shrink-0">
                      {statusLabel(lead.status)}
                    </span>
                  </div>
                  <p className="admin-text-muted text-xs mt-1">
                    {lead.city} · {lead.district} · {lead.price?.toLocaleString('bg-BG')} €
                  </p>
                  <p className="admin-text-muted text-[10px] mt-0.5">{lead.source}</p>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className={adminCardClass}>
          <h3 className="admin-heading text-sm mb-1">CRM редактор — чернова</h3>
          <p className="admin-text-muted text-[11px] mb-3">Променете телефон, цена, квартал преди публикуване.</p>
          {!form ? (
            <p className="admin-text-muted text-sm">Изберете обява от списъка.</p>
          ) : (
            <div className="flex flex-col gap-3">
              <input
                className="input-dark text-sm"
                value={form.title}
                onChange={e => patchForm({ title: e.target.value })}
                placeholder="Заглавие"
              />
              <textarea
                className="input-dark text-sm min-h-[80px]"
                value={form.description}
                onChange={e => patchForm({ description: e.target.value })}
                placeholder="Описание"
              />
              <div className="grid grid-cols-2 gap-2">
                <input
                  className="input-dark text-sm"
                  value={form.price}
                  onChange={e => patchForm({ price: e.target.value })}
                  placeholder="Цена €"
                />
                <input
                  className="input-dark text-sm"
                  value={form.phone}
                  onChange={e => patchForm({ phone: e.target.value })}
                  placeholder="Телефон"
                />
              </div>
              <select
                className="input-dark text-sm"
                value={form.city_slug}
                onChange={e => onCityChange(e.target.value)}
              >
                {MARKETPLACE_CITIES.map(c => (
                  <option key={c.slug} value={c.slug}>
                    {c.name}
                  </option>
                ))}
              </select>
              <select
                className="input-dark text-sm"
                value={form.district_slug}
                onChange={e => onDistrictChange(e.target.value)}
              >
                <option value="">— Квартал —</option>
                {quarters.map(q => (
                  <option key={q.slug} value={q.slug}>
                    {q.name}
                  </option>
                ))}
              </select>
              <div className="grid grid-cols-2 gap-2">
                <input
                  className="input-dark text-sm"
                  value={form.property_type}
                  onChange={e => patchForm({ property_type: e.target.value })}
                  placeholder="Тип имот"
                />
                <input
                  className="input-dark text-sm"
                  value={form.area_sqm}
                  onChange={e => patchForm({ area_sqm: e.target.value })}
                  placeholder="Площ m²"
                />
              </div>
              <textarea
                className="input-dark text-xs min-h-[60px] font-mono"
                value={form.imagesText}
                onChange={e => patchForm({ imagesText: e.target.value })}
                placeholder="URL на снимки (по един на ред)"
              />
              {form.imagesText.split('\n')[0] && (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={form.imagesText.split('\n')[0].trim()}
                  alt=""
                  className="w-full h-32 object-contain rounded-lg bg-black/30"
                />
              )}
              <div className="flex flex-wrap gap-2 pt-2">
                <button
                  type="button"
                  onClick={saveEdit}
                  disabled={saving}
                  className="px-4 py-2 text-sm rounded-lg border border-crimson-600/50 text-crimson-300 hover:bg-crimson-900/30 disabled:opacity-50"
                >
                  Запази чернова
                </button>
                <button
                  type="button"
                  onClick={publish}
                  disabled={
                    saving ||
                    leads.find(l => l.id === selectedId)?.status === 'published'
                  }
                  className="btn-crimson px-4 py-2 text-sm disabled:opacity-50"
                >
                  Публикувай на сайта
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
