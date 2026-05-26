import { QUARTERS_BY_CITY } from '@/lib/data/quarters'
import { toSlug } from '@/lib/utils'

export const MARKETPLACE_CITIES = [
  {
    slug: 'shumen',
    name: 'Шумен',
    buySlug: 'shumen-bg',
    nearby: ['Велики Преслав', 'Каспичан', 'Смядово', 'Плиска'],
  },
  {
    slug: 'varna',
    name: 'Варна',
    buySlug: 'varna-bg',
    nearby: ['Аксаково', 'Белослав', 'Девня', 'Провадия', 'Свети Константин и Елена'],
  },
  {
    slug: 'burgas',
    name: 'Бургас',
    buySlug: 'burgas-bg',
    nearby: ['Сарафово', 'Поморие', 'Несебър', 'Созопол', 'Крайморие'],
  },
  {
    slug: 'novi-pazar',
    name: 'Нови пазар',
    buySlug: 'novi-pazar-bg',
    nearby: ['Шумен', 'Смядово', 'Върбица', 'Искра'],
  },
] as const

function normalize(s: string): string {
  return s
    .toLowerCase()
    .replace(/[«»"']/g, '')
    .replace(/\s+/g, ' ')
    .trim()
}

/** Match quarter name from free text (title, location line, description). */
export function resolveDistrict(citySlug: string, text: string): {
  district: string
  district_slug: string
} {
  const quarters = QUARTERS_BY_CITY[citySlug] ?? []
  const hay = normalize(text)

  let best: { district: string; district_slug: string; score: number } | null = null

  for (const q of quarters) {
    const name = normalize(q.name)
    if (!name || name.length < 3) continue
    if (hay.includes(name)) {
      const score = name.length
      if (!best || score > best.score) {
        best = { district: q.name, district_slug: q.slug, score }
      }
    }
  }

  if (best) {
    return { district: best.district, district_slug: best.district_slug }
  }

  const city = MARKETPLACE_CITIES.find(c => c.slug === citySlug)
  if (city) {
    for (const nearby of city.nearby) {
      const n = normalize(nearby)
      if (hay.includes(n)) {
        return { district: nearby, district_slug: toSlug(nearby) }
      }
    }
  }

  if (hay.includes('център') || hay.includes('center')) {
    const centar = quarters.find(q => q.slug === 'centar')
    if (centar) return { district: centar.name, district_slug: centar.slug }
  }

  return { district: 'Център', district_slug: 'centar' }
}

export function resolveCityFromText(text: string): (typeof MARKETPLACE_CITIES)[number] | null {
  const hay = normalize(text)
  for (const city of MARKETPLACE_CITIES) {
    if (hay.includes(normalize(city.name))) return city
  }
  if (hay.includes('нови пазар')) {
    return MARKETPLACE_CITIES.find(c => c.slug === 'novi-pazar') ?? null
  }
  return null
}
