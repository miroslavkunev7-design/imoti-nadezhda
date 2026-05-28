/** Terrace panorama backgrounds per city (luxury collage spec). */
export const CITY_PANORAMAS: Record<string, string> = {
  shumen: '/images/cities/shumen.jpg',
  varna: '/images/cities/varna.jpg',
  burgas: '/images/cities/burgas.jpg',
  'novi-pazar': '/images/cities/novi-pazar.jpg',
}

export const DEFAULT_PANORAMA = '/images/hero-bg.jpg'

export const CITY_SLUGS = ['shumen', 'varna', 'burgas', 'novi-pazar'] as const
export type CitySlug = (typeof CITY_SLUGS)[number]

export function getCityPanorama(slug?: string | null): string {
  if (!slug) return DEFAULT_PANORAMA
  return CITY_PANORAMAS[slug] ?? DEFAULT_PANORAMA
}

export function normalizeCitySlug(nameOrSlug: string): CitySlug | null {
  const s = nameOrSlug.toLowerCase().trim()
  if (CITY_SLUGS.includes(s as CitySlug)) return s as CitySlug
  const map: Record<string, CitySlug> = {
    шумен: 'shumen',
    варна: 'varna',
    бургас: 'burgas',
    'нови пазар': 'novi-pazar',
    'нови-пazar': 'novi-pazar',
  }
  return map[s] ?? null
}
