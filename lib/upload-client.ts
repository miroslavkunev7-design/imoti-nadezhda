/**
 * Browser → Cloudinary (unsigned upload preset ml_default)
 */

const CLOUDINARY_UPLOAD_URL =
  'https://api.cloudinary.com/v1_1/djh3tkfuu/image/upload'
const UPLOAD_PRESET = 'ml_default'

export async function uploadPropertyImage(
  file: File | Blob,
  fileName: string
): Promise<string> {
  const form = new FormData()
  form.append('file', file, fileName)
  form.append('upload_preset', UPLOAD_PRESET)

  const res = await fetch(CLOUDINARY_UPLOAD_URL, { method: 'POST', body: form })
  const json = await res.json() as {
    secure_url?: string
    error?: { message?: string }
  }

  if (!res.ok || !json.secure_url) {
    throw new Error(json.error?.message ?? `Cloudinary грешка (HTTP ${res.status})`)
  }

  // Запиши URL в базата (uploads таблица — optional)
  void fetch('/api/admin/upload/record', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      url: json.secure_url,
      fileName: file instanceof File ? file.name : fileName,
      fileSize: file instanceof File ? file.size : 0,
    }),
  }).catch(() => {})

  return json.secure_url
}
