export const BRAND = {
  name: 'ИЛДЖ.ИА',
  tagline: 'Недвижими Имоти',
  logoLine: 'Недвижими Имоти ИЛДЖ.ИА',
} as const

export const COLORS = {
  burgundy: '#6B001C',
  burgundyLight: '#7A0D28',
  marbleWhite: '#FAF7F2',
  gold: '#CFA54A',
  goldDeep: '#A97A1F',
} as const

export type CitySlug = 'shumen' | 'varna' | 'burgas' | 'novi-pazar'

export const CITY_PANORAMA: Record<CitySlug, string> = {
  shumen: '/images/hero-bg.jpg',
  varna: '/images/cities/varna.jpg',
  burgas: '/images/cities/burgas.jpg',
  'novi-pazar': '/images/cities/novi-pazar.jpg',
}

export const DEFAULT_PANORAMA = '/images/hero-bg.jpg'

export function resolvePanorama(slug?: string | null): string {
  if (!slug) return DEFAULT_PANORAMA
  return CITY_PANORAMA[slug as CitySlug] ?? DEFAULT_PANORAMA
}

export const SELECTED_CITY_KEY = 'ildjia-selected-city'
