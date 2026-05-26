import { NextRequest, NextResponse } from 'next/server'
import { execute } from '@/lib/db'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const url = (body.url ?? '').trim()
    const fileName = (body.fileName ?? '').trim()

    if (!url) {
      return NextResponse.json({ success: false, error: 'Липсва URL' }, { status: 400 })
    }

    try {
      await execute(
        `INSERT INTO uploads (user_id, file_name, file_path, file_type, file_size, module)
         VALUES (?, ?, ?, ?, ?, 'property')`,
        [1, fileName || 'image.webp', url, 'image/webp', 0]
      )
    } catch { /* uploads table optional */ }

    return NextResponse.json({ success: true, url })
  } catch (error) {
    console.error('[POST /api/admin/upload]', error)
    const msg = error instanceof Error ? error.message : 'Грешка'
    return NextResponse.json({ success: false, error: msg }, { status: 500 })
  }
}
