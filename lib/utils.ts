import type { CSSProperties } from 'react'
import { type ClassValue, clsx } from 'clsx'

/** Merge Tailwind class names (clsx without twMerge for minimal deps) */
export function cn(...inputs: ClassValue[]) {
  return clsx(inputs)
}

/** Format price in EUR with Bulgarian locale style */
export function formatPrice(amount: number): string {
  if (amount >= 1_000_000) {
    return `€${(amount / 1_000_000).toFixed(1)} млн.`
  }
  return new Intl.NumberFormat('bg-BG', {
    style:    'currency',
    currency: 'EUR',
    maximumFractionDigits: 0,
  }).format(amount)
}

/** Mortgage term in years (20–30) scaled by property price */
export function getMortgageTermYears(priceEur: number): number {
  const minPrice = 80_000
  const maxPrice = 450_000
  if (priceEur <= minPrice) return 20
  if (priceEur >= maxPrice) return 30
  const ratio = (priceEur - minPrice) / (maxPrice - minPrice)
  return Math.round(20 + ratio * 10)
}

/** Monthly mortgage payment (annuity formula) */
export function calculateMonthlyPayment(
  principal: number,
  annualRatePercent: number,
  termYears: number
): number {
  if (principal <= 0) return 0
  const months = termYears * 12
  const monthlyRate = annualRatePercent / 100 / 12
  if (monthlyRate === 0) return principal / months
  const factor = Math.pow(1 + monthlyRate, months)
  return (principal * monthlyRate * factor) / (factor - 1)
}

/** Default mortgage assumptions for display */
export const MORTGAGE_DEFAULTS = {
  downPaymentPercent: 20,
  annualRatePercent: 4.5,
} as const

/** Format area in m² */
export function formatArea(sqm: number): string {
  return `${sqm} м²`
}

/** Format floor display: "3 от 6" */
export function formatFloor(floor: number | null, total: number | null): string {
  if (!floor) return '—'
  if (total)  return `${floor} от ${total}`
  return `${floor}`
}

/** Truncate text to maxLength with ellipsis */
export function truncate(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text
  return text.slice(0, maxLength).trimEnd() + '…'
}

/** Convert city/quarter name to URL slug */
export function toSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^\w\-а-яёА-ЯЁ]/g, '')
    .replace(/--+/g, '-')
    .replace(/^-|-$/g, '')
}

/** Build absolute property URL */
export function propertyUrl(
  citySlug: string,
  quarterSlug: string,
  propertyId: number
): string {
  return `/cities/${citySlug}/${quarterSlug}/property/${propertyId}`
}

/** Stagger delay style for list animations */
export function staggerDelay(index: number, base = 60): CSSProperties {
  return { animationDelay: `${index * base}ms` }
}

/** Parse comma-separated feature string from searchParams */
export function parseFeatures(raw: string | undefined): string[] {
  if (!raw) return []
  return raw.split(',').map(f => f.trim()).filter(Boolean)
}

/** Clamp a number between min and max */
export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max)
}

/** Format date to Bulgarian short date */
export function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('bg-BG', {
    day:   '2-digit',
    month: 'long',
    year:  'numeric',
  })
}

/** Map PropertyType to Bulgarian display label (already Bulgarian in DB, kept for safety) */
export const PROPERTY_TYPE_LABELS: Record<string, string> = {
  'Апартамент': 'Апартамент',
  'Къща':       'Къща',
  'Мезонет':    'Мезонет',
  'Парцел':     'Парцел',
  'Гараж':      'Гараж',
  'Пентхаус':   'Пентхаус',
}

export const PROPERTY_TYPES = Object.keys(PROPERTY_TYPE_LABELS)

export const FEATURE_LABELS: Record<string, string> = {
  pool:            'Басейн',
  garage:          'Гараж',
  gated_community: 'Затворен комплекс',
  view:            'Изглед',
  terrace:         'Тераса',
  smart_home:      'Смарт дом',
  parking:         'Паркоместо',
  tuhla:           'Тухла',
  obzaveden:       'Обзаведен',
  saniran:         'Саниран',
}

export const SORT_OPTIONS = [
  { value: 'newest',     label: 'Най-нови'      },
  { value: 'price_asc',  label: 'Цена: ниска → висока' },
  { value: 'price_desc', label: 'Цена: висока → ниска' },
  { value: 'area_desc',  label: 'Площ: голяма → малка' },
]

export const ORIENTATION_OPTIONS = [
  'Изток', 'Запад', 'Север', 'Юг',
  'Изток/Запад', 'Юг/Запад', 'Юг/Изток', 'Север/Юг',
]

export const CONSTRUCTION_OPTIONS = [
  'Тухла', 'ЕПК', 'Панел', 'Гредоред', 'Монолит',
]

export const CONDITION_OPTIONS = [
  'Ново строителство', 'До ключ', 'Отлично', 'Добро', 'Тухла',
]

export const HEATING_OPTIONS = [
  'Климатик', 'ТЕЦ', 'Газ', 'Ток', 'Дърва/въглища',
]
