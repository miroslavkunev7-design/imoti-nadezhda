/**
 * Image upload — browser → Cloudinary (direct, no InfinityFree involved).
 * Falls back to /api/admin/upload for local dev without Cloudinary.
 */

function getCloudinaryConfig(): { cloudName: string; uploadPreset: string } | null {
  const cloudName = (process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME ?? '').trim()
  const uploadPreset = (process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET ?? '').trim()
  if (!cloudName || !uploadPreset) return null
  return { cloudName, uploadPreset }
}

async function uploadToCloudinary(file: File | Blob, fileName: string): Promise<string> {
  const cfg = getCloudinaryConfig()!

  const form = new FormData()
  form.append('file', file, fileName)
  form.append('upload_preset', cfg.uploadPreset)
  form.append('folder', 'imoti-nadezhda/properties')

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

/** Upload one image. Uses Cloudinary if configured, otherwise same-origin server fallback. */
export async function uploadPropertyImage(
  file: File | Blob,
  fileName: string
): Promise<string> {
  const cloudinary = getCloudinaryConfig()

  if (cloudinary) {
    return uploadToCloudinary(file, fileName)
  }

  // Local dev fallback — server route writes to public/uploads
  const form = new FormData()
  form.append('file', file, fileName)
  const res = await fetch('/api/admin/upload', { method: 'POST', body: form })

  let json: { success: boolean; url?: string; error?: string }
  try {
    json = await res.json() as typeof json
  } catch {
    throw new Error(`Невалиден отговор от сървъра (HTTP ${res.status})`)
  }
  if (!json.success || !json.url) throw new Error(json.error ?? 'Upload failed')
  return json.url
}
