import { NextRequest, NextResponse } from 'next/server'
import { writeFile, mkdir } from 'fs/promises'
import path from 'path'
import sharp from 'sharp'

/** Local dev fallback — production uses direct Cloudinary upload from browser */
const MAX_SIZE = 10 * 1024 * 1024

export async function POST(req: NextRequest) {
  if (process.env.VERCEL) {
    return NextResponse.json({
      success: false,
      error: 'На production качвай директно към Cloudinary (unsigned preset ml_default)',
    }, { status: 400 })
  }

  try {
    const formData = await req.formData()
    const file = formData.get('file') as File | null

    if (!file) {
      return NextResponse.json({ success: false, error: 'Няма избран файл' }, { status: 400 })
    }
    if (!file.type.startsWith('image/')) {
      return NextResponse.json({ success: false, error: 'Само снимки' }, { status: 400 })
    }
    if (file.size > MAX_SIZE) {
      return NextResponse.json({ success: false, error: 'Максимален размер: 10 MB' }, { status: 400 })
    }

    const bytes = Buffer.from(await file.arrayBuffer())
    const webpBuffer = await sharp(bytes)
      .rotate()
      .resize(1920, 1920, { fit: 'inside', withoutEnlargement: true })
      .webp({ quality: 85 })
      .toBuffer()

    const fileName = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.webp`
    const dir = path.join(process.cwd(), 'public', 'uploads', 'properties')
    await mkdir(dir, { recursive: true })
    await writeFile(path.join(dir, fileName), webpBuffer)

    const publicUrl = `/uploads/properties/${fileName}`
    return NextResponse.json({ success: true, url: publicUrl, path: publicUrl })
  } catch (error) {
    console.error('[POST /api/admin/upload]', error)
    const msg = error instanceof Error ? error.message : 'Грешка при качване'
    return NextResponse.json({ success: false, error: msg }, { status: 500 })
  }
}
