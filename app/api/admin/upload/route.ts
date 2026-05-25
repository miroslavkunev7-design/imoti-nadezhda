import { NextRequest, NextResponse } from 'next/server'
import { writeFile, mkdir } from 'fs/promises'
import path from 'path'
import sharp from 'sharp'
import crypto from 'crypto'
import { execute } from '@/lib/db'

const MAX_SIZE = 10 * 1024 * 1024

function getCloudinaryConfig() {
  const cloudName = (
    process.env.CLOUDINARY_CLOUD_NAME ??
    process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME ?? ''
  ).trim()
  const apiKey    = (process.env.CLOUDINARY_API_KEY ?? '').trim()
  const apiSecret = (process.env.CLOUDINARY_API_SECRET ?? '').trim()
  if (cloudName && apiKey && apiSecret) return { cloudName, apiKey, apiSecret }
  return null
}

async function uploadToCloudinary(
  buffer: Buffer,
  fileName: string
): Promise<string> {
  const cfg = getCloudinaryConfig()!
  const timestamp = Math.floor(Date.now() / 1000).toString()

  // Cloudinary signed upload: SHA1("timestamp=VALUE" + apiSecret)
  const signature = crypto
    .createHash('sha1')
    .update(`timestamp=${timestamp}${cfg.apiSecret}`)
    .digest('hex')

  const form = new FormData()
  form.append('file', new Blob([new Uint8Array(buffer)], { type: 'image/webp' }), fileName)
  form.append('api_key', cfg.apiKey)
  form.append('timestamp', timestamp)
  form.append('signature', signature)

  const res = await fetch(
    `https://api.cloudinary.com/v1_1/${cfg.cloudName}/image/upload`,
    { method: 'POST', body: form }
  )

  const json = await res.json() as { secure_url?: string; error?: { message?: string } }
  if (!json.secure_url) {
    throw new Error(json.error?.message ?? `Cloudinary грешка (HTTP ${res.status})`)
  }
  return json.secure_url
}

export async function POST(req: NextRequest) {
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

    let publicUrl: string

    const cloudinary = getCloudinaryConfig()
    if (cloudinary) {
      // Server-side upload to Cloudinary (API secret stays on server)
      publicUrl = await uploadToCloudinary(webpBuffer, fileName)
    } else if (process.env.VERCEL) {
      return NextResponse.json({
        success: false,
        error: 'Добави CLOUDINARY_CLOUD_NAME + CLOUDINARY_API_KEY + CLOUDINARY_API_SECRET в Vercel',
      }, { status: 503 })
    } else {
      // Local dev — write to public/uploads
      const dir = path.join(process.cwd(), 'public', 'uploads', 'properties')
      await mkdir(dir, { recursive: true })
      await writeFile(path.join(dir, fileName), webpBuffer)
      publicUrl = `/uploads/properties/${fileName}`
    }

    try {
      await execute(
        `INSERT INTO uploads (user_id, file_name, file_path, file_type, file_size, module)
         VALUES (?, ?, ?, ?, ?, 'property')`,
        [1, file.name, publicUrl, 'image/webp', String(file.size)]
      )
    } catch { /* uploads table optional */ }

    return NextResponse.json({ success: true, url: publicUrl, path: publicUrl })
  } catch (error) {
    console.error('[POST /api/admin/upload]', error)
    const msg = error instanceof Error ? error.message : 'Грешка при качване'
    return NextResponse.json({ success: false, error: msg }, { status: 500 })
  }
}
