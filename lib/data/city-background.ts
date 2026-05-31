import type { CSSProperties } from 'react'

export type CityPanoramaAsset = {
  jpg: string
  webp?: string
  position?: string
  label?: string
  /** Фото в картата „ЗА ГРАДА“ (отделно от hero background) */
  aboutCardJpg?: string
  aboutCardWebp?: string
  aboutCardPosition?: string
}

const CITY_PAGE_BACKGROUNDS: Record<string, CityPanoramaAsset> = {
  burgas: {
    jpg: '/images/cities/burgas-hero-pier.jpg',
    webp: '/images/cities/burgas-hero-pier.webp',
    position: 'center 42%',
    label: 'Бургас — пирс и морска градина (hero фон, mockup)',
  },
  shumen: {
    jpg: '/images/hero-bg.jpg',
    webp: '/images/hero-bg.webp',
    position: 'center 42%',
    label: 'Панорама — начална страница',
  },
  varna: {
    jpg: '/images/quarters/varna/centar.jpg',
    position: 'center 38%',
    label: 'Варна — морски пейзаж',
  },
  sofia: {
    jpg: '/images/hero-bg.jpg',
    position: 'center 35%',
    label: 'София — градски силует',
  },
  plovdiv: {
    jpg: '/images/hero-bg.jpg',
    position: 'center 40%',
    label: 'Пловдив — хълмове',
  },
  'novi-pazar': {
    jpg: '/images/cities/shumen-page.jpg',
    webp: '/images/cities/shumen-page.webp',
    position: 'center 40%',
    label: 'Нови пазар — градски изглед',
  },
}

export function getCityPanoramaAsset(slug: string, cardImageUrl: string | null): CityPanoramaAsset {
  const custom = CITY_PAGE_BACKGROUNDS[slug]
  if (custom) return custom
  const fallback = cardImageUrl ?? '/images/hero-bg.jpg'
  return {
    jpg: fallback,
    webp: fallback.endsWith('.jpg') ? fallback.replace('.jpg', '.webp') : undefined,
    position: 'center 42%',
  }
}

export function getCityPanoramaUrl(slug: string, cardImageUrl: string | null): string {
  return getCityPanoramaAsset(slug, cardImageUrl).jpg
}

export function getCityAboutCardAsset(slug: string): {
  jpg: string
  webp?: string
  position?: string
} {
  const pano = CITY_PAGE_BACKGROUNDS[slug]
  if (pano?.aboutCardJpg) {
    return {
      jpg: pano.aboutCardJpg,
      webp: pano.aboutCardWebp,
      position: pano.aboutCardPosition ?? 'center 42%',
    }
  }
  return {
    jpg: pano?.jpg ?? '/images/hero-bg.jpg',
    webp: pano?.webp,
    position: pano?.position ?? 'center 42%',
  }
}

export const cityBackgroundStyle = (imageUrl: string, position = 'center center'): CSSProperties => ({
  backgroundImage: `url(${imageUrl})`,
  backgroundSize: 'cover',
  backgroundPosition: position,
  backgroundRepeat: 'no-repeat',
})
