import type { MarketplaceLead, ScrapedListing } from '@/lib/marketplace/types'

export function buildDuplicateKey(input: {
  phone?: string | null
  title?: string | null
  city?: string | null
  district?: string | null
  price?: number | null
  external_id?: string | null
  source?: string | null
}): string {
  if (input.external_id && input.source) {
    return `${input.source}:${input.external_id}`.toLowerCase()
  }
  const phone = (input.phone ?? '').replace(/\D/g, '').slice(-9)
  const title = (input.title ?? '')
    .toLowerCase()
    .replace(/[^a-zа-я0-9]+/gi, ' ')
    .trim()
    .slice(0, 80)
  const city = (input.city ?? '').toLowerCase()
  const district = (input.district ?? '').toLowerCase()
  const price = input.price != null ? Math.round(input.price) : 0
  return `${phone}|${title}|${city}|${district}|${price}`
}

export function isDuplicateListing(
  listing: ScrapedListing,
  existing: MarketplaceLead[],
  existingPropertyKeys: Set<string>
): boolean {
  const key = buildDuplicateKey(listing)
  if (existing.some(e => e.duplicate_key === key && e.status !== 'rejected')) return true
  if (existingPropertyKeys.has(key)) return true
  if (existing.some(e => e.external_id === listing.external_id && e.source === listing.source)) {
    return true
  }
  return false
}
