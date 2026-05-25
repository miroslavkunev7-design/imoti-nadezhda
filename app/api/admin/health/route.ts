import { NextResponse } from 'next/server'
import { isBridgeConfigured } from '@/lib/db-bridge'
import { query } from '@/lib/db'
import { getMediaBaseUrl } from '@/lib/upload-bridge'

export const dynamic = 'force-dynamic'

export async function GET() {
  const bridgeConfigured = isBridgeConfigured()
  const mediaBase = getMediaBaseUrl()
  const bridgeUrl = process.env.DB_BRIDGE_URL?.trim() ?? ''

  // Cloudinary — check all naming variants
  const cloudName = [
    process.env.CLOUDINARY_CLOUD_NAME,
    process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
    process.env.CLOUDINARY_NAME,
    process.env.CLOUD_NAME,
  ].map(v => (v ?? '').trim()).find(Boolean) ?? ''

  const cloudPreset = [
    process.env.CLOUDINARY_UPLOAD_PRESET,
    process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET,
    process.env.CLOUDINARY_PRESET,
    process.env.UPLOAD_PRESET,
  ].map(v => (v ?? '').trim()).find(Boolean) ?? ''

  const apiKey    = (process.env.CLOUDINARY_API_KEY ?? '').trim()
  const apiSecret = (process.env.CLOUDINARY_API_SECRET ?? '').trim()
  const cloudinaryConfigured = Boolean(cloudName && (cloudPreset || (apiKey && apiSecret)))

  // Which Cloudinary-related env vars ARE present (names only — for diagnostics)
  const cloudEnvFound = Object.keys(process.env)
    .filter(k => k.toLowerCase().includes('cloud') || k.toLowerCase().includes('preset'))
    .sort()

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

  const uploadOk = cloudinaryConfigured
  const uploadMode = apiKey && apiSecret ? 'signed' : 'unsigned'
  const uploadDetail = cloudinaryConfigured
    ? `Cloudinary ${uploadMode} (${cloudName})`
    : `Не е конфигуриран. Намерени: ${cloudEnvFound.join(', ') || 'няма'}`
  const uploadError = cloudinaryConfigured ? null
    : cloudEnvFound.length
      ? `Намерени: ${cloudEnvFound.join(', ')} — добави CLOUDINARY_API_SECRET`
      : 'Добави CLOUDINARY_CLOUD_NAME + CLOUDINARY_API_KEY + CLOUDINARY_API_SECRET в Vercel'

  const linked = dbOk && uploadOk

  return NextResponse.json({
    success: linked,
    bridgeConfigured,
    uploadConfigured: cloudinaryConfigured,
    cloudinaryConfigured,
    mediaBase: mediaBase || null,
    uploadUrl: cloudinaryConfigured ? `https://api.cloudinary.com/v1_1/${cloudName}/image/upload` : (bridgeUrl || null),
    db: { ok: dbOk, propertyCount, totalPropertyCount, error: dbError },
    upload: { ok: uploadOk, detail: uploadDetail, error: uploadError },
    cloudEnvFound,
    hints: [
      !bridgeConfigured &&
        'Vercel → Settings → Environment Variables → DB_BRIDGE_URL + DB_BRIDGE_KEY',
      !cloudinaryConfigured &&
        (cloudEnvFound.length
          ? `Намерени: ${cloudEnvFound.join(', ')} — добави CLOUDINARY_UPLOAD_PRESET`
          : 'Добави CLOUDINARY_CLOUD_NAME и CLOUDINARY_UPLOAD_PRESET в Vercel'),
      !mediaBase && !cloudinaryConfigured &&
        'Добави NEXT_PUBLIC_MEDIA_URL=https://imotinadezhda.infinityfree.me',
      linked && totalPropertyCount === 0 &&
        'Всичко е свързано. Базата е празна — добави първи имот от Admin → Имоти → Добави',
      linked && totalPropertyCount > 0 && propertyCount === 0 &&
        `Има ${totalPropertyCount} имота, но 0 активни — одобри pending обяви от Admin → Имоти`,
    ].filter(Boolean),
  })
}
