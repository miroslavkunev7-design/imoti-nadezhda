import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

function extractCloudNameFromUrl(url?: string): string | null {
  if (!url) return null
  const m = url.match(/cloudinary:\/\/[^@]+@([^/?]+)/i)
  if (m?.[1]) return m[1]
  try {
    const u = new URL(url)
    if (u.hostname.includes('cloudinary')) return u.hostname.split('.')[0] || null
  } catch { /* ignore */ }
  return null
}

export async function GET() {
  const cloudName = (
    process.env.CLOUDINARY_CLOUD_NAME ??
    process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME ??
    extractCloudNameFromUrl(process.env.CLOUDINARY_URL) ??
    ''
  ).trim()

  const uploadPreset = (
    process.env.CLOUDINARY_UPLOAD_PRESET ??
    process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET ??
    process.env.CLOUDINARY_UNSIGNED_PRESET ??
    ''
  ).trim()

  if (cloudName && uploadPreset) {
    return NextResponse.json({ provider: 'cloudinary', cloudName, uploadPreset })
  }

  return NextResponse.json({ provider: 'bridge' })
}
