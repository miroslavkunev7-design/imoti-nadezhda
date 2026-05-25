import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function GET() {
  return NextResponse.json({
    provider: 'cloudinary',
    mode: 'unsigned',
    cloudName: 'djh3tkfuu',
    uploadPreset: 'ml_default',
    uploadUrl: 'https://api.cloudinary.com/v1_1/djh3tkfuu/image/upload',
  })
}
