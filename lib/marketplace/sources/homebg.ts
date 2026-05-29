import { MARKETPLACE_CITIES } from '@/lib/marketplace/districts'
import type { ScrapedListing } from '@/lib/marketplace/types'
import { fetchHtml, mapPool } from '@/lib/marketplace/fetch-html'
import { parseGenericOfferPage } from '@/lib/marketplace/sources/generic-parse'

const BASE = 'https://www.home.bg'
const MAX_PER_CITY = 10

function extractUrls(html: string): string[] {
  const urls = new Set<string>()
  const patterns = [
    /href="(\/obiavi\/[^"]+)"/gi,
    /href="(https:\/\/www\.home\.bg\/[^"]+)"/gi,
  ]
  for (const re of patterns) {
    let m: RegExpExecArray | null
    while ((m = re.exec(html))) {
      const u = m[1].startsWith('http') ? m[1] : `${BASE}${m[1]}`
      if (u.includes('obiav') || u.includes('offer') || u.includes('property')) {
        urls.add(u.split('?')[0])
      }
    }
  }
  return [...urls].slice(0, MAX_PER_CITY)
}

export async function syncHomeBgMarketplace(): Promise<{
  listings: ScrapedListing[]
  errors: string[]
}> {
  const listings: ScrapedListing[] = []
  const errors: string[] = []

  for (const city of MARKETPLACE_CITIES) {
    const listUrl = `${BASE}/prodazhbi/${city.slug}`
    let html = await fetchHtml(listUrl)
    if (!html) html = await fetchHtml(`${BASE}/search?city=${city.slug}`)
    if (!html) {
      errors.push(`Home.bg ${city.name}: списъкът не се зареди`)
      continue
    }
    const urls = extractUrls(html)
    if (!urls.length) {
      errors.push(`Home.bg ${city.name}: няма обяви`)
      continue
    }
    const scraped = await mapPool(urls, 3, async url => {
      const page = await fetchHtml(url)
      if (!page) return null
      return parseGenericOfferPage(page, url, city, 'homebg', [/https:\/\/[^"'\s>]+\.(?:jpg|jpeg|webp)/gi])
    })
    listings.push(...scraped)
  }

  return { listings, errors }
}
