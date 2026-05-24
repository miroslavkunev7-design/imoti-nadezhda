import type { Metadata } from 'next'
import SellPropertyForm from '@/components/sell/SellPropertyForm'
import { FALLBACK_CITIES, QUARTERS_BY_CITY } from '@/lib/data/fallback'

export const metadata: Metadata = {
  title: 'Продай имот',
  description:
    'Продайте имота си чрез Имоти Надежда — безплатна оценка и професионална обработка на обявата.',
}

export default function SellPage() {
  const allQuarters = Object.values(QUARTERS_BY_CITY).flat()

  return (
    <div className="min-h-screen pb-[68px] relative">
      <div className="fixed inset-0 -z-10" style={{ background: 'var(--bg-base)' }} />
      <div className="max-w-[860px] mx-auto px-5 lg:px-8" style={{ paddingTop: 88 }}>
        <div className="mb-8">
          <h1 className="font-display text-themed-primary text-3xl font-bold mb-2">
            Продай имот
          </h1>
          <p className="text-themed-secondary text-sm leading-relaxed max-w-xl">
            Попълнете формата по-долу и нашият екип ще се свърже с вас за безплатна
            оценка и публикуване на обявата. Заявката се преглежда от брокер преди
            публикуване.
          </p>
        </div>
        <SellPropertyForm cities={FALLBACK_CITIES} allQuarters={allQuarters} />
      </div>
    </div>
  )
}
