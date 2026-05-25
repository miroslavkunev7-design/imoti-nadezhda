import { NextRequest, NextResponse } from 'next/server'
import { execute } from '@/lib/db'

/** Записва Cloudinary secure_url в uploads таблицата след успешно качване */
export async function POST(req: NextRequest) {
  try {
    const { url, fileName, fileSize } = await req.json()
    if (!url || typeof url !== 'string') {
      return NextResponse.json({ success: false, error: 'Missing url' }, { status: 400 })
    }

    try {
      await execute(
        `INSERT INTO uploads (user_id, file_name, file_path, file_type, file_size, module)
         VALUES (?, ?, ?, ?, ?, 'property')`,
        [1, fileName ?? 'photo', url, 'image/jpeg', String(fileSize ?? 0)]
      )
    } catch {
      // uploads table optional
    }

    return NextResponse.json({ success: true, url })
  } catch (error) {
    console.error('[POST /api/admin/upload/record]', error)
    return NextResponse.json({ success: false, error: 'Record failed' }, { status: 500 })
  }
}
