import { NextResponse } from 'next/server'
import { incrementViews } from '@/lib/queries/properties'

export async function POST(
  _req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id)
    if (isNaN(id)) return NextResponse.json({ success: false }, { status: 400 })
    await incrementViews(id)
    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ success: false }, { status: 500 })
  }
}
