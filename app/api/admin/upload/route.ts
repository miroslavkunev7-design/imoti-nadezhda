import { NextRequest, NextResponse } from 'next/server'
import { writeFile, mkdir } from 'fs/promises'
import path from 'path'
import sharp from 'sharp'
import { execute } from '@/lib/db'
import { isRemoteUploadConfigured, uploadToBridge } from '@/lib/upload-bridge'

const MAX_SIZE = 8 * 1024 * 1024
const ALLOWED = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/heic', 'image/heif']

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData()
    const file = formData.get('file') as File | null

    if (!file) {
      return NextResponse.json({ success: false, error: 'Няма избран файл' }, { status: 400 })
    }

    if (!ALLOWED.includes(file.type) && !file.type.startsWith('image/')) {
      return NextResponse.json({ success: false, error: 'Само снимки (JPG, PNG, WEBP)' }, { status: 400 })
    }

    if (file.size > MAX_SIZE) {
      return NextResponse.json({ success: false, error: 'Максимален размер: 8 MB' }, { status: 400 })
    }

    const bytes = Buffer.from(await file.arrayBuffer())
    const webpBuffer = await sharp(bytes)
      .rotate()
      .resize(1920, 1920, { fit: 'inside', withoutEnlargement: true })
      .webp({ quality: 85 })
      .toBuffer()

    const baseName = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
    const fileName = `${baseName}.webp`

    let publicPath: string
    let publicUrl: string

    const onVercel = Boolean(process.env.VERCEL)

    if (isRemoteUploadConfigured()) {
      const uploaded = await uploadToBridge(webpBuffer, fileName, 'image/webp')
      publicUrl = uploaded.url
      publicPath = uploaded.path.startsWith('http') ? uploaded.path : uploaded.url
    } else if (onVercel) {
      return NextResponse.json({
        success: false,
        error: 'Снимките не са настроени на Vercel. Добави DB_BRIDGE_URL + upload.php на InfinityFree, после Redeploy.',
      }, { status: 503 })
    } else {
      const dir = path.join(process.cwd(), 'public', 'uploads', 'properties')
      await mkdir(dir, { recursive: true })
      const filePath = path.join(dir, fileName)
      await writeFile(filePath, webpBuffer)
      publicPath = `/uploads/properties/${fileName}`
      publicUrl = publicPath
    }

    try {
      await execute(
        `INSERT INTO uploads (user_id, file_name, file_path, file_type, file_size, module)
         VALUES (?, ?, ?, ?, ?, 'property')`,
        [1, file.name, publicUrl, 'image/webp', String(file.size)]
      )
    } catch {
      // uploads table optional
    }

    return NextResponse.json({
      success: true,
      url: publicUrl,
      path: publicPath,
    })
  } catch (error) {
    console.error('[POST /api/admin/upload]', error)
    return NextResponse.json({ success: false, error: 'Грешка при качване' }, { status: 500 })
  }
}
