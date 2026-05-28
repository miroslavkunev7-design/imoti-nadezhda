import type { Metadata } from 'next'
import LuxuryHome from '@/components/home/LuxuryHome'
import { FALLBACK_CITIES } from '@/lib/data/fallback'
import { BRAND } from '@/lib/design/brand'

export const metadata: Metadata = {
  title: `${BRAND.siteTitle} — Луксозни недвижими имоти`,
  description:
    'Намерете мечтания си имот в Шумен, Варна, Бургас и Нови пазар. ' +
    'Апартаменти, къщи, мезонети и парцели от водещата агенция.',
}

export const revalidate = 120

export default function HomePage() {
  return <LuxuryHome cities={FALLBACK_CITIES} />
}
