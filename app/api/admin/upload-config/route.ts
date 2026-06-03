import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function GET() {
  const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || 'djh3tkfuu'
  const uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET || 'ml_default'

  return NextResponse.json({
    provider: 'cloudinary',
    mode: 'unsigned',
    cloudName,
    uploadPreset,
    uploadUrl: `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
  })
}
