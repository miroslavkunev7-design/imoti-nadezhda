import type { CitySlug } from './brand'

/** Terrace panorama backgrounds per city (hero strip on listing & detail). */
export const CITY_TERRACE_PANORAMAS: Record<CitySlug, string> = {
  shumen: '/images/hero-bg.jpg',
  varna: '/images/hero-bg.jpg',
  burgas: '/images/hero-bg.jpg',
  'novi-pazar': '/images/hero-bg.jpg',
}

export const CITY_HERO_PANORAMAS: Record<CitySlug, string> = {
  shumen: '/images/cities/shumen.jpg',
  varna: '/images/cities/varna.jpg',
  burgas: '/images/cities/burgas.jpg',
  'novi-pazar': '/images/cities/novi-pazar.jpg',
}

export function resolveCityPanorama(slug: string | null | undefined): string {
  if (slug && slug in CITY_TERRACE_PANORAMAS) {
    return CITY_TERRACE_PANORAMAS[slug as CitySlug]
  }
  return '/images/hero-bg.jpg'
}

export function resolveCityHeroPanorama(slug: string | null | undefined): string {
  if (slug && slug in CITY_HERO_PANORAMAS) {
    return CITY_HERO_PANORAMAS[slug as CitySlug]
  }
  return '/images/hero-bg.jpg'
}
