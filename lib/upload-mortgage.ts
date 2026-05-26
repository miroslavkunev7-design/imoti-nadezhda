const CLOUDINARY_CLOUD = 'djh3tkfuu'
const UPLOAD_PRESET = 'ml_default'

export async function uploadMortgageDocument(
  file: File | Blob,
  fileName: string
): Promise<string> {
  const form = new FormData()
  form.append('file', file, fileName)
  form.append('upload_preset', UPLOAD_PRESET)

  const isPdf = fileName.toLowerCase().endsWith('.pdf')
  const resource = isPdf ? 'raw' : 'auto'
  const url = `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD}/${resource}/upload`

  const res = await fetch(url, { method: 'POST', body: form })
  if (!res.ok) {
    throw new Error(`Cloudinary грешка (HTTP ${res.status})`)
  }

  const json = await res.json() as { secure_url?: string; error?: { message?: string } }
  if (!json.secure_url) {
    throw new Error(json.error?.message ?? 'Cloudinary не върна URL')
  }

  return json.secure_url
}
