import type { Metadata } from 'next'
import HomeHero from '@/components/home/HomeHero'
import { FALLBACK_CITIES } from '@/lib/data/fallback'

export const metadata: Metadata = {
  title: 'Имоти Надежда — Луксозни недвижими имоти',
  description:
    'Намерете мечтания си имот в Шумен, Варна, Бургас и Нови пазар. ' +
    'Апартаменти, къщи, мезонети и парцели от водещата агенция.',
}

export const revalidate = 120

export default function HomePage() {
  return <HomeHero cities={FALLBACK_CITIES} />
}
