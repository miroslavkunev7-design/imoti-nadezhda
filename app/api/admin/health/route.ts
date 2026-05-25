import { NextResponse } from 'next/server'
import { isBridgeConfigured } from '@/lib/db-bridge'
import { query, isDbConfigured } from '@/lib/db'
import { getMediaBaseUrl } from '@/lib/upload-bridge'

export const dynamic = 'force-dynamic'

export async function GET() {
  const bridgeConfigured = isBridgeConfigured()
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
    dbError = 'DB_BRIDGE_URL/DB_BRIDGE_KEY или DB_HOST не са зададени в Vercel'
  }

  return NextResponse.json({
    success: dbOk,
    bridgeConfigured,
    dbConfigured,
    uploadConfigured: true,
    cloudinaryConfigured: true,
    mediaBase: mediaBase || 'https://res.cloudinary.com/djh3tkfuu',
    uploadUrl: 'https://api.cloudinary.com/v1_1/djh3tkfuu/image/upload',
    db: { ok: dbOk, propertyCount, totalPropertyCount, error: dbError },
    upload: { ok: true, detail: 'Cloudinary (djh3tkfuu / ml_default)', error: null },
    hints: [
      !bridgeConfigured && !process.env.DB_HOST &&
        'Добави DB_BRIDGE_URL + DB_BRIDGE_KEY в Vercel (виж scripts/sync-vercel-env.ps1)',
      dbOk && totalPropertyCount === 0 &&
        'Базата е празна — добави първи имот от Admin → Имоти → Добави',
    ].filter(Boolean),
  })
}
