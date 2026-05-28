export const BRAND = {
  name: 'ИЛДЖ.ИА',
  fullName: 'Недвижими Имоти ИЛДЖ.ИА',
  siteTitle: 'Имоти ИЛДЖ.ИА',
} as const

export const LUXURY_COLORS = {
  burgundy: '#6B001C',
  burgundyLight: '#7A0D28',
  marbleWhite: '#FAF7F2',
  gold: '#CFA54A',
  goldDeep: '#A97A1F',
} as const

export type CitySlug = 'shumen' | 'varna' | 'burgas' | 'novi-pazar'

export const CITY_SLUGS: CitySlug[] = ['shumen', 'varna', 'burgas', 'novi-pazar']

export function isCitySlug(value: string): value is CitySlug {
  return (CITY_SLUGS as string[]).includes(value)
}
