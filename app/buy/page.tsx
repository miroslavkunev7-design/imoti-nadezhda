import type { Metadata } from 'next'
import { Suspense } from 'react'
import { FALLBACK_CITIES } from '@/lib/data/fallback'
import type { Property } from '@/types'
import BuyPageClient from '@/components/buy/BuyPageClient'

export const revalidate = 60
export const metadata: Metadata = { title: 'Имоти за продажба — Имоти Надежда' }

async function getProperties(searchParams: Record<string, string>) {
  try {
    const { getProperties } = await import('@/lib/queries/properties')
    return await getProperties(searchParams)
  } catch {
    return { data: [] as Property[], total: 0, page: 1, per_page: 12, total_pages: 0 }
  }
}

export default async function BuyPage({ searchParams }: { searchParams: Record<string, string> }) {
  const { data: properties, total } = await getProperties(searchParams)
  return (
    <BuyPageClient
      properties={properties}
      total={total}
      cities={FALLBACK_CITIES}
      searchParams={searchParams}
    />
  )
}
