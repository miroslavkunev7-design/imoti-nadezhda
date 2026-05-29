import type { Metadata } from 'next'
import SellPropertyForm from '@/components/sell/SellPropertyForm'
import { FALLBACK_CITIES, QUARTERS_BY_CITY } from '@/lib/data/fallback'

export const metadata: Metadata = {
  title: 'Продай имот — Имоти Надежда',
  description: 'Продайте имота си чрез Имоти Надежда — безплатна оценка и професионална обработка на обявата.',
}

export default function SellPage() {
  const allQuarters = Object.values(QUARTERS_BY_CITY).flat()

  return (
    <div className="rd-sell">
      <div className="rd-sell__inner">
        <h1 className="rd-sell__title">Продай имот</h1>
        <p className="rd-sell__sub">
          Попълнете формата по-долу и нашият екип ще се свърже с вас за безплатна
          оценка и публикуване на обявата.
        </p>
        <SellPropertyForm cities={FALLBACK_CITIES} allQuarters={allQuarters} />
      </div>
    </div>
  )
}
