/**
 * Image upload strategy (in priority order):
 *  1. Cloudinary signed upload  — uses CLOUDINARY_API_KEY + CLOUDINARY_API_SECRET (server-side)
 *  2. Cloudinary unsigned upload — uses CLOUDINARY_UPLOAD_PRESET (if set)
 *  3. Local server fallback      — /api/admin/upload (local dev only)
 */

type UploadConfig =
  | { provider: 'cloudinary'; cloudName: string; uploadPreset: string }
  | { provider: 'cloudinary-signed'; cloudName: string }
  | { provider: 'bridge' }

let _configCache: UploadConfig | null = null

async function getUploadConfig(): Promise<UploadConfig> {
  if (_configCache) return _configCache
  try {
    const res = await fetch('/api/admin/upload-config', { cache: 'no-store' })
    const json = await res.json() as UploadConfig
    _configCache = json
    return json
  } catch {
    return { provider: 'bridge' }
  }
}

async function signedCloudinaryUpload(file: File | Blob, fileName: string): Promise<string> {
  const sigRes = await fetch('/api/admin/cloudinary-signature', { cache: 'no-store' })
  const sig = await sigRes.json() as {
    configured: boolean
    cloudName?: string; apiKey?: string
    timestamp?: string; signature?: string; folder?: string
  }

  if (!sig.configured || !sig.cloudName) {
    throw new Error('Cloudinary не е конфигуриран на сървъра')
  }

  const form = new FormData()
  form.append('file', file, fileName)
  form.append('api_key', sig.apiKey!)
  form.append('timestamp', sig.timestamp!)
  form.append('signature', sig.signature!)
  form.append('folder', sig.folder!)

  const res = await fetch(
    `https://api.cloudinary.com/v1_1/${sig.cloudName}/image/upload`,
    { method: 'POST', body: form }
  )
  const json = await res.json() as { secure_url?: string; error?: { message?: string } }
  if (!json.secure_url) {
    throw new Error(json.error?.message ?? `Cloudinary грешка (HTTP ${res.status})`)
  }
  return json.secure_url
}

async function unsignedCloudinaryUpload(
  cfg: { cloudName: string; uploadPreset: string },
  file: File | Blob,
  fileName: string
): Promise<string> {
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

/** Upload one image — auto-selects best available method. */
export async function uploadPropertyImage(
  file: File | Blob,
  fileName: string
): Promise<string> {
  const config = await getUploadConfig()

  if (config.provider === 'cloudinary') {
    return unsignedCloudinaryUpload(config, file, fileName)
  }

  if (config.provider === 'cloudinary-signed') {
    return signedCloudinaryUpload(file, fileName)
  }

  // Local dev fallback
  const form = new FormData()
  form.append('file', file, fileName)
  const res = await fetch('/api/admin/upload', { method: 'POST', body: form })
  let json: { success: boolean; url?: string; error?: string }
  try { json = await res.json() as typeof json }
  catch { throw new Error(`Невалиден отговор (HTTP ${res.status})`) }
  if (!json.success || !json.url) throw new Error(json.error ?? 'Upload failed')
  return json.url
}
