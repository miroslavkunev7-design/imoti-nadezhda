import { NextResponse } from 'next/server'
import { query, isDbConfigured } from '@/lib/db'
import { getMediaBaseUrl } from '@/lib/upload-bridge'

export const dynamic = 'force-dynamic'

export async function GET() {
  const dbConfigured = isDbConfigured()
  const mediaBase = getMediaBaseUrl()

  let dbOk = false
  let dbError: string | null = null
  let propertyCount = 0
  let totalPropertyCount = 0

  if (dbConfigured) {
    try {
      const [available, total] = await Promise.all([
        query<{ total: number }>(
          `SELECT COUNT(*) AS total FROM properties WHERE status = 'available'`
        ),
        query<{ total: number }>(
          `SELECT COUNT(*) AS total FROM properties`
        ),
      ])
      propertyCount = Number(available[0]?.total ?? 0)
      totalPropertyCount = Number(total[0]?.total ?? 0)
      dbOk = true
    } catch (e) {
      dbError = e instanceof Error ? e.message : 'DB connection failed'
    }
  } else {
    dbError = 'Използва се локален JSON store (DB_HOST не е зададен)'
  }

  return NextResponse.json({
    success: true,
    dbConfigured,
    uploadConfigured: true,
    cloudinaryConfigured: true,
    mediaBase: mediaBase || null,
    uploadUrl: 'https://api.cloudinary.com/v1_1/djh3tkfuu/image/upload',
    db: { ok: dbOk, propertyCount, totalPropertyCount, error: dbError },
    upload: { ok: true, detail: 'Cloudinary unsigned (djh3tkfuu / ml_default)', error: null },
    hints: [
      !dbConfigured &&
        'Няма DB_HOST — имотите се пазят в data/local-properties.json (работещ fallback).',
      !mediaBase &&
        'Добави NEXT_PUBLIC_SITE_URL за пълна URL резолюция на снимките.',
      dbOk && totalPropertyCount === 0 &&
        'Базата е празна — добави първи имот от Admin → Имоти → Добави',
      dbOk && totalPropertyCount > 0 && propertyCount === 0 &&
        `Има ${totalPropertyCount} имота, но 0 активни — одобри pending обяви от Admin → Имоти`,
    ].filter(Boolean),
  })
}
