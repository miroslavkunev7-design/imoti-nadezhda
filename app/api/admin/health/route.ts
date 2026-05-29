import { NextResponse } from 'next/server'
import { query, isDbConfigured } from '@/lib/db'
import { getMediaBaseUrl } from '@/lib/upload-bridge'
import { getSupabaseUrl, isSupabaseConfigured } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'

export async function GET() {
  const dbConfigured = isDbConfigured()
  const supabaseConfigured = isSupabaseConfigured()
  const mediaBase = getMediaBaseUrl()

  let dbOk = false
  let dbError: string | null = null
  let propertyCount = 0
  let totalPropertyCount = 0
  let cityCount = 0

  if (dbConfigured) {
    try {
      const [available, total, cities] = await Promise.all([
        query<{ total: number }>(
          `SELECT COUNT(*) AS total FROM properties WHERE status = 'available'`
        ),
        query<{ total: number }>(`SELECT COUNT(*) AS total FROM properties`),
        query<{ total: number }>(`SELECT COUNT(*) AS total FROM cities`),
      ])
      propertyCount = Number(available[0]?.total ?? 0)
      totalPropertyCount = Number(total[0]?.total ?? 0)
      cityCount = Number(cities[0]?.total ?? 0)
      dbOk = true
    } catch (e) {
      dbError = e instanceof Error ? e.message : 'DB connection failed'
    }
  } else {
    dbError = 'POSTGRES_URL или DATABASE_URL не е зададен в Vercel'
  }

  const { milenaLlmAvailable } = await import('@/lib/ai/milena/provider')
  const milenaAi = await milenaLlmAvailable()

  return NextResponse.json({
    success: dbOk,
    milenaAi,
    supabaseConfigured,
    supabaseUrl: getSupabaseUrl() || null,
    dbConfigured,
    uploadConfigured: true,
    cloudinaryConfigured: true,
    mediaBase,
    uploadUrl: 'https://api.cloudinary.com/v1_1/djh3tkfuu/image/upload',
    db: { ok: dbOk, propertyCount, totalPropertyCount, cityCount, error: dbError },
    upload: { ok: true, detail: 'Cloudinary (djh3tkfuu / ml_default)', error: null },
    hints: [
      !dbConfigured &&
        'Свържи Supabase с Vercel (Storage → Connect) или добави POSTGRES_URL',
      dbOk && totalPropertyCount === 0 &&
        'Базата е празна — добави първи имот от Admin → Имоти → Добави',
    ].filter(Boolean),
  })
}
