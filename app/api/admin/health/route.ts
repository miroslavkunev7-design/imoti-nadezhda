import { NextResponse } from 'next/server'
import { isBridgeConfigured } from '@/lib/db-bridge'
import { query } from '@/lib/db'
import { getMediaBaseUrl } from '@/lib/upload-bridge'

export const dynamic = 'force-dynamic'

const CLOUDINARY_CLOUD = 'djh3tkfuu'
const CLOUDINARY_PRESET = 'ml_default'

export async function GET() {
  const bridgeConfigured = isBridgeConfigured()
  const mediaBase = getMediaBaseUrl()

  let dbOk = false
  let dbError: string | null = null
  let propertyCount = 0
  let totalPropertyCount = 0

  if (bridgeConfigured) {
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
      dbError = e instanceof Error ? e.message : 'DB bridge failed'
    }
  } else {
    dbError = 'DB_BRIDGE_URL или DB_BRIDGE_KEY липсват в Vercel'
  }

  const cloudinaryConfigured = true
  const uploadDetail = `Cloudinary unsigned (${CLOUDINARY_CLOUD} / ${CLOUDINARY_PRESET})`
  const linked = dbOk && cloudinaryConfigured

  return NextResponse.json({
    success: linked,
    bridgeConfigured,
    uploadConfigured: true,
    cloudinaryConfigured: true,
    mediaBase: mediaBase || null,
    uploadUrl: `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD}/image/upload`,
    db: { ok: dbOk, propertyCount, totalPropertyCount, error: dbError },
    upload: { ok: true, detail: uploadDetail, error: null },
    hints: [
      !bridgeConfigured &&
        'Vercel → Settings → Environment Variables → DB_BRIDGE_URL + DB_BRIDGE_KEY',
      linked && totalPropertyCount === 0 &&
        'Всичко е свързано. Базата е празна — добави първи имот от Admin → Имоти → Добави',
      linked && totalPropertyCount > 0 && propertyCount === 0 &&
        `Има ${totalPropertyCount} имота, но 0 активни — одобри pending обяви от Admin → Имоти`,
    ].filter(Boolean),
  })
}
