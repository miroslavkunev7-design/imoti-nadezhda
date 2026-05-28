import type { Metadata } from 'next'
import HeroSection from '@/components/home/HeroSection'
import { FALLBACK_CITIES } from '@/lib/data/fallback'

export const metadata: Metadata = {
  title: 'Имоти ИЛДЖ.ИА — Луксозни недвижими имоти',
  description:
    'Намерете мечтания си имот в Шумен, Варна, Бургас и Нови Пазар. ' +
    'Апартаменти, къщи, мезонети и парцели от водещата агенция.',
}

export const revalidate = 120

export default function HomePage() {
  return <HeroSection cities={FALLBACK_CITIES} />
}
