/**
 * Browser → Cloudinary (unsigned upload with preset 'ml_default')
 * After successful upload, saves the URL to the database via /api/admin/upload.
 */

const CLOUDINARY_UPLOAD_URL = 'https://api.cloudinary.com/v1_1/djh3tkfuu/image/upload'
const UPLOAD_PRESET = 'ml_default'

async function uploadToCloudinary(file: File | Blob, fileName: string): Promise<string> {
  const form = new FormData()
  form.append('file', file, fileName)
  form.append('upload_preset', UPLOAD_PRESET)

  const res = await fetch(CLOUDINARY_UPLOAD_URL, { method: 'POST', body: form })

  if (!res.ok) {
    throw new Error(`Cloudinary грешка (HTTP ${res.status})`)
  }

  const json = await res.json() as { secure_url?: string; error?: { message?: string } }
  if (!json.secure_url) {
    throw new Error(json.error?.message ?? 'Cloudinary не върна URL')
  }

  return json.secure_url
}

export async function uploadPropertyImage(
  file: File | Blob,
  fileName: string
): Promise<string> {
  const secureUrl = await uploadToCloudinary(file, fileName)

  try {
    await fetch('/api/admin/upload', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url: secureUrl, fileName }),
    })
  } catch { /* DB save is best-effort */ }

  return secureUrl
}

export async function uploadAvatarImage(
  file: File | Blob,
  fileName: string
): Promise<string> {
  return uploadToCloudinary(file, fileName)
}
