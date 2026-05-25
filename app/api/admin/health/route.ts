import { NextResponse } from 'next/server'
import { isBridgeConfigured } from '@/lib/db-bridge'
import { query } from '@/lib/db'
import { getMediaBaseUrl, getUploadBridgeUrl, isRemoteUploadConfigured } from '@/lib/upload-bridge'

export const dynamic = 'force-dynamic'

function isUploadEndpointReachable(status: number): boolean {
  return status === 401 || status === 400 || status === 405 || status === 200
}

export async function GET() {
  const bridgeConfigured = isBridgeConfigured()
  const uploadConfigured = isRemoteUploadConfigured()
  const mediaBase = getMediaBaseUrl()
  const uploadUrl = getUploadBridgeUrl()

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

  let uploadReachable = false
  let uploadError: string | null = null

  if (uploadUrl) {
    try {
      const res = await fetch(uploadUrl, { method: 'GET', cache: 'no-store' })
      uploadReachable = isUploadEndpointReachable(res.status)
      if (!uploadReachable) {
        uploadError = `upload.php отговори с ${res.status} (очаква се 401/400/405)`
      }
    } catch (e) {
      uploadError = e instanceof Error ? e.message : 'upload.php недостъпен'
    }
  } else {
    uploadError = 'upload.php URL липсва (задай DB_BRIDGE_URL)'
  }

  const linked = dbOk && uploadConfigured && uploadReachable

  return NextResponse.json({
    success: linked,
    bridgeConfigured,
    uploadConfigured,
    mediaBase: mediaBase || null,
    uploadUrl: uploadUrl || null,
    db: { ok: dbOk, propertyCount, totalPropertyCount, error: dbError },
    upload: { ok: uploadReachable && uploadConfigured, error: uploadError },
    hints: [
      !bridgeConfigured &&
        'Vercel → Settings → Environment Variables → DB_BRIDGE_URL=https://imotinadezhda.infinityfree.me/db-bridge/api.php + DB_BRIDGE_KEY=imotinadejda2026',
      !uploadConfigured && 'Качи upload.php + config.php в db-bridge/ на InfinityFree',
      !mediaBase &&
        'Добави NEXT_PUBLIC_MEDIA_URL=https://imotinadezhda.infinityfree.me',
      bridgeConfigured &&
        uploadUrl &&
        !uploadUrl.includes('imotinadezhda.infinityfree.me') &&
        'DB_BRIDGE_URL изглежда с грешен домейн — използвай imotinadezhda.infinityfree.me',
      linked &&
        totalPropertyCount === 0 &&
        'Връзката работи. Базата е празна — добави първи имот от Admin → Имоти → Добави',
      linked &&
        totalPropertyCount > 0 &&
        propertyCount === 0 &&
        `Има ${totalPropertyCount} имота, но 0 активни — одобри pending обяви от Admin → Имоти`,
    ].filter(Boolean),
  })
}
