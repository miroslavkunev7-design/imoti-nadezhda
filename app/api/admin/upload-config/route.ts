import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

/**
 * Returns upload configuration at runtime — no rebuild needed.
 * Supports env var naming with or without NEXT_PUBLIC_ prefix.
 * Also parses CLOUDINARY_URL = cloudinary://key:secret@cloud_name
 */
export async function GET() {
  // Try all common naming conventions
  const cloudName = (
    process.env.CLOUDINARY_CLOUD_NAME ??
    process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME ??
    extractCloudNameFromUrl(process.env.CLOUDINARY_URL) ??
    ''
  ).trim()

  const uploadPreset = (
    process.env.CLOUDINARY_UPLOAD_PRESET ??
    process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET ??
    ''
  ).trim()

  if (cloudName && uploadPreset) {
    return NextResponse.json({ provider: 'cloudinary', cloudName, uploadPreset })
  }

  return NextResponse.json({ provider: 'bridge' })
}

function extractCloudNameFromUrl(url?: string): string | null {
  if (!url) return null
  try {
    const u = new URL(url)
    return u.hostname || null
  } catch {
    return null
  }
}
