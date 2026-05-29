const CLOUDINARY_CLOUD = 'djh3tkfuu'
const UPLOAD_PRESET = 'ml_default'

/** Качва JPEG буфер в Cloudinary; при грешка връща null. */
export async function uploadPanoramaBuffer(buf: Buffer, tag: string): Promise<string | null> {
  try {
    const form = new FormData()
    const b64 = buf.toString('base64')
    form.append('file', `data:image/jpeg;base64,${b64}`)
    form.append('upload_preset', UPLOAD_PRESET)
    form.append('folder', 'virtual-tours/panoramas')
    form.append('public_id', `vtour-${tag}`)

    const url = `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD}/image/upload`
    const res = await fetch(url, { method: 'POST', body: form, signal: AbortSignal.timeout(45000) })
    if (!res.ok) return null
    const json = (await res.json()) as { secure_url?: string }
    return json.secure_url ?? null
  } catch {
    return null
  }
}
