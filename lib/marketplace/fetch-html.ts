export const FETCH_HEADERS: HeadersInit = {
  'User-Agent':
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
  Accept: 'text/html,application/xhtml+xml',
  'Accept-Language': 'bg-BG,bg;q=0.9,en;q=0.8',
}

export async function fetchHtml(url: string, timeoutMs = 12_000): Promise<string | null> {
  try {
    const res = await fetch(url, {
      headers: FETCH_HEADERS,
      next: { revalidate: 0 },
      signal: AbortSignal.timeout(timeoutMs),
    })
    if (!res.ok) return null
    return await res.text()
  } catch {
    return null
  }
}

export function parsePriceEur(text: string): number {
  const digits = text.replace(/[^\d.,]/g, '').replace(',', '.')
  const n = parseFloat(digits)
  return Number.isFinite(n) ? n : 0
}

export function parseAreaSqm(text: string): number | null {
  const m = text.match(/(\d+(?:[.,]\d+)?)\s*(?:кв\.?м|m²|sqm)/i)
  if (!m) return null
  const n = parseFloat(m[1].replace(',', '.'))
  return Number.isFinite(n) ? n : null
}

export function extractPhone(html: string): string {
  const tel = html.match(/href="tel:([^"]+)"/i)
  if (tel?.[1]) return tel[1].replace(/\s/g, '')
  const bg = html.match(/(?:\+359|0)\s*\d[\d\s]{7,12}/)
  return bg?.[0]?.replace(/\s/g, '') ?? ''
}

export async function mapPool<T, R>(
  items: T[],
  limit: number,
  fn: (item: T) => Promise<R | null>
): Promise<R[]> {
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
