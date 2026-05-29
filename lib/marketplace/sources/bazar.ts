import { MARKETPLACE_CITIES } from '@/lib/marketplace/districts'
import type { ScrapedListing } from '@/lib/marketplace/types'
import { fetchHtml, mapPool } from '@/lib/marketplace/fetch-html'
import { parseGenericOfferPage } from '@/lib/marketplace/sources/generic-parse'

const BASE = 'https://bazar.bg'
const MAX_PER_CITY = 10

function extractUrls(html: string): string[] {
  const urls = new Set<string>()
  const re = /href="(https:\/\/bazar\.bg\/obiava\/[^"]+)"/gi
  let m: RegExpExecArray | null
  while ((m = re.exec(html))) urls.add(m[1].split('?')[0])
  return [...urls].slice(0, MAX_PER_CITY)
}

export async function syncBazarMarketplace(): Promise<{
  listings: ScrapedListing[]
  errors: string[]
}> {
  const listings: ScrapedListing[] = []
  const errors: string[] = []

  for (const city of MARKETPLACE_CITIES) {
    let html = await fetchHtml(`${BASE}/obiavi/nedvizhimi-imoti/prodazhbi/${city.slug}?type=private`)
    if (!html) html = await fetchHtml(`${BASE}/obiavi/nedvizhimi-imoti/prodazhbi/${city.slug}`)
    if (!html) html = await fetchHtml(`${BASE}/obiavi?keyword=${encodeURIComponent(city.name)}`)
    if (!html) {
      errors.push(`Bazar.bg ${city.name}: списъкът не се зареди`)
      continue
    }
    const urls = extractUrls(html)
    if (!urls.length) {
      errors.push(`Bazar.bg ${city.name}: няма обяви`)
      continue
    }
    const scraped = await mapPool(urls, 3, async url => {
      const page = await fetchHtml(url)
      if (!page) return null
      return parseGenericOfferPage(page, url, city, 'bazar', [/https:\/\/[^"'\s>]+\.(?:jpg|jpeg|webp)/gi])
    })
    listings.push(...scraped)
  }

  return { listings, errors }
}
