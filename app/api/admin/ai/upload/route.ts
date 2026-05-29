import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth/session'

const CLOUDINARY_CLOUD = 'djh3tkfuu'
const UPLOAD_PRESET = 'ml_default'

export async function POST(req: NextRequest) {
  const session = await getSession()
  if (!session) {
    return NextResponse.json({ success: false, error: 'Неоторизиран' }, { status: 401 })
  }

  try {
    const form = await req.formData()
    const file = form.get('file')
    if (!file || !(file instanceof Blob)) {
      return NextResponse.json({ success: false, error: 'Няма файл' }, { status: 400 })
    }

    const name = form.get('name')?.toString() || 'upload'
    const buf = Buffer.from(await file.arrayBuffer())
    const b64 = buf.toString('base64')
    const mime = file.type || 'application/octet-stream'
    const isImage = mime.startsWith('image/')

    const uploadForm = new FormData()
    uploadForm.append('file', `data:${mime};base64,${b64}`)
    uploadForm.append('upload_preset', UPLOAD_PRESET)
    uploadForm.append('folder', `milena/${session.id}`)
    uploadForm.append('public_id', `m-${Date.now()}`)

    const resource = isImage ? 'image' : 'auto'
    const url = `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD}/${resource}/upload`
    const res = await fetch(url, { method: 'POST', body: uploadForm, signal: AbortSignal.timeout(60_000) })
    const json = await res.json()
    if (!json.secure_url) {
      return NextResponse.json({ success: false, error: json.error?.message ?? 'Качването не успя' }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      url: json.secure_url as string,
      name,
      type: mime,
    })
  } catch (e) {
    console.error('[POST /api/admin/ai/upload]', e)
    return NextResponse.json({ success: false, error: 'Грешка при качване' }, { status: 500 })
  }
}
