import { NextResponse } from 'next/server'
import { isBridgeConfigured } from '@/lib/db-bridge'
import { query } from '@/lib/db'
import { getMediaBaseUrl, getUploadBridgeUrl, isRemoteUploadConfigured } from '@/lib/upload-bridge'

export const dynamic = 'force-dynamic'

export async function GET() {
  const bridgeConfigured = isBridgeConfigured()
  const uploadConfigured = isRemoteUploadConfigured()
  const mediaBase = getMediaBaseUrl()
  const uploadUrl = getUploadBridgeUrl()

  let dbOk = false
  let dbError: string | null = null
  let propertyCount = 0

  if (bridgeConfigured) {
    try {
      const rows = await query<{ total: number }>(
        `SELECT COUNT(*) AS total FROM properties WHERE status = 'available'`
      )
      propertyCount = Number(rows[0]?.total ?? 0)
      dbOk = true
    } catch (e) {
      dbError = e instanceof Error ? e.message : 'DB bridge failed'
    }
  } else {
    dbError = 'DB_BRIDGE_URL или DB_BRIDGE_KEY липсват в Vercel'
  }

  let uploadReachable = false
  let uploadError: string | null = null

  if (uploadUrl) {
    try {
      const res = await fetch(uploadUrl, { method: 'GET', cache: 'no-store' })
      uploadReachable = res.status === 405 || res.status === 400 || res.status === 401
      if (!uploadReachable) uploadError = `upload.php отговори с ${res.status}`
    } catch (e) {
      uploadError = e instanceof Error ? e.message : 'upload.php недостъпен'
    }
  } else {
    uploadError = 'upload.php URL липсва (задай DB_BRIDGE_URL)'
  }

  return NextResponse.json({
    success: dbOk && uploadConfigured,
    bridgeConfigured,
    uploadConfigured,
    mediaBase: mediaBase || null,
    uploadUrl: uploadUrl || null,
    db: { ok: dbOk, propertyCount, error: dbError },
    upload: { ok: uploadReachable && uploadConfigured, error: uploadError },
    hints: [
      !bridgeConfigured && 'Vercel → Settings → Environment Variables → DB_BRIDGE_URL + DB_BRIDGE_KEY',
      !uploadConfigured && 'Качи upload.php в db-bridge/ на InfinityFree',
      !mediaBase && 'Добави NEXT_PUBLIC_MEDIA_URL или DB_BRIDGE_URL (за снимки)',
      dbOk && propertyCount === 0 && 'Базата е свързана, но няма обяви — добави имот от admin',
    ].filter(Boolean),
  })
}
