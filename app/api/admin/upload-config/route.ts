import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function GET() {
  const cloudName = firstDefined([
    process.env.CLOUDINARY_CLOUD_NAME,
    process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
    process.env.CLOUDINARY_NAME,
    process.env.CLOUD_NAME,
    extractFromUrl(process.env.CLOUDINARY_URL),
  ])

  const apiKey    = (process.env.CLOUDINARY_API_KEY ?? '').trim()
  const apiSecret = (process.env.CLOUDINARY_API_SECRET ?? '').trim()

  const uploadPreset = firstDefined([
    process.env.CLOUDINARY_UPLOAD_PRESET,
    process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET,
    process.env.CLOUDINARY_PRESET,
    process.env.UPLOAD_PRESET,
  ])

  // Signed upload: cloud name + API key + secret (most secure, no preset needed)
  if (cloudName && apiKey && apiSecret) {
    return NextResponse.json({ provider: 'cloudinary-signed', cloudName })
  }

  // Unsigned upload: cloud name + preset
  if (cloudName && uploadPreset) {
    return NextResponse.json({ provider: 'cloudinary', cloudName, uploadPreset })
  }

  const setVars = Object.keys(process.env)
    .filter(k => k.toLowerCase().includes('cloud') || k.toLowerCase().includes('preset'))
    .sort()

  return NextResponse.json({
    provider: 'bridge',
    _found: setVars,
    _missing: 'CLOUDINARY_CLOUD_NAME + CLOUDINARY_API_KEY + CLOUDINARY_API_SECRET',
  })
}

function firstDefined(values: (string | null | undefined)[]): string {
  for (const v of values) { const s = (v ?? '').trim(); if (s) return s }
  return ''
}

function extractFromUrl(url?: string): string | null {
  if (!url) return null
  try { return new URL(url).hostname || null } catch { return null }
}
