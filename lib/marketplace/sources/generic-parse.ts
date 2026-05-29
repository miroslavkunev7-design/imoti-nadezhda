import type { ScrapedListing } from '@/lib/marketplace/types'
import { resolveDistrict } from '@/lib/marketplace/districts'
import { MARKETPLACE_CITIES } from '@/lib/marketplace/districts'
import { extractPhone, parseAreaSqm, parsePriceEur } from '@/lib/marketplace/fetch-html'
import { isPrivateOwnerListing } from '@/lib/marketplace/private-filter'
import { toSlug } from '@/lib/utils'

type CityConfig = (typeof MARKETPLACE_CITIES)[number]

export function buildListing(params: {
  source: string
  source_url: string
  city: CityConfig
  title: string
  description: string
  price: number
  images: string[]
  locationText?: string
}): ScrapedListing | null {
  if (!params.title || !params.price) return null
  const external_id = params.source_url.split('/').filter(Boolean).pop() ?? toSlug(params.title)
  const districtResolved = resolveDistrict(
    params.city.slug,
    `${params.title} ${params.locationText ?? ''} ${params.description}`
  )
  return {
    source: params.source,
    external_id: `${params.source}-${external_id}`.slice(0, 120),
    source_url: params.source_url,
    city: params.city.name,
    city_slug: params.city.slug,
    district: districtResolved.district,
    district_slug: districtResolved.district_slug,
    title: params.title.slice(0, 500),
    description: params.description.slice(0, 8000),
    phone: '',
    price: params.price,
    images: params.images.slice(0, 12),
    property_type: params.title.toLowerCase().includes('къща')
      ? 'Къща'
      : params.title.toLowerCase().includes('парцел')
        ? 'Парцел'
        : 'Апартамент',
    area_sqm: parseAreaSqm(`${params.title} ${params.description}`),
  }
}

export function parseGenericOfferPage(
  html: string,
  url: string,
  city: CityConfig,
  source: string,
  imagePatterns: RegExp[]
): ScrapedListing | null {
  const ogTitle = html.match(/property="og:title"\s+content="([^"]+)"/i)
  const title = ogTitle?.[1]?.split('|')[0]?.trim() ?? ''
  const meta = html.match(/name="description"\s+content="([^"]+)"/i)
  const description = meta?.[1] ?? ''
  const priceMatch = html.match(/(\d[\d\s.,]*)\s*€/i) ?? html.match(/€\s*(\d[\d\s.,]*)/i)
  const price = priceMatch ? parsePriceEur(priceMatch[1]) : 0

  const imgs = new Set<string>()
  const og = html.match(/property="og:image"\s+content="([^"]+)"/i)
  if (og?.[1]) imgs.add(og[1])
  for (const re of imagePatterns) {
    let m: RegExpExecArray | null
    while ((m = re.exec(html))) imgs.add(m[0] || m[1])
  }

  const listing = buildListing({
    source,
    source_url: url,
    city,
    title,
    description,
    price,
    images: [...imgs],
  })
  if (!listing) return null
  listing.phone = extractPhone(html)

  if (
    !isPrivateOwnerListing({
      source,
      title,
      description,
      html,
      url,
    })
  ) {
    return null
  }

  return listing
}
