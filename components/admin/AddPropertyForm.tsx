'use client'

import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import type { City } from '@/types'
import { PROPERTY_TYPES_BG, EXTRA_FILTERS_BG } from '@/lib/data/fallback'
import { ORIENTATION_OPTIONS, CONSTRUCTION_OPTIONS, CONDITION_OPTIONS, HEATING_OPTIONS } from '@/lib/utils'
import MatchNotification from '@/components/admin/MatchNotification'
import PublishResultsModal from '@/components/admin/PublishResultsModal'
import { PUBLISH_CHANNELS, buildListingText, getPublishLinks } from '@/lib/publish/channels'
import { uploadPropertyImage } from '@/lib/upload-client'

interface Quarter { id: number; city_id: number; name: string; slug: string; city_slug?: string }
interface Props { cities: City[]; allQuarters: Quarter[] }

interface LocalImage {
  id: string
  file?: File
  preview: string
  url?: string
  uploading?: boolean
  error?: string
}

function FormSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="property-card-surface p-6 mb-5">
      <h2 className="font-display text-themed-primary font-semibold mb-4 pb-3"
        style={{ borderBottom: '1px solid rgba(196,30,58,0.15)', fontSize: '1.05rem' }}>
        {title}
      </h2>
      {children}
    </div>
  )
}

function FormField({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="filter-label">
        {label}{required && <span className="text-crimson-700 ml-1">*</span>}
      </label>
      {children}
    </div>
  )
}

function NumericInput({
  value,
  onChange,
  placeholder,
}: {
  value: string
  onChange: (v: string) => void
  placeholder?: string
}) {
  return (
    <input
      type="text"
      inputMode="decimal"
      className="input-dark"
      placeholder={placeholder}
      value={value}
      onChange={e => onChange(e.target.value.replace(/[^\d.,]/g, '').replace(',', '.'))}
    />
  )
}

export default function AddPropertyForm({ cities, allQuarters }: Props) {
  const router = useRouter()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [loading, setLoading] = useState(false)
  const [uploadingImages, setUploadingImages] = useState(false)
  const [success, setSuccess] = useState(false)
  const [savedLocally, setSavedLocally] = useState(false)
  const [error,   setError]   = useState('')
  const [matches, setMatches] = useState<any[]>([])
  const [showMatch, setShowMatch] = useState(false)
  const [publishResults, setPublishResults] = useState<Array<{ id: string; name: string; color: string; postUrl: string; openUrl: string }> | null>(null)
  const [pendingPublishAll, setPendingPublishAll] = useState(false)
  const [publishChannels, setPublishChannels] = useState<string[]>(
    PUBLISH_CHANNELS.map(c => c.id)
  )

  const [form, setForm] = useState({
    city_id:      '',
    quarter_id:   '',
    title:        '',
    type:         'Апартамент',
    detailed_type:'',
    price_eur:    '',
    area_sqm:     '',
    floor:        '',
    total_floors: '',
    bedrooms:     '',
    bathrooms:    '',
    orientation:  '',
    construction: 'Тухла',
    year_built:   '',
    condition:    '',
    heating:      '',
    elevator:     false,
    furnished:    false,
    is_featured:  false,
    is_new:       true,
    description:  '',
    features:     [] as string[],
  })

  const [images, setImages] = useState<LocalImage[]>([])

  const cityQuarters = allQuarters.filter(q => String(q.city_id) === form.city_id)
  const selectedCity = cities.find(c => String(c.id) === form.city_id)
  const selectedQuarter = cityQuarters.find(q => String(q.id) === form.quarter_id)

  function showError(msg: string) {
    setError(msg)
  }

  function set(field: string, value: string | boolean | string[]) {
    setForm(prev => ({ ...prev, [field]: value }))
  }

  function togglePublishChannel(id: string) {
    setPublishChannels(prev =>
      prev.includes(id) ? prev.filter(c => c !== id) : [...prev, id]
    )
  }

  const MAX_IMAGES = 50

  function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? [])
    if (!files.length) return

    setImages(prev => {
      const remaining = MAX_IMAGES - prev.length
      if (remaining <= 0) return prev
      const accepted = files.slice(0, remaining)
      const newImages: LocalImage[] = accepted.map(file => ({
        id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
        file,
        preview: URL.createObjectURL(file),
        uploading: false,
      }))
      return [...prev, ...newImages]
    })
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  function removeImage(id: string) {
    setImages(prev => {
      const img = prev.find(i => i.id === id)
      if (img?.preview.startsWith('blob:')) URL.revokeObjectURL(img.preview)
      return prev.filter(i => i.id !== id)
    })
  }

  async function uploadAllImages(): Promise<string[]> {
    const pending = images.filter(i => !i.url)
    if (!pending.length) return images.filter(i => i.url).map(i => i.url!)

    setUploadingImages(true)
    const uploaded: string[] = images.filter(i => i.url).map(i => i.url!)

    for (const img of pending) {
      setImages(prev => prev.map(i => i.id === img.id ? { ...i, uploading: true, error: undefined } : i))

      try {
        const file: Blob = img.file ?? await fetch(img.preview).then(r => r.blob())
        const name = img.file?.name ?? `photo-${img.id}.jpg`
        const url = await uploadPropertyImage(file, name)

        uploaded.push(url)
        setImages(prev => prev.map(i =>
          i.id === img.id ? { ...i, url, uploading: false } : i
        ))
      } catch (err) {
        const msg = err instanceof Error ? err.message : 'Грешка'
        setImages(prev => prev.map(i =>
          i.id === img.id ? { ...i, uploading: false, error: msg } : i
        ))
        throw new Error(`Грешка при качване на снимка: ${msg}`)
      }
    }

    setUploadingImages(false)
    return uploaded
  }

  async function saveProperty(publishAll: boolean) {
    const imageUrls = await uploadAllImages()
    if (!imageUrls.length) {
      throw new Error('Добавете поне една снимка')
    }

    const res = await fetch('/api/admin/properties', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...form,
        images: imageUrls,
        city_name: selectedCity?.name,
        quarter_name: selectedQuarter?.name,
        city_slug: selectedCity?.slug,
        quarter_slug: selectedQuarter?.slug,
      }),
    })
    const json = await res.json()
    if (!json.success) {
      throw new Error(json.error ?? 'Грешка при запазване')
    }

    if (json.local) setSavedLocally(true)

    const siteUrl = json.redirectUrl
      ? `${window.location.origin}${json.redirectUrl}`
      : window.location.origin

    if (publishAll && publishChannels.length > 0) {
      const draft = {
        title: form.title,
        description: form.description,
        price_eur: form.price_eur,
        area_sqm: form.area_sqm,
        cityName: selectedCity?.name ?? '',
        quarterName: selectedQuarter?.name ?? '',
        type: form.type,
        siteUrl,
      }
      const text = buildListingText(draft)
      try { await navigator.clipboard.writeText(text) } catch { /* ignore */ }

      setPublishResults(getPublishLinks(draft, publishChannels))
      setSuccess(true)
      return
    }

    setSuccess(true)
    setTimeout(() => router.push('/admin/properties'), 1500)
  }

  function toggleFeature(key: string) {
    setForm(prev => ({
      ...prev,
      features: prev.features.includes(key)
        ? prev.features.filter(f => f !== key)
        : [...prev.features, key],
    }))
  }

  async function handleMatchClose() {
    setShowMatch(false)
    setLoading(true)
    try {
      await saveProperty(pendingPublishAll)
    } catch (err) {
      showError(err instanceof Error ? err.message : 'Грешка при запазване')
    } finally {
      setLoading(false)
      setUploadingImages(false)
    }
  }

  function handleNotifyClient(clientId: number) {
    // Mark as notified in CRM — fire & forget
    fetch(`/api/admin/clients/${clientId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'active' }),
    })
  }

  async function handleSubmit(e: React.FormEvent, publishAll = false) {
    e.preventDefault()
    if (!form.city_id || !form.quarter_id || !form.title || !form.price_eur || !form.area_sqm) {
      showError('Моля попълнете задължителните полета: Град, Квартал, Заглавие, Цена, Площ')
      return
    }
    if (!images.length) {
      showError('Добавете поне една снимка от лаптопа или галерията')
      return
    }
    setLoading(true)
    setError('')
    setPendingPublishAll(publishAll)
    try {
      const matchRes = await fetch('/api/admin/match', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          city_id:    form.city_id,
          quarter_id: form.quarter_id,
          city_name:  selectedCity?.name,
          quarter_name: selectedQuarter?.name,
          type:       form.type,
          price_eur:  Number(form.price_eur),
          bedrooms:   form.bedrooms ? Number(form.bedrooms) : null,
        }),
      })
      const matchJson = await matchRes.json()
      if (matchJson.count > 0) {
        setMatches(matchJson.matches)
        setShowMatch(true)
        return
      }

      await saveProperty(publishAll)
    } catch (err) {
      showError(err instanceof Error ? err.message : 'Грешка при свързване с базата данни')
    } finally {
      setLoading(false)
      setUploadingImages(false)
    }
  }

  if (success && !publishResults) {
    return (
      <div className="property-card-surface p-10 text-center">
        <div className="text-5xl mb-4">✓</div>
        <p className="font-display text-themed-primary text-xl font-bold">Имотът е добавен успешно!</p>
        {savedLocally && (
          <p className="text-themed-secondary text-sm mt-2 max-w-md mx-auto">
            Записан локално — базата на хостинга не е достъпна от компютъра ти.
            На сървъра ще се записва директно в базата.
          </p>
        )}
        <p className="text-themed-secondary text-sm mt-2">Пренасочване...</p>
      </div>
    )
  }

  return (
    <>
    {publishResults && (
      <PublishResultsModal
        results={publishResults}
        onClose={() => router.push('/admin/properties')}
      />
    )}
    {showMatch && (
      <MatchNotification
        matches={matches}
        propertyTitle={form.title}
        onClose={handleMatchClose}
        onNotify={handleNotifyClient}
      />
    )}
    <form onSubmit={e => handleSubmit(e, false)}>

      {/* Error — винаги видим отгоре */}
      {error && (
        <div
          className="mb-5 p-4 rounded-xl text-sm text-crimson-700 font-medium"
          style={{ background: 'rgba(196,30,58,0.12)', border: '1.5px solid rgba(196,30,58,0.35)' }}
        >
          ⚠ {error}
        </div>
      )}

      {/* Location */}
      <FormSection title="Локация">
        <div className="grid grid-cols-2 gap-4">
          <FormField label="Град" required>
            <select className="input-dark" value={form.city_id}
              onChange={e => { set('city_id', e.target.value); set('quarter_id', '') }}>
              <option value="">Избери град</option>
              {cities.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </FormField>
          <FormField label="Квартал" required>
            <select className="input-dark" value={form.quarter_id}
              onChange={e => set('quarter_id', e.target.value)} disabled={!form.city_id}>
              <option value="">Избери квартал</option>
              {cityQuarters.map(q => <option key={q.id} value={q.id}>{q.name}</option>)}
            </select>
          </FormField>
        </div>
      </FormSection>

      {/* Basic info */}
      <FormSection title="Основна информация">
        <div className="grid grid-cols-1 gap-4">
          <FormField label="Заглавие на обявата" required>
            <input className="input-dark" placeholder="напр. 3-стаен апартамент с тераса"
              value={form.title} onChange={e => set('title', e.target.value)} />
          </FormField>
          <div className="grid grid-cols-2 gap-4">
            <FormField label="Тип имот">
              <select className="input-dark" value={form.type} onChange={e => set('type', e.target.value)}>
                {PROPERTY_TYPES_BG.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </FormField>
            <FormField label="Вид строителство">
              <select className="input-dark" value={form.construction} onChange={e => set('construction', e.target.value)}>
                <option value="">— изберете —</option>
                {CONSTRUCTION_OPTIONS.map(o => <option key={o} value={o}>{o}</option>)}
              </select>
            </FormField>
          </div>
        </div>
      </FormSection>

      {/* Price & Size */}
      <FormSection title="Цена и площ">
        <div className="grid grid-cols-3 gap-4">
          <FormField label="Цена (EUR)" required>
            <NumericInput value={form.price_eur} onChange={v => set('price_eur', v)} placeholder="напр. 75000" />
          </FormField>
          <FormField label="Площ (м²)" required>
            <NumericInput value={form.area_sqm} onChange={v => set('area_sqm', v)} placeholder="напр. 85" />
          </FormField>
          <FormField label="Год. на строеж">
            <NumericInput value={form.year_built} onChange={v => set('year_built', v)} placeholder="напр. 2010" />
          </FormField>
        </div>
      </FormSection>

      {/* Rooms */}
      <FormSection title="Стаи и етажи">
        <div className="grid grid-cols-4 gap-4">
          <FormField label="Стаи">
            <NumericInput value={form.bedrooms} onChange={v => set('bedrooms', v)} />
          </FormField>
          <FormField label="Бани">
            <NumericInput value={form.bathrooms} onChange={v => set('bathrooms', v)} />
          </FormField>
          <FormField label="Етаж">
            <NumericInput value={form.floor} onChange={v => set('floor', v)} />
          </FormField>
          <FormField label="Общо етажи">
            <NumericInput value={form.total_floors} onChange={v => set('total_floors', v)} />
          </FormField>
        </div>
        <div className="grid grid-cols-3 gap-4 mt-4">
          <FormField label="Изложение">
            <select className="input-dark" value={form.orientation} onChange={e => set('orientation', e.target.value)}>
              <option value="">— изберете —</option>
              {ORIENTATION_OPTIONS.map(o => <option key={o} value={o}>{o}</option>)}
            </select>
          </FormField>
          <FormField label="Отопление">
            <select className="input-dark" value={form.heating} onChange={e => set('heating', e.target.value)}>
              <option value="">— изберете —</option>
              {HEATING_OPTIONS.map(o => <option key={o} value={o}>{o}</option>)}
            </select>
          </FormField>
          <FormField label="Състояние">
            <select className="input-dark" value={form.condition} onChange={e => set('condition', e.target.value)}>
              <option value="">— изберете —</option>
              {CONDITION_OPTIONS.map(o => <option key={o} value={o}>{o}</option>)}
            </select>
          </FormField>
        </div>
      </FormSection>

      {/* Features */}
      <FormSection title="Характеристики и екстри">
        <div className="flex flex-wrap gap-4 mb-4">
          {[
            { key: 'elevator', label: 'Асансьор' },
            { key: 'furnished', label: 'Обзаведен' },
            { key: 'is_featured', label: '⭐ Топ оферта' },
            { key: 'is_new', label: '🆕 Нова оферта' },
          ].map(({ key, label }) => (
            <label key={key} className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" className="accent-crimson-700 w-4 h-4"
                checked={form[key as keyof typeof form] as boolean}
                onChange={e => set(key, e.target.checked)} />
              <span className="text-sm text-themed-primary">{label}</span>
            </label>
          ))}
        </div>
        <div className="flex flex-wrap gap-3">
          {EXTRA_FILTERS_BG.map(({ key, label }) => (
            <label key={key} className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" className="accent-crimson-700 w-4 h-4"
                checked={form.features.includes(key)}
                onChange={() => toggleFeature(key)} />
              <span className="text-sm text-themed-primary">{label}</span>
            </label>
          ))}
        </div>
      </FormSection>

      {/* Images — upload from device */}
      <FormSection title="Снимки">
        <p className="text-xs text-themed-secondary mb-3">
          Избери снимки от лаптопа или галерията на телефона. Първата е главна.
        </p>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={handleFileSelect}
        />

        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="w-full py-8 rounded-xl border-2 border-dashed transition-all hover:border-crimson-700 hover:bg-[rgba(196,30,58,0.05)] mb-4"
          style={{ borderColor: 'rgba(196,30,58,0.35)' }}
        >
          <div className="flex flex-col items-center gap-2 text-themed-secondary">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/>
              <polyline points="21 15 16 10 5 21"/>
            </svg>
            <span className="text-sm font-medium text-themed-primary">Качи снимки</span>
            <span className="text-xs">Всички формати · до 50 снимки</span>
          </div>
        </button>

        {images.length > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 mb-2">
            {images.map((img, i) => (
              <div key={img.id} className="relative group rounded-xl overflow-hidden aspect-square"
                style={{ border: i === 0 ? '2px solid rgba(196,30,58,0.6)' : '1px solid rgba(196,30,58,0.2)' }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={img.preview} alt="" className="w-full h-full object-cover" />
                {i === 0 && (
                  <span className="absolute top-2 left-2 text-[9px] font-bold px-1.5 py-0.5 rounded bg-crimson-700 text-white">
                    Главна
                  </span>
                )}
                {img.uploading && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/50">
                    <span className="text-white text-xs">Качване...</span>
                  </div>
                )}
                {img.error && (
                  <div className="absolute inset-0 flex items-center justify-center bg-red-900/70 p-2">
                    <span className="text-white text-[10px] text-center">{img.error}</span>
                  </div>
                )}
                <button
                  type="button"
                  onClick={() => removeImage(img.id)}
                  className="absolute top-2 right-2 w-6 h-6 rounded-full bg-black/60 text-white text-xs opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        )}

        {images.length > 0 && (
          <button type="button" onClick={() => fileInputRef.current?.click()}
            className="btn-ghost text-sm mt-1">
            + Добави още снимки
          </button>
        )}
      </FormSection>

      {/* Description */}
      <FormSection title="Описание">
        <textarea
          className="input-dark"
          rows={6}
          placeholder="Опишете имота подробно — предимства, обзавеждане, инфраструктура..."
          value={form.description}
          onChange={e => set('description', e.target.value)}
        />
      </FormSection>

      {/* Multi-platform publish — отделна секция с отделен бутон */}
      <FormSection title="Публикуване във всички сайтове">
        <p className="text-xs text-themed-secondary mb-4">
          Избери платформите и публикувай обявата навсякъде с един клик.
        </p>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-5">
          {PUBLISH_CHANNELS.map(ch => (
            <label
              key={ch.id}
              className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl cursor-pointer transition-all"
              style={{
                border: publishChannels.includes(ch.id)
                  ? '1.5px solid rgba(196,30,58,0.5)'
                  : '1px solid rgba(196,30,58,0.15)',
                background: publishChannels.includes(ch.id) ? 'rgba(196,30,58,0.08)' : 'transparent',
              }}
            >
              <input
                type="checkbox"
                className="accent-crimson-700 w-4 h-4"
                checked={publishChannels.includes(ch.id)}
                onChange={() => togglePublishChannel(ch.id)}
              />
              <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: ch.color }} />
              <span className="text-sm text-themed-primary font-medium">{ch.name}</span>
            </label>
          ))}
        </div>

        <button
          type="button"
          disabled={loading || uploadingImages || publishChannels.length === 0}
          onClick={e => handleSubmit(e as unknown as React.FormEvent, true)}
          className="w-full flex items-center justify-center gap-3 py-4 rounded-xl font-semibold text-sm transition-all hover:scale-[1.01] disabled:opacity-50 disabled:cursor-not-allowed"
          style={{
            background: 'linear-gradient(135deg, rgba(196,30,58,0.15), rgba(100,10,25,0.25))',
            border: '2px solid rgba(196,30,58,0.55)',
            color: 'var(--text-primary)',
          }}
        >
          {loading && pendingPublishAll ? (
            <>{uploadingImages ? 'Качване на снимки...' : 'Публикуване навсякъде...'}</>
          ) : (
            <>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#A86B3D" strokeWidth="2">
                <circle cx="12" cy="12" r="10"/>
                <line x1="2" y1="12" x2="22" y2="12"/>
                <path d="M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z"/>
              </svg>
              Публикуване във всички сайтове
              <span className="text-[10px] font-normal text-themed-secondary ml-1">
                (OLX · Imot.bg · Bazar · Alo · Facebook)
              </span>
            </>
          )}
        </button>
      </FormSection>

      {/* Submit — само за сайта */}
      <div className="flex gap-3 mt-2 mb-8 p-4 rounded-xl"
        style={{ background: 'rgba(4,2,12,0.85)', border: '1px solid rgba(196,30,58,0.2)' }}>
        <button
          type="submit"
          disabled={loading || uploadingImages}
          className="btn-crimson text-sm px-8 py-3 min-w-[180px]"
        >
          {loading && !pendingPublishAll
            ? (uploadingImages ? 'Качване на снимки...' : 'Запазване...')
            : 'Публикувай имота'}
        </button>
        <a href="/admin/properties" className="btn-ghost text-sm px-6 py-3">Отказ</a>
      </div>
    </form>
    </>
  )
}
