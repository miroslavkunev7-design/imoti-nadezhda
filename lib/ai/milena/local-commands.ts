import { isDbConfigured, queryOne, execute } from '@/lib/db'
import type { SessionUser } from '@/lib/auth/session'
import type { MilenaReply } from '@/lib/ai/milena/run'

function extractPrices(text: string): number[] {
  const normalized = text.replace(/\s/g, '').replace(/,/g, '.')
  const nums: number[] = []
  for (const m of normalized.matchAll(/(\d{4,7})(?:\.\d+)?/g)) {
    const n = parseInt(m[1].replace(/\./g, ''), 10)
    if (n >= 10_000 && n <= 50_000_000) nums.push(n)
  }
  return nums
}

function parsePropertyId(text: string): number | null {
  const m =
    text.match(/(?:имот|обява|property)\s*#?\s*(\d{1,6})/i) ?? text.match(/#(\d{1,6})/)
  if (!m) return null
  const id = parseInt(m[1], 10)
  return Number.isFinite(id) ? id : null
}

async function findPropertyByPriceHint(hint: number): Promise<{ id: number; title: string; price: number } | null> {
  if (!isDbConfigured()) {
    const { listLocalProperties } = await import('@/lib/local-store/properties')
    const all = await listLocalProperties()
    const hit = all.find(p => Math.abs(Number(p.price) - hint) < 8000)
    return hit
      ? { id: hit.id, title: hit.title, price: Number(hit.price) }
      : all[0]
        ? { id: all[0].id, title: all[0].title, price: Number(all[0].price) }
        : null
  }
  const row = await queryOne<{ id: number; title: string; price: number }>(
    `SELECT id, title, price FROM properties
     WHERE ABS(price - ?) < 8000 AND status != 'archived'
     ORDER BY id DESC LIMIT 1`,
    [hint]
  )
  if (row) return row
  return queryOne<{ id: number; title: string; price: number }>(
    `SELECT id, title, price FROM properties WHERE status != 'archived' ORDER BY id DESC LIMIT 1`
  )
}

async function updatePropertyPrice(propertyId: number, newPrice: number): Promise<MilenaReply> {
  if (!isDbConfigured()) {
    const { getLocalProperty, listLocalProperties } = await import('@/lib/local-store/properties')
    const { writeFile } = await import('fs/promises')
    const path = await import('path')
    const p = await getLocalProperty(propertyId)
    if (!p) return { ok: false, message: `Не намерих имот #${propertyId}.` }
    const file = path.join(process.cwd(), 'data', 'local-properties.json')
    const all = await listLocalProperties()
    const next = all.map(item =>
      item.id === propertyId
        ? { ...item, price: newPrice, updated_at: new Date().toISOString() }
        : item
    )
    await writeFile(file, JSON.stringify(next, null, 2), 'utf-8')
    return {
      ok: true,
      message: `Обнових цената на "${p.title}" на ${newPrice.toLocaleString('bg-BG')} EUR.`,
      data: { propertyId, price: newPrice },
    }
  }

  const row = await queryOne<{ id: number; title: string; price: number }>(
    `SELECT id, title, price FROM properties WHERE id = ?`,
    [propertyId]
  )
  if (!row) return { ok: false, message: `Не намерих имот #${propertyId}.` }

  await execute(`UPDATE properties SET price = ?, updated_at = NOW() WHERE id = ?`, [newPrice, propertyId])

  return {
    ok: true,
    message: `Готово — "${row.title}" (#${propertyId}): ${Number(row.price).toLocaleString('bg-BG')} EUR => ${newPrice.toLocaleString('bg-BG')} EUR.`,
    data: { propertyId, oldPrice: row.price, newPrice },
  }
}

/**
 * Fallback layer when no OpenAI key is configured.
 * Handles greetings, property listing, and price changes in natural Bulgarian.
 */
export async function runLocalMilenaBackup(
  text: string,
  _session: SessionUser
): Promise<MilenaReply | null> {
  const t = text.toLowerCase()

  // Greetings / small talk
  if (/^(здравей|здрасти|привет|хей|как\s+си|добър|добро)/i.test(t)) {
    return {
      ok: true,
      message:
        'Здравейте! Аз съм Милена. Работя в офлайн режим (без OpenAI ключ). Мога да помогна с промяна на цени и да покажа имоти. За пълни AI функции добавете OpenAI ключ в Настройки -> Милена AI.',
    }
  }

  // Help
  if (/помощ|какво\s+мож|какви\s+функ|списък/i.test(t)) {
    return {
      ok: true,
      message:
        'Работя без AI ключ (офлайн). Мога:\n- Промяна на цена: "имот #3 цена 85000" или "смени цената на 85000"\n- Показване на имоти: "покажи имоти"\n\nЗа пълни AI функции добавете OpenAI ключ в Настройки -> Милена AI.',
    }
  }

  // List properties
  if (/имоти|обяви|покажи.*имот/i.test(t) && !/цена|намали|промени|смени|увеличи|редактира/i.test(t)) {
    if (!isDbConfigured()) {
      const { listLocalProperties } = await import('@/lib/local-store/properties')
      const all = await listLocalProperties()
      if (!all.length) return { ok: true, message: 'Няма добавени имоти.' }
      const list = all
        .slice(0, 10)
        .map(p => `#${p.id} "${p.title}" - ${Number(p.price).toLocaleString('bg-BG')} EUR`)
        .join('\n')
      return { ok: true, message: `Имоти (${all.length}):\n${list}` }
    }
    const { query } = await import('@/lib/db')
    const rows = await query<{ id: number; title: string; price: number }>(
      `SELECT id, title, price FROM properties WHERE status != 'archived' ORDER BY id DESC LIMIT 10`
    )
    if (!rows.length) return { ok: true, message: 'Няма активни имоти.' }
    const list = rows
      .map(p => `#${p.id} "${p.title}" - ${Number(p.price).toLocaleString('bg-BG')} EUR`)
      .join('\n')
    return { ok: true, message: `Активни имоти:\n${list}` }
  }

  // Price change
  const priceWords = /цен|намали|увеличи|редактира|промени|сложи|смени/i
  if (!priceWords.test(t)) return null

  const prices = extractPrices(text)
  if (!prices.length) return null

  const newPrice = prices[prices.length - 1]
  const oldHint = prices.length >= 2 ? prices[prices.length - 2] : prices[0]

  let propertyId = parsePropertyId(text)
  if (!propertyId) {
    const found = await findPropertyByPriceHint(oldHint)
    if (!found) return null
    propertyId = found.id
  }

  return updatePropertyPrice(propertyId, newPrice)
}
