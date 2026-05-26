import { NextRequest, NextResponse } from 'next/server'
import { execute, isDbConfigured } from '@/lib/db'
import { toHostClientStatus } from '@/lib/db/mappers'
import { createLocalClient } from '@/lib/local-store/clients'
import { getSession } from '@/lib/auth/session'

function parseId(raw: unknown): number {
  const n = Number(raw)
  return Number.isFinite(n) && n > 0 ? n : 0
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
    const budget_min = body.budget_min
    const budget_max = body.budget_max

    if (!name) {
      return NextResponse.json({ success: false, error: 'Името е задължително' }, { status: 400 })
    }
    if (!email) {
      return NextResponse.json({ success: false, error: 'Имейлът е задължителен' }, { status: 400 })
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
          `INSERT INTO crm_clients (name, email, phone, status, budget_min, budget_max, source)
           VALUES (?, ?, ?, ?, ?, ?, ?)`,
          [name, email, phone || null, toHostClientStatus('lead'), budgetMinVal, budgetMaxVal, source]
        )
        const id = parseId(result.insertId)
        if (id) {
          return NextResponse.json({ success: true, id })
        }
      } catch (dbErr) {
        console.error('[POST /api/admin/clients] DB with source', dbErr)
        const msg = dbErr instanceof Error ? dbErr.message : ''
        if (/source|column/i.test(msg)) {
          try {
            const result = await execute(
              `INSERT INTO crm_clients (name, email, phone, status, budget_min, budget_max)
               VALUES (?, ?, ?, ?, ?, ?)`,
              [name, email, phone || null, toHostClientStatus('lead'), budgetMinVal, budgetMaxVal]
            )
            const id = parseId(result.insertId)
            if (id) {
              return NextResponse.json({ success: true, id })
            }
          } catch (retryErr) {
            console.error('[POST /api/admin/clients] DB retry', retryErr)
          }
        }
      }
    }

    try {
      const record = await createLocalClient({
        name,
        email,
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
            ? 'Базата данни не прие записа. Проверете Supabase връзката.'
            : 'Локалното записване не успя (на сървъра е нужна база данни).',
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
