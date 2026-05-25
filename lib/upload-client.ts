/**
 * Image upload:
 *   Production → browser fetches config from /api/admin/upload-config at runtime
 *                → if Cloudinary configured: browser → Cloudinary (direct, no InfinityFree)
 *   Local dev    → fallback to /api/admin/upload (local filesystem)
 */

type UploadConfig =
  | { provider: 'cloudinary'; cloudName: string; uploadPreset: string }
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

async function uploadToCloudinary(
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

/** Upload one image. Auto-selects provider at runtime — no rebuild needed. */
export async function uploadPropertyImage(
  file: File | Blob,
  fileName: string
): Promise<string> {
  const config = await getUploadConfig()

  if (config.provider === 'cloudinary') {
    return uploadToCloudinary(config, file, fileName)
  }

  // Local dev fallback
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
