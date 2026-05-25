import { NextResponse } from 'next/server'
import { isBridgeConfigured } from '@/lib/db-bridge'
import { query } from '@/lib/db'
import { getMediaBaseUrl, isRemoteUploadConfigured } from '@/lib/upload-bridge'

export const dynamic = 'force-dynamic'

export async function GET() {
  const bridgeConfigured = isBridgeConfigured()
  const uploadConfigured = isRemoteUploadConfigured()
  const mediaBase = getMediaBaseUrl()
  const bridgeUrl = process.env.DB_BRIDGE_URL?.trim() ?? ''
  const bridgeKey = process.env.DB_BRIDGE_KEY?.trim() ?? ''

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

  if (bridgeUrl && bridgeKey) {
    try {
      // Send a 1-chunk upload with a tiny 1×1 transparent PNG (~68 bytes) — expects 200 OK with URL
      const tinyPng = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg=='
      const res = await fetch(bridgeUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          key: bridgeKey,
          action: 'upload_chunk',
          uploadId: `health-${Date.now()}`,
          chunkIndex: 0,
          totalChunks: 1,
          fileName: 'health.png',
          data: tinyPng,
        }),
        cache: 'no-store',
      })
      const text = await res.text()
      if (text.trimStart().startsWith('<')) {
        uploadReachable = false
        uploadError = 'api.php връща HTML (bot protection). Опитай пак след малко.'
      } else {
        const json = JSON.parse(text) as { success?: boolean; error?: string }
        uploadReachable = json.success === true
        if (!uploadReachable) uploadError = json.error ?? `api.php upload_chunk грешка (${res.status})`
      }
    } catch (e) {
      uploadError = e instanceof Error ? e.message : 'api.php upload недостъпен'
    }
  } else {
    uploadError = 'DB_BRIDGE_URL липсва (задай в Vercel)'
  }

  const linked = dbOk && uploadConfigured && uploadReachable

  return NextResponse.json({
    success: linked,
    bridgeConfigured,
    uploadConfigured,
    mediaBase: mediaBase || null,
    uploadUrl: bridgeUrl || null,
    db: { ok: dbOk, propertyCount, totalPropertyCount, error: dbError },
    upload: { ok: uploadReachable && uploadConfigured, error: uploadError },
    hints: [
      !bridgeConfigured &&
        'Vercel → Settings → Environment Variables → DB_BRIDGE_URL=https://imotinadezhda.infinityfree.me/db-bridge/api.php + DB_BRIDGE_KEY=imotinadejda2026',
      !uploadConfigured && 'Качи обновения api.php + config.php в db-bridge/ на InfinityFree',
      !mediaBase &&
        'Добави NEXT_PUBLIC_MEDIA_URL=https://imotinadezhda.infinityfree.me',
      bridgeConfigured &&
        bridgeUrl &&
        !bridgeUrl.includes('imotinadezhda.infinityfree.me') &&
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
