import { NextResponse } from 'next/server'
import crypto from 'crypto'

export const dynamic = 'force-dynamic'

export async function GET() {
  const cloudName = (
    process.env.CLOUDINARY_CLOUD_NAME ??
    process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME ?? ''
  ).trim()
  const apiKey = (process.env.CLOUDINARY_API_KEY ?? '').trim()
  const apiSecret = (process.env.CLOUDINARY_API_SECRET ?? '').trim()

  if (!cloudName || !apiKey || !apiSecret) {
    return NextResponse.json({ configured: false }, { status: 200 })
  }

  const timestamp = Math.floor(Date.now() / 1000).toString()

  // Signature = SHA1("timestamp=VALUE" + api_secret)
  // Keeping params minimal to avoid encoding issues
  const toSign = `timestamp=${timestamp}${apiSecret}`
  const signature = crypto.createHash('sha1').update(toSign).digest('hex')

  return NextResponse.json({
    configured: true,
    cloudName,
    apiKey,
    timestamp,
    signature,
  })
}
