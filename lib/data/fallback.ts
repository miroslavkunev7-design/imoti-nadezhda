import type { City } from '@/types'
export { getQuartersForCity, QUARTERS_BY_CITY } from './quarters'

// Static fallback used when DB is not yet seeded
// Replace image_url values with your actual photos placed in /public/images/cities/
export const FALLBACK_CITIES: City[] = [
  {
    id: 1,
    name: 'Шумен',
    slug: 'shumen',
    description:
      'Исторически и модерен град с богато културно наследство, развита инфраструктура и отлични възможности за живот и инвестиции.',
    image_url: '/images/cities/shumen.jpg',
    population: 85000,
    area_km2: 83.6,
    region: 'Североизток',
    sort_order: 1,
    property_count: 0,
    quarter_count: 8,
  },
  {
    id: 2,
    name: 'Варна',
    slug: 'varna',
    description:
      'Варна е морската столица на България — динамичен град с прекрасни плажове, оживен бизнес център и богат културен живот.',
    image_url: '/images/cities/varna.jpg',
    population: 335000,
    area_km2: 205.7,
    region: 'Черноморие',
    sort_order: 2,
    property_count: 0,
    quarter_count: 12,
  },
  {
    id: 3,
    name: 'Бургас',
    slug: 'burgas',
    description:
      'Бургас е второто по големина черноморско пристанище в България с уникална атмосфера, езера и прекрасна морска среда.',
    image_url: '/images/cities/burgas.jpg',
    population: 210000,
    area_km2: 255.5,
    region: 'Черноморие',
    sort_order: 3,
    property_count: 0,
    quarter_count: 9,
  },
  {
    id: 4,
    name: 'Нови пазар',
    slug: 'novi-pazar',
    description:
      'Нови пазар е спокоен и уютен град с богата история, зелени паркове и предпочитан от семейства заради тихата атмосфера.',
    image_url: '/images/cities/novi-pazar.jpg',
    population: 14000,
    area_km2: 18.5,
    region: 'Североизток',
    sort_order: 4,
    property_count: 0,
    quarter_count: 4,
  },
]

export const PROPERTY_TYPES_BG = [
  'Къща',
  'Апартамент',
  'Мезонет',
  'Пентхаус',
  'Парцел',
]

export const EXTRA_FILTERS_BG = [
  { key: 'pool',            label: 'Басейн'           },
  { key: 'garage',          label: 'Гараж'            },
  { key: 'gated_community', label: 'Затворен комплекс' },
  { key: 'view',            label: 'Изглед'           },
  { key: 'terrace',         label: 'Тераса'           },
  { key: 'smart_home',      label: 'Смарт дом'        },
]
