'use client'

import Link from 'next/link'
import type { City } from '@/types'

interface Props { cities: City[] }

export default function HomeHero({ cities }: Props) {
  const bySlug = (slug: string) => cities.find(c => c.slug === slug)

  return (
    <main className="relative h-[100dvh] w-full overflow-hidden bg-black hp-clone" aria-label="Начална страница">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/images/homepage-pixel-clone.png"
        alt=""
        className="absolute inset-0 h-full w-full select-none object-cover"
        draggable={false}
      />

      <Link href="/" className="hp-clone__hit hp-clone__logo" aria-label="Начало" />
      <Link href="/buy" className="hp-clone__hit hp-clone__nav-sale" aria-label="За продажба" />
      <Link href="/buy?deal=rent" className="hp-clone__hit hp-clone__nav-rent" aria-label="Под наем" />
      <Link href="/about" className="hp-clone__hit hp-clone__nav-about" aria-label="За нас" />
      <Link href="/admin/login" className="hp-clone__hit hp-clone__nav-user" aria-label="Вход" />

      <Link
        href="/buy?city=burgas&quarter=lazur&type=Апартамент&price_min=200000&price_max=500000&area_min=100&area_max=200"
        className="hp-clone__hit hp-clone__search"
        aria-label="Търси"
      />

      <Link href={`/cities/${bySlug('shumen')?.slug ?? 'shumen'}`} className="hp-clone__hit hp-clone__city hp-clone__city--1" aria-label="Шумен" />
      <Link href={`/cities/${bySlug('varna')?.slug ?? 'varna'}`} className="hp-clone__hit hp-clone__city hp-clone__city--2" aria-label="Варна" />
      <Link href={`/cities/${bySlug('burgas')?.slug ?? 'burgas'}`} className="hp-clone__hit hp-clone__city hp-clone__city--3" aria-label="Бургас" />
      <Link href={`/cities/${bySlug('novi-pazar')?.slug ?? 'novi-pazar'}`} className="hp-clone__hit hp-clone__city hp-clone__city--4" aria-label="Нови пазар" />
    </main>
  )
}
