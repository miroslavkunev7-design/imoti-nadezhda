import type { Metadata } from 'next'
import AddPropertyForm from '@/components/admin/AddPropertyForm'
import { FALLBACK_CITIES, getQuartersForCity, QUARTERS_BY_CITY } from '@/lib/data/fallback'

export const metadata: Metadata = { title: 'Добави имот' }

export default function NewPropertyPage() {
  // Flatten all quarters for form
  const allQuarters = Object.values(QUARTERS_BY_CITY).flat()

  return (
    <div className="max-w-[860px]">
      <div className="mb-6">
        <h1 className="font-display text-themed-primary text-2xl font-bold">Добави имот</h1>
        <p className="text-themed-secondary text-sm mt-1">Попълни всички полета и публикувай обявата</p>
      </div>
      <AddPropertyForm cities={FALLBACK_CITIES} allQuarters={allQuarters} />
    </div>
  )
}
