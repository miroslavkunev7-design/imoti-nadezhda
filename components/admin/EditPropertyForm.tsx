'use client'

import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { uploadPropertyImage } from '@/lib/upload-client'
import VirtualTourCRMPanel from '@/components/virtual-tour/VirtualTourCRMPanel'

interface PropertyData {
  id: number
  title: string
  description: string | null
  price_eur: number
  area_sqm: number
  city: string
  quarter: string
  property_type: string
  status: string
  bedrooms: number | null
  bathrooms: number | null
}

const STATUS_OPTIONS = [
  { value: 'active', label: 'Активен (публикуван)' },
  { value: 'pending', label: 'Изчаква одобрение' },
  { value: 'sold', label: 'Продаден' },
  { value: 'rented', label: 'Нает' },
  { value: 'draft', label: 'Архив / чернова' },
]

const MAX_IMAGES = 50

export default function EditPropertyForm({ property }: { property: PropertyData }) {
  const router = useRouter()
  const fileRef = useRef<HTMLInputElement>(null)
  const [form, setForm] = useState({
    title: property.title,
    description: property.description ?? '',
    price_eur: String(property.price_eur),
    area_sqm: String(property.area_sqm),
    city_name: property.city,
    quarter_name: property.quarter,
    type: property.property_type,
    status: property.status === 'available' ? 'active' : (property.status === 'active' ? 'active' : property.status),
    bedrooms: property.bedrooms ? String(property.bedrooms) : '',
    bathrooms: property.bathrooms ? String(property.bathrooms) : '',
  })
  const [images, setImages] = useState<string[]>([])
  const [uploading, setUploading] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  useEffect(() => {
    fetch(`/api/admin/properties/${property.id}`)
      .then(r => r.json())
      .then(json => {
        if (json.success && json.property?.images?.length) {
          setImages(json.property.images)
        }
      })
      .catch(() => {})
  }, [property.id])

  function set(field: string, value: string) {
    setForm(prev => ({ ...prev, [field]: value }))
  }

  async function handleAddImages(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? [])
    if (!files.length) return
    setUploading(true)
    setError('')
    try {
      const remaining = MAX_IMAGES - images.length
      const accepted = files.slice(0, remaining)
      const uploaded: string[] = []
      for (const file of accepted) {
        const url = await uploadPropertyImage(file, file.name)
        uploaded.push(url)
      }
      setImages(prev => [...prev, ...uploaded])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Грешка при качване')
    } finally {
      setUploading(false)
      if (fileRef.current) fileRef.current.value = ''
    }
  }

  function removeImage(index: number) {
    setImages(prev => prev.filter((_, i) => i !== index))
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      const res = await fetch(`/api/admin/properties/${property.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, images }),
      })
      const json = await res.json()
      if (!json.success) throw new Error(json.error ?? 'Грешка')
      setSuccess(true)
      setTimeout(() => router.push('/admin/properties'), 1200)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Грешка при запис')
    } finally {
      setLoading(false)
    }
  }

  async function handleDelete() {
    if (!confirm(`Изтриване на „${property.title}"? Това не може да се отмени.`)) return
    setLoading(true)
    try {
      const res = await fetch(`/api/admin/properties/${property.id}`, { method: 'DELETE' })
      const json = await res.json()
      if (!json.success) throw new Error(json.error ?? 'Грешка')
      router.push('/admin/properties')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Грешка при изтриване')
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div className="property-card-surface p-8 text-center">
        <p className="text-crimson-700 font-semibold">Имотът е запазен успешно!</p>
      </div>
    )
  }

  return (
    <form onSubmit={handleSave} className="max-w-[720px]">
      {error && (
        <div className="mb-4 px-4 py-3 rounded-lg text-sm text-red-300"
          style={{ background: 'rgba(196,30,58,0.15)', border: '1px solid rgba(196,30,58,0.3)' }}>
          {error}
        </div>
      )}

      <div className="property-card-surface p-6 mb-5">
        <h2 className="font-display text-white font-semibold mb-4">Основни данни</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="Заглавие *">
            <input className="input-dark" value={form.title} onChange={e => set('title', e.target.value)} required />
          </Field>
          <Field label="Статус">
            <select className="input-dark" value={form.status} onChange={e => set('status', e.target.value)}>
              {STATUS_OPTIONS.map(o => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
          </Field>
          <Field label="Град">
            <input className="input-dark" value={form.city_name} onChange={e => set('city_name', e.target.value)} />
          </Field>
          <Field label="Квартал">
            <input className="input-dark" value={form.quarter_name} onChange={e => set('quarter_name', e.target.value)} />
          </Field>
          <Field label="Тип">
            <input className="input-dark" value={form.type} onChange={e => set('type', e.target.value)} />
          </Field>
          <Field label="Цена (€) *">
            <input className="input-dark" value={form.price_eur} onChange={e => set('price_eur', e.target.value)} required />
          </Field>
          <Field label="Площ (м²) *">
            <input className="input-dark" value={form.area_sqm} onChange={e => set('area_sqm', e.target.value)} required />
          </Field>
          <Field label="Спални">
            <input className="input-dark" value={form.bedrooms} onChange={e => set('bedrooms', e.target.value)} />
          </Field>
          <Field label="Бани">
            <input className="input-dark" value={form.bathrooms} onChange={e => set('bathrooms', e.target.value)} />
          </Field>
        </div>
        <div className="mt-4">
          <Field label="Описание">
            <textarea className="input-dark min-h-[120px] resize-y" value={form.description}
              onChange={e => set('description', e.target.value)} />
          </Field>
        </div>
      </div>

      <div className="property-card-surface p-6 mb-5">
        <h2 className="font-display text-white font-semibold mb-4">Снимки ({images.length}/{MAX_IMAGES})</h2>
        <input ref={fileRef} type="file" accept="image/*" multiple className="hidden" onChange={handleAddImages} />
        <button type="button" onClick={() => fileRef.current?.click()} disabled={uploading || images.length >= MAX_IMAGES}
          className="btn-ghost text-sm mb-4">
          {uploading ? 'Качване...' : '+ Добави снимки'}
        </button>
        {images.length > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {images.map((url, i) => (
              <div key={`${url}-${i}`} className="relative aspect-square rounded-lg overflow-hidden"
                style={{ border: i === 0 ? '2px solid rgba(196,30,58,0.6)' : '1px solid rgba(196,30,58,0.2)' }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={url} alt="" className="w-full h-full object-cover" />
                <button type="button" onClick={() => removeImage(i)}
                  className="absolute top-1 right-1 w-6 h-6 rounded-full bg-black/60 text-white text-xs">×</button>
                {i === 0 && (
                  <span className="absolute bottom-1 left-1 text-[9px] bg-crimson-700 text-white px-1.5 py-0.5 rounded">Главна</span>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="property-card-surface p-6 mb-5">
        <VirtualTourCRMPanel propertyId={property.id} imageUrls={images} />
      </div>

      <div className="flex flex-wrap gap-3">
        <button type="submit" disabled={loading || uploading} className="btn-crimson px-6 py-2.5 disabled:opacity-60">
          {loading ? 'Запис...' : 'Запази промените'}
        </button>
        <button type="button" onClick={() => router.push('/admin/properties')} className="btn-ghost px-5 py-2.5">
          Отказ
        </button>
        <button type="button" onClick={handleDelete} disabled={loading}
          className="ml-auto text-sm px-5 py-2.5 rounded-lg text-red-400 hover:bg-red-900/20 transition-colors"
          style={{ border: '1px solid rgba(248,113,113,0.35)' }}>
          Изтрий имота
        </button>
      </div>
    </form>
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
