import { MARKETPLACE_CITIES } from '@/lib/marketplace/districts'
import type { ScrapedListing } from '@/lib/marketplace/types'
import { fetchHtml, mapPool } from '@/lib/marketplace/fetch-html'
import { parseGenericOfferPage } from '@/lib/marketplace/sources/generic-parse'

const BASE = 'https://www.olx.bg'
const MAX_PER_CITY = 12

const CITY_PATH: Record<string, string> = {
  shumen: 'shumen',
  varna: 'varna',
  burgas: 'burgas',
  'novi-pazar': 'shumen',
}

function extractOlxUrls(html: string): string[] {
  const urls = new Set<string>()
  const patterns = [
    /href="(\/ad\/[^"]+?ID[^"]+)"/gi,
    /href="(\/ad\/nedvizhimi-imoti\/[^"]+)"/gi,
    /"url"\s*:\s*"(https:\/\/www\.olx\.bg\/ad\/[^"]+)"/gi,
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

export async function syncOlxMarketplace(): Promise<{
  listings: ScrapedListing[]
  errors: string[]
}> {
  const listings: ScrapedListing[] = []
  const errors: string[] = []

  for (const city of MARKETPLACE_CITIES) {
    const path = CITY_PATH[city.slug] ?? city.slug
    const listUrl = `${BASE}/nedvizhimi-imoti/prodazhbi-nedvizhimi-imoti/${path}/?search%5Bprivate_business%5D=private`
    const html = await fetchHtml(listUrl)
    if (!html) {
      errors.push(`OLX ${city.name}: списъкът не се зареди`)
      continue
    }
    const urls = extractOlxUrls(html)
    if (!urls.length) {
      errors.push(`OLX ${city.name}: няма обяви`)
      continue
    }
    const scraped = await mapPool(urls, 4, async url => {
      const page = await fetchHtml(url)
      if (!page) return null
      return parseGenericOfferPage(page, url, city, 'olx', [
        /https:\/\/[^"'\s>]+\.(?:jpg|jpeg|webp)/gi,
      ])
    })
    listings.push(...scraped)
  }

  return { listings, errors }
}
