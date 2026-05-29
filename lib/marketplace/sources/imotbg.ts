import { MARKETPLACE_CITIES } from '@/lib/marketplace/districts'
import type { ScrapedListing } from '@/lib/marketplace/types'
import { fetchHtml, mapPool } from '@/lib/marketplace/fetch-html'
import { parseGenericOfferPage } from '@/lib/marketplace/sources/generic-parse'

const BASE = 'https://www.imoti.bg'
const MAX_PER_CITY = 12

const CITY_QUERY: Record<string, string> = {
  shumen: 'shumen',
  varna: 'varna',
  burgas: 'burgas',
  'novi-pazar': 'novi-pazar',
}

function extractUrls(html: string): string[] {
  const urls = new Set<string>()
  const patterns = [
    /href="(\/obiava\/[^"]+)"/gi,
    /href="(\/offer\/[^"]+)"/gi,
    /href="(\/sale\/[^"]+)"/gi,
    /href="(https:\/\/www\.imoti\.bg\/[^"]+(?:obiava|offer|sale)[^"]+)"/gi,
    /"url"\s*:\s*"(https:\/\/www\.imoti\.bg\/[^"]+)"/gi,
  ]
  for (const re of patterns) {
    let m: RegExpExecArray | null
    while ((m = re.exec(html))) {
      const u = m[1].startsWith('http') ? m[1] : `${BASE}${m[1]}`
      urls.add(u.split('?')[0])
    }
  }
  return [...urls].slice(0, MAX_PER_CITY)
}

export async function syncImotBgMarketplace(): Promise<{
  listings: ScrapedListing[]
  errors: string[]
}> {
  const listings: ScrapedListing[] = []
  const errors: string[] = []

  for (const city of MARKETPLACE_CITIES) {
    const q = CITY_QUERY[city.slug] ?? city.slug
    const tryUrls = [
      `${BASE}/prodazhbi-imoti/${q}/?from_private=1`,
      `${BASE}/prodazhbi-imoti/${q}/`,
      `${BASE}/search?city=${q}&private=1`,
      `${BASE}/obiavi/prodava/${q}/`,
      `${BASE}/obiavi/${q}/prodava/`,
    ]
    let html: string | null = null
    for (const u of tryUrls) {
      html = await fetchHtml(u)
      if (html) break
    }
    if (!html) {
      errors.push(`Imoti.bg ${city.name}: списъкът не се зареди`)
      continue
    }
    const urls = extractUrls(html)
    if (!urls.length) {
      errors.push(`Imoti.bg ${city.name}: няма обяви`)
      continue
    }
    const scraped = await mapPool(urls, 4, async url => {
      const page = await fetchHtml(url)
      if (!page) return null
      return parseGenericOfferPage(page, url, city, 'imotibg', [
        /https:\/\/[^"'\s>]*imoti[^"'\s>]*\.(?:jpg|jpeg|webp)/gi,
      ])
    })
    listings.push(...scraped)
  }

  return { listings, errors }
}
