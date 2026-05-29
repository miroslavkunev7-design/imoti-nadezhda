import { NextRequest, NextResponse } from 'next/server'
import { execute, isDbConfigured, query } from '@/lib/db'
import { toHostClientStatus } from '@/lib/db/mappers'
import { createLocalClient } from '@/lib/local-store/clients'
import { getSession } from '@/lib/auth/session'

function parseId(raw: unknown): number {
  const n = Number(raw)
  return Number.isFinite(n) && n > 0 ? n : 0
}

export async function GET(req: NextRequest) {
  const session = await getSession()
  if (!session) return NextResponse.json({ success: false, error: 'Неоторизиран' }, { status: 401 })

  const { searchParams } = new URL(req.url)
  const matchCity = searchParams.get('match_city')
  const matchType = searchParams.get('match_type')
  const matchBudgetMin = searchParams.get('match_budget_min')
  const matchBudgetMax = searchParams.get('match_budget_max')
  const matchDistrict = searchParams.get('match_district')

  if (matchCity || matchType || matchBudgetMin) {
    if (!isDbConfigured()) return NextResponse.json({ matches: [] })
    const budget = Number(matchBudgetMin) || 0
    const budgetMax = Number(matchBudgetMax) || budget * 1.3
    const margin = 30000

    const rows = await query<{
      id: number; title: string; price: number; city: string; quarter: string; property_type: string
    }>(
      `SELECT id, title, price, city, quarter, property_type
       FROM properties
       WHERE status != 'archived'
         AND (? = '' OR LOWER(city) LIKE LOWER(?))
         AND (? = '' OR LOWER(property_type) = LOWER(?))
         AND (? = 0 OR price BETWEEN ? AND ?)
       ORDER BY id DESC LIMIT 5`,
      [
        matchCity ?? '', `%${matchCity ?? ''}%`,
        matchType ?? '', matchType ?? '',
        budget, Math.max(0, budget - margin), budgetMax + margin,
      ]
    )
    return NextResponse.json({ matches: rows })
  }

  return NextResponse.json({ success: false, error: 'Използвайте POST за добавяне' }, { status: 405 })
}

export async function POST(req: NextRequest) {
  const session = await getSession()
  if (!session) {
    return NextResponse.json({ success: false, error: 'Неоторизиран достъп' }, { status: 401 })
  }

  try {
    const body = await req.json()
    const name = String(body.name ?? '').trim()
    const email = String(body.email ?? '').trim()
    const phone = String(body.phone ?? '').trim()
    const source = String(body.source ?? 'website').trim() || 'website'
    const city = String(body.city ?? '').trim()
    const property_type = String(body.property_type ?? '').trim()
    const search_description = String(body.search_description ?? '').trim()
    const budget_min = body.budget_min
    const budget_max = body.budget_max

    if (!name) {
      return NextResponse.json({ success: false, error: 'Името е задължително' }, { status: 400 })
    }

    const budgetMinVal =
      budget_min !== '' && budget_min != null && !Number.isNaN(Number(budget_min))
        ? Number(budget_min)
        : null
    const budgetMaxVal =
      budget_max !== '' && budget_max != null && !Number.isNaN(Number(budget_max))
        ? Number(budget_max)
        : null

    if (isDbConfigured()) {
      try {
        const result = await execute(
          `INSERT INTO crm_clients
            (name, email, phone, status, budget_min, budget_max, source, city, property_type, search_description)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            name,
            email || null,
            phone || null,
            toHostClientStatus('lead'),
            budgetMinVal,
            budgetMaxVal,
            source,
            city || null,
            property_type || null,
            search_description || null,
          ]
        )
        const id = parseId(result.insertId)
        if (id) {
          return NextResponse.json({ success: true, id })
        }
      } catch (dbErr) {
        console.error('[POST /api/admin/clients] DB', dbErr)
        const msg = dbErr instanceof Error ? dbErr.message : ''
        if (/column|field/i.test(msg)) {
          try {
            const result = await execute(
              `INSERT INTO crm_clients (name, email, phone, status, budget_min, budget_max, source)
               VALUES (?, ?, ?, ?, ?, ?, ?)`,
              [name, email || null, phone || null, toHostClientStatus('lead'), budgetMinVal, budgetMaxVal, source]
            )
            const id = parseId(result.insertId)
            if (id) return NextResponse.json({ success: true, id })
          } catch (retryErr) {
            console.error('[POST /api/admin/clients] DB retry', retryErr)
          }
        }
      }
    }

    try {
      const record = await createLocalClient({
        name,
        email: email || '',
        phone: phone || '',
        source,
        status: 'lead',
        budget_min: budgetMinVal ?? 0,
        budget_max: budgetMaxVal ?? 0,
      })
      return NextResponse.json({ success: true, id: record.id, local: true })
    } catch (localErr) {
      console.error('[POST /api/admin/clients] local', localErr)
      return NextResponse.json(
        {
          success: false,
          error: isDbConfigured()
            ? 'Базата данни не прие записа.'
            : 'Локалното записване не успя.',
        },
        { status: 500 }
      )
    }
  } catch (error) {
    console.error('[POST /api/admin/clients]', error)
    return NextResponse.json(
      { success: false, error: 'Грешка при запазване. Опитайте отново.' },
      { status: 500 }
    )
  }
}
