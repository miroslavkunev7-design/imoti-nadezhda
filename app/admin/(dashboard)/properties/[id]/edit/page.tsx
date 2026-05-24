import type { Metadata } from 'next'
import Link from 'next/link'
import EditPropertyForm from '@/components/admin/EditPropertyForm'
import { queryOne } from '@/lib/db'

export const metadata: Metadata = { title: 'Редакция на имот' }
export const dynamic = 'force-dynamic'

async function getProperty(id: number) {
  try {
    return await queryOne<{
      id: number
      title: string
      description: string | null
      price: number
      area: number
      city: string
      quarter: string
      property_type: string
      status: string
      bedrooms: number | null
      bathrooms: number | null
    }>(`SELECT * FROM properties WHERE id = ?`, [id])
  } catch {
    return null
  }
}

export default async function EditPropertyPage({ params }: { params: { id: string } }) {
  const id = parseInt(params.id, 10)
  const row = await getProperty(id)

  if (!row) {
    return (
      <div className="max-w-[720px]">
        <p className="text-white mb-4">Имотът не е намерен.</p>
        <Link href="/admin/properties" className="btn-crimson text-sm px-5 py-2">← Назад</Link>
      </div>
    )
  }

  return (
    <div className="max-w-[860px]">
      <div className="mb-6">
        <Link href="/admin/properties" className="text-sm text-crimson-700 hover:text-crimson-400 mb-2 inline-block">
          ← Назад към имоти
        </Link>
        <h1 className="font-display text-themed-primary text-2xl font-bold">Редакция на имот #{row.id}</h1>
      </div>
      <EditPropertyForm property={{
        id: row.id,
        title: row.title,
        description: row.description,
        price_eur: Number(row.price),
        area_sqm: Number(row.area),
        city: row.city,
        quarter: row.quarter,
        property_type: row.property_type,
        status: row.status,
        bedrooms: row.bedrooms,
        bathrooms: row.bathrooms,
      }} />
    </div>
  )
}
