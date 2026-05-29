import { MARKETPLACE_CITIES, resolveDistrict } from '@/lib/marketplace/districts'
import type { ScrapedListing } from '@/lib/marketplace/types'
import { isPrivateOwnerListing } from '@/lib/marketplace/private-filter'
import { toSlug } from '@/lib/utils'

const BASE = 'https://realistimo.com'
const FETCH_HEADERS: HeadersInit = {
  'User-Agent':
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
  Accept: 'text/html,application/xhtml+xml',
  'Accept-Language': 'bg-BG,bg;q=0.9,en;q=0.8',
}

const MAX_OFFERS_PER_CITY = 18
const OFFER_FETCH_CONCURRENCY = 4

async function fetchHtml(url: string): Promise<string | null> {
  try {
    const res = await fetch(url, {
      headers: FETCH_HEADERS,
      next: { revalidate: 0 },
      signal: AbortSignal.timeout(12_000),
    })
    if (!res.ok) return null
    return await res.text()
  } catch {
    return null
  }
}

function extractOfferUrls(html: string): string[] {
  const urls = new Set<string>()
  const patterns = [
    /href="(\/bg\/buy\/offer-[^"]+)"/gi,
    /href="(\/bg\/buy\/real-estate\/[^"]+)"/gi,
    /"url"\s*:\s*"(https:\/\/realistimo\.com\/bg\/buy\/offer-[^"]+)"/gi,
  ]
  for (const re of patterns) {
    let m: RegExpExecArray | null
    while ((m = re.exec(html))) {
      const path = m[1].startsWith('http') ? new URL(m[1]).pathname : m[1]
      urls.add(`${BASE}${path.split('?')[0]}`)
    }
  }
  return [...urls].slice(0, MAX_OFFERS_PER_CITY)
}

function parseJsonLdBlocks(html: string): unknown[] {
  const blocks: unknown[] = []
  const re = /<script[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi
  let m: RegExpExecArray | null
  while ((m = re.exec(html))) {
    try {
      const parsed = JSON.parse(m[1].trim())
      if (Array.isArray(parsed)) blocks.push(...parsed)
      else blocks.push(parsed)
    } catch {
      /* ignore */
    }
  }
  return blocks
}

function pickString(v: unknown): string {
  if (typeof v === 'string') return v
  if (v && typeof v === 'object' && 'name' in v) return String((v as { name: string }).name)
  return ''
}

function parsePrice(text: string): number {
  const digits = text.replace(/[^\d.,]/g, '').replace(',', '.')
  const n = parseFloat(digits)
  return Number.isFinite(n) ? n : 0
}

function parseArea(text: string): number | null {
  const m = text.match(/(\d+(?:[.,]\d+)?)\s*(?:кв\.?м|m²|sqm)/i)
  if (!m) return null
  const n = parseFloat(m[1].replace(',', '.'))
  return Number.isFinite(n) ? n : null
}

function extractImages(html: string): string[] {
  const imgs = new Set<string>()
  const og = html.match(/property="og:image"\s+content="([^"]+)"/i)
  if (og?.[1]) imgs.add(og[1])
  const re = /https:\/\/static\.realistimo\.com\/[^"'\s>]+\.(?:jpg|jpeg|webp)/gi
  let m: RegExpExecArray | null
  while ((m = re.exec(html))) imgs.add(m[0])
  return [...imgs].slice(0, 12)
}

function extractPhone(html: string): string {
  const tel = html.match(/href="tel:([^"]+)"/i)
  if (tel?.[1]) return tel[1].replace(/\s/g, '')
  const bg = html.match(/(?:\+359|0)\s*\d[\d\s]{7,12}/)
  return bg?.[0]?.replace(/\s/g, '') ?? ''
}

function parseOfferPage(html: string, url: string, cityConfig: (typeof MARKETPLACE_CITIES)[number]): ScrapedListing | null {
  const blocks = parseJsonLdBlocks(html)
  let title = ''
  let description = ''
  let price = 0
  let locationText = ''

  for (const block of blocks) {
    if (!block || typeof block !== 'object') continue
    const b = block as Record<string, unknown>
    const type = String(b['@type'] ?? '')
    if (type.includes('Product') || type.includes('Offer') || type.includes('RealEstateListing')) {
      title = title || pickString(b.name)
      description = description || pickString(b.description)
      if (b.offers && typeof b.offers === 'object') {
        const offers = b.offers as Record<string, unknown>
        price = price || parsePrice(String(offers.price ?? offers.lowPrice ?? ''))
      }
      if (b.price) price = price || parsePrice(String(b.price))
      if (b.address) locationText = locationText || pickString(b.address)
    }
  }

  if (!title) {
    const ogTitle = html.match(/property="og:title"\s+content="([^"]+)"/i)
    title = ogTitle?.[1]?.split('|')[0]?.trim() ?? ''
  }
  if (!description) {
    const meta = html.match(/name="description"\s+content="([^"]+)"/i)
    description = meta?.[1] ?? ''
  }
  if (!price) {
    const priceMatch = html.match(/(\d[\d\s.,]*)\s*€/i) ?? html.match(/€\s*(\d[\d\s.,]*)/i)
    if (priceMatch) price = parsePrice(priceMatch[1])
  }

  const breadcrumb = html.match(/кв\.?\s*([^,<]+)[,\s]+([^,<]+)/i)
  if (breadcrumb) {
    locationText = `${breadcrumb[1]} ${breadcrumb[2]}`
  }
  if (!locationText) {
    const loc = html.match(/(?:м\.|кв\.|район)\s*([^,<]{3,40})/i)
    if (loc) locationText = loc[0]
  }

  if (!title || !price) return null

  if (
    !isPrivateOwnerListing({
      source: 'realistimo',
      title,
      description,
      html,
      url,
    })
  ) {
    return null
  }

  const external_id = url.split('/').filter(Boolean).pop() ?? toSlug(title)
  const districtResolved = resolveDistrict(
    cityConfig.slug,
    `${title} ${locationText} ${description}`
  )

  const area_sqm = parseArea(`${title} ${description}`)

  return {
    source: 'realistimo',
    external_id,
    source_url: url,
    city: cityConfig.name,
    city_slug: cityConfig.slug,
    district: districtResolved.district,
    district_slug: districtResolved.district_slug,
    title: title.slice(0, 500),
    description: description.slice(0, 8000),
    phone: extractPhone(html),
    price,
    images: extractImages(html),
    property_type: title.toLowerCase().includes('къща')
      ? 'Къща'
      : title.toLowerCase().includes('парцел')
        ? 'Парцел'
        : 'Апартамент',
    area_sqm,
  }
}

async function mapPool<T, R>(items: T[], limit: number, fn: (item: T) => Promise<R | null>): Promise<R[]> {
  const out: R[] = []
  let i = 0
  async function worker() {
    while (i < items.length) {
      const idx = i++
      const result = await fn(items[idx])
      if (result) out.push(result)
    }
  }
  await Promise.all(Array.from({ length: Math.min(limit, items.length) }, () => worker()))
  return out
}

export async function syncRealistimoMarketplace(): Promise<{
  listings: ScrapedListing[]
  errors: string[]
  citiesScanned: number
}> {
  const listings: ScrapedListing[] = []
  const errors: string[] = []
  let citiesScanned = 0

  for (const city of MARKETPLACE_CITIES) {
    const listUrl = `${BASE}/bg/buy/${city.buySlug}/`
    const listHtml = await fetchHtml(listUrl)
    if (!listHtml) {
      errors.push(`${city.name}: неуспешно зареждане на списъка`)
      continue
    }
    citiesScanned++
    const offerUrls = extractOfferUrls(listHtml)
    if (!offerUrls.length) {
      errors.push(`${city.name}: няма намерени обяви в HTML`)
      continue
    }

    const scraped = await mapPool(offerUrls, OFFER_FETCH_CONCURRENCY, async url => {
      const html = await fetchHtml(url)
      if (!html) return null
      return parseOfferPage(html, url, city)
    })

    listings.push(...scraped.filter(Boolean) as ScrapedListing[])
  }

  return { listings, errors, citiesScanned }
}
