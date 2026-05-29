'use client'

import { useState, useRef } from 'react'
import type { City } from '@/types'
import { PROPERTY_TYPES_BG } from '@/lib/data/fallback'
import { uploadPropertyImage } from '@/lib/upload-client'

interface Quarter {
  id: number
  city_id: number
  name: string
  slug: string
}

interface Props {
  cities: City[]
  allQuarters: Quarter[]
}

interface LocalImage {
  id: string
  file: File
  preview: string
  url?: string
  uploading?: boolean
  error?: string
}

export default function SellPropertyForm({ cities, allQuarters }: Props) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [loading, setLoading] = useState(false)
  const [uploadingImages, setUploadingImages] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')

  const [form, setForm] = useState({
    owner_name: '',
    owner_email: '',
    owner_phone: '',
    city_id: '',
    quarter_id: '',
    title: '',
    type: 'Апартамент',
    price_eur: '',
    area_sqm: '',
    bedrooms: '',
    bathrooms: '',
    description: '',
  })

  const [images, setImages] = useState<LocalImage[]>([])

  const cityQuarters = allQuarters.filter(q => String(q.city_id) === form.city_id)
  const selectedCity = cities.find(c => String(c.id) === form.city_id)
  const selectedQuarter = cityQuarters.find(q => String(q.id) === form.quarter_id)

  function set(field: string, value: string) {
    setForm(prev => ({ ...prev, [field]: value }))
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
      setImages(prev =>
        prev.map(i => (i.id === img.id ? { ...i, uploading: true, error: undefined } : i))
      )
      try {
        const url = await uploadPropertyImage(img.file, img.file.name)
        uploaded.push(url)
        setImages(prev =>
          prev.map(i => (i.id === img.id ? { ...i, url, uploading: false } : i))
        )
      } catch (err) {
        const msg = err instanceof Error ? err.message : 'Грешка'
        setImages(prev =>
          prev.map(i => (i.id === img.id ? { ...i, uploading: false, error: msg } : i))
        )
        throw new Error(`Грешка при качване на снимка: ${msg}`)
      }
    }

    setUploadingImages(false)
    return uploaded
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (
      !form.owner_name ||
      !form.owner_email ||
      !form.owner_phone ||
      !form.city_id ||
      !form.quarter_id ||
      !form.title ||
      !form.price_eur ||
      !form.area_sqm
    ) {
      setError('Попълнете всички задължителни полета (*)')
      return
    }
    if (!images.length) {
      setError('Добавете поне една снимка на имота')
      return
    }

    setLoading(true)
    setError('')
    try {
      const imageUrls = await uploadAllImages()
      const res = await fetch('/api/sell', {
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
      if (!json.success) throw new Error(json.error ?? 'Грешка при изпращане')
      setSuccess(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Грешка при изпращане')
    } finally {
      setLoading(false)
      setUploadingImages(false)
    }
  }

  if (success) {
    return (
      <div
        className="property-card-surface p-10 text-center max-w-lg mx-auto"
        style={{ marginTop: 40 }}
      >
        <div
          className="w-16 h-16 rounded-full mx-auto mb-5 flex items-center justify-center"
          style={{ background: 'rgba(196,30,58,0.15)' }}
        >
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#A86B3D" strokeWidth="2">
            <polyline points="20 6 9 17 4 12" />
          </svg>
        </div>
        <h2 className="font-display text-themed-primary text-xl font-bold mb-2">
          Заявката е изпратена!
        </h2>
        <p className="text-themed-secondary text-sm leading-relaxed">
          Брокер от Имоти Надежда ще прегледа обявата и ще се свърже с вас в рамките на 24 часа.
        </p>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-[720px]">
      {error && (
        <div
          className="mb-4 px-4 py-3 rounded-lg text-sm text-red-300"
          style={{ background: 'rgba(196,30,58,0.15)', border: '1px solid rgba(196,30,58,0.3)' }}
        >
          {error}
        </div>
      )}

      <Section title="Вашите данни">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Field label="Име *">
            <input className="input-dark" value={form.owner_name} onChange={e => set('owner_name', e.target.value)} />
          </Field>
          <Field label="Имейл *">
            <input type="email" className="input-dark" value={form.owner_email} onChange={e => set('owner_email', e.target.value)} />
          </Field>
          <Field label="Телефон *">
            <input type="tel" className="input-dark" value={form.owner_phone} onChange={e => set('owner_phone', e.target.value)} />
          </Field>
        </div>
      </Section>

      <Section title="Информация за имота">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
          <Field label="Град *">
            <select
              className="input-dark"
              value={form.city_id}
              onChange={e => {
                set('city_id', e.target.value)
                set('quarter_id', '')
              }}
            >
              <option value="">Изберете град</option>
              {cities.map(c => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </Field>
          <Field label="Квартал *">
            <select
              className="input-dark"
              value={form.quarter_id}
              onChange={e => set('quarter_id', e.target.value)}
              disabled={!form.city_id}
            >
              <option value="">Изберете квартал</option>
              {cityQuarters.map(q => (
                <option key={q.id} value={q.id}>{q.name}</option>
              ))}
            </select>
          </Field>
          <Field label="Заглавие *">
            <input className="input-dark" placeholder="напр. Тристаен апартамент с гараж" value={form.title} onChange={e => set('title', e.target.value)} />
          </Field>
          <Field label="Тип имот">
            <select className="input-dark" value={form.type} onChange={e => set('type', e.target.value)}>
              {PROPERTY_TYPES_BG.map(t => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </Field>
          <Field label="Цена (€) *">
            <input className="input-dark" inputMode="decimal" value={form.price_eur} onChange={e => set('price_eur', e.target.value.replace(/[^\d.,]/g, '').replace(',', '.'))} />
          </Field>
          <Field label="Площ (м²) *">
            <input className="input-dark" inputMode="decimal" value={form.area_sqm} onChange={e => set('area_sqm', e.target.value.replace(/[^\d.,]/g, '').replace(',', '.'))} />
          </Field>
          <Field label="Спални">
            <input className="input-dark" inputMode="numeric" value={form.bedrooms} onChange={e => set('bedrooms', e.target.value.replace(/\D/g, ''))} />
          </Field>
          <Field label="Бани">
            <input className="input-dark" inputMode="numeric" value={form.bathrooms} onChange={e => set('bathrooms', e.target.value.replace(/\D/g, ''))} />
          </Field>
        </div>
        <Field label="Описание">
          <textarea
            className="input-dark min-h-[100px] resize-y"
            placeholder="Опишете имота — етаж, изложение, ремонт, удобства..."
            value={form.description}
            onChange={e => set('description', e.target.value)}
          />
        </Field>
      </Section>

      <Section title="Снимки">
        <input ref={fileInputRef} type="file" accept="image/*" multiple className="hidden" onChange={handleFileSelect} />
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="btn-ghost text-sm px-4 py-2 mb-4"
          style={{ border: '1px dashed rgba(196,30,58,0.4)' }}
        >
          + Добави снимки
        </button>
        {images.length > 0 && (
          <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
            {images.map(img => (
              <div key={img.id} className="relative aspect-square rounded-lg overflow-hidden group">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={img.preview} alt="" className="w-full h-full object-cover" />
                {img.uploading && (
                  <div className="absolute inset-0 bg-black/50 flex items-center justify-center text-white text-xs">
                    Качване...
                  </div>
                )}
                {img.error && (
                  <div className="absolute inset-0 bg-red-900/70 flex items-center justify-center text-white text-[10px] p-1 text-center">
                    {img.error}
                  </div>
                )}
                <button
                  type="button"
                  onClick={() => removeImage(img.id)}
                  className="absolute top-1 right-1 w-6 h-6 rounded-full bg-black/60 text-white text-xs opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        )}
      </Section>

      <button
        type="submit"
        disabled={loading || uploadingImages}
        className="btn-crimson w-full sm:w-auto px-8 py-3 text-base font-semibold disabled:opacity-60"
      >
        {loading || uploadingImages ? 'Изпращане...' : 'Изпрати заявка за продажба'}
      </button>
    </form>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="property-card-surface p-6 mb-5">
      <h2
        className="font-display text-themed-primary font-semibold mb-4 pb-3"
        style={{ borderBottom: '1px solid rgba(196,30,58,0.15)', fontSize: '1.05rem' }}
      >
        {title}
      </h2>
      {children}
    </div>
  )
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="filter-label">{label}</label>
      {children}
    </div>
  )
}
