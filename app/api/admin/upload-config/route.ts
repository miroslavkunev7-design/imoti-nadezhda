import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

/**
 * Returns Cloudinary upload config from server-side env vars — no rebuild needed.
 * Checks every common naming variant.
 */
export async function GET() {
  const cloudName = firstDefined([
    process.env.CLOUDINARY_CLOUD_NAME,
    process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
    process.env.CLOUDINARY_NAME,
    process.env.CLOUD_NAME,
    extractFromUrl(process.env.CLOUDINARY_URL),
  ])

  const uploadPreset = firstDefined([
    process.env.CLOUDINARY_UPLOAD_PRESET,
    process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET,
    process.env.CLOUDINARY_PRESET,
    process.env.UPLOAD_PRESET,
  ])

  // Diagnostic — list which Cloudinary-related env var NAMES are set (not values)
  const setVars = Object.keys(process.env)
    .filter(k => k.toLowerCase().includes('cloud') || k.toLowerCase().includes('preset'))
    .sort()

  if (cloudName && uploadPreset) {
    return NextResponse.json({
      provider: 'cloudinary',
      cloudName,
      uploadPreset,
      _debug: setVars,
    })
  }

  return NextResponse.json({
    provider: 'bridge',
    _missing: {
      needCloudName:   'CLOUDINARY_CLOUD_NAME or NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME',
      needUploadPreset:'CLOUDINARY_UPLOAD_PRESET or NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET',
    },
    _found: setVars,
  })
}

function firstDefined(values: (string | null | undefined)[]): string {
  for (const v of values) {
    const s = (v ?? '').trim()
    if (s) return s
  }
  return ''
}

function extractFromUrl(url?: string): string | null {
  if (!url) return null
  try { return new URL(url).hostname || null } catch { return null }
}
