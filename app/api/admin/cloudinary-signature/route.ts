import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function GET() {
  return NextResponse.json({
    configured: true,
    mode: 'unsigned',
    cloudName: 'djh3tkfuu',
    uploadPreset: 'ml_default',
  })
}
