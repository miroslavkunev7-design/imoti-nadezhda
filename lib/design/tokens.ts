export const BRAND = {
  burgundy: '#6B001C',
  lightBurgundy: '#7A0D28',
  marbleWhite: '#FAF7F2',
  luxuryGold: '#CFA54A',
  deepGold: '#A97A1F',
} as const

export const HEADER_HEIGHT = 96

export const CITY_PANORAMAS: Record<string, string> = {
  shumen: '/images/cities/shumen.jpg',
  varna: '/images/cities/varna.jpg',
  burgas: '/images/cities/burgas.jpg',
  'novi-pazar': '/images/cities/novi-pazar.jpg',
}

export const DEFAULT_CITY_SLUG = 'shumen'

export const STORAGE_KEY = 'ildjia-selected-city'
